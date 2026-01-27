'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  validateVideoFile,
  validateThumbnailFile,
  generateVideoFilename,
  generateThumbnailFilename,
  getVideoExtension,
} from '@/lib/utils/videoValidation'
import type { TherapistVideo, SessionFormat, VideoFeedItem } from '@/lib/types/videos'
import { uploadFile, deleteFile, getPublicUrl, extractR2Path, parsePath } from '@/lib/r2/storage'

type ActionResponse = {
  success: boolean
  error?: string
}

type VideoUploadResponse = ActionResponse & {
  videoId?: string
  videoUrl?: string
}

const videoUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  session_format: z.array(z.enum(['in-person', 'online', 'phone'])).optional(),
  duration_seconds: z.number().min(3).max(90).optional(),
})

const videoUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  session_format: z.array(z.enum(['in-person', 'online', 'phone'])).optional(),
})

// Generate URL-friendly slug from title
function generateVideoSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/^-|-$/g, '')
  return `${base}-${id.substring(0, 8)}`
}

// Get user's therapist profile
async function getTherapistProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()
  return profile
}

// Upload video action
export async function uploadVideoAction(
  prevState: any,
  formData: FormData
): Promise<VideoUploadResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get therapist profile
    const profile = await getTherapistProfile(supabase, user.id)
    if (!profile) {
      return { success: false, error: 'Therapist profile not found. Please create a profile first.' }
    }

    // Get video file
    const videoFile = formData.get('video') as File
    if (!videoFile || videoFile.size === 0) {
      return { success: false, error: 'No video file provided' }
    }

    // Validate video file
    const videoValidation = validateVideoFile(videoFile)
    if (!videoValidation.valid) {
      return { success: false, error: videoValidation.error }
    }

    // Parse form data
    const sessionFormatStr = formData.get('session_format') as string
    const rawData = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      session_format: sessionFormatStr ? JSON.parse(sessionFormatStr) : undefined,
      duration_seconds: formData.get('duration_seconds')
        ? Number(formData.get('duration_seconds'))
        : undefined,
    }

    const validation = videoUploadSchema.safeParse(rawData)
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' }
    }

    const { title, description, session_format, duration_seconds } = validation.data

    // Sanitize inputs
    const sanitizedTitle = title.replace(/[<>]/g, '')
    const sanitizedDescription = description?.replace(/[<>]/g, '')

    // Generate video filename and upload
    const extension = getVideoExtension(videoFile.type)
    const videoFilename = generateVideoFilename(user.id, extension)

    // Convert File to Buffer for R2 upload
    const videoArrayBuffer = await videoFile.arrayBuffer()
    const videoBuffer = Buffer.from(videoArrayBuffer)

    const videoUploadResult = await uploadFile('therapist-videos', videoFilename, videoBuffer, {
      contentType: videoFile.type,
      cacheControl: 'max-age=3600',
    })

    if (!videoUploadResult.success) {
      console.error('Video upload error:', videoUploadResult.error)
      return { success: false, error: 'Failed to upload video' }
    }

    // Get public URL
    const videoUrl = getPublicUrl('therapist-videos', videoFilename)

    // Handle thumbnail if provided
    let thumbnailUrl: string | null = null
    let thumbnailFilename: string | null = null
    const thumbnailFile = formData.get('thumbnail') as File
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbValidation = validateThumbnailFile(thumbnailFile)
      if (thumbValidation.valid) {
        // We'll generate the thumbnail filename after we have the video ID
        // For now, use a temp ID
        const tempId = crypto.randomUUID()
        thumbnailFilename = generateThumbnailFilename(user.id, tempId)

        // Convert File to Buffer
        const thumbArrayBuffer = await thumbnailFile.arrayBuffer()
        const thumbBuffer = Buffer.from(thumbArrayBuffer)

        const thumbUploadResult = await uploadFile('video-thumbnails', thumbnailFilename, thumbBuffer, {
          contentType: thumbnailFile.type,
          cacheControl: 'max-age=3600',
        })

        if (thumbUploadResult.success) {
          thumbnailUrl = getPublicUrl('video-thumbnails', thumbnailFilename)
        }
      }
    }

    // Create database record (first without slug to get the ID)
    const { data: video, error: insertError } = await supabase
      .from('therapist_videos')
      .insert({
        therapist_profile_id: profile.id,
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration_seconds: duration_seconds || null,
        session_format: session_format || [],
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    // Generate and update slug after we have the ID
    if (video) {
      const slug = generateVideoSlug(sanitizedTitle, video.id)
      await supabase
        .from('therapist_videos')
        .update({ slug })
        .eq('id', video.id)
    }

    if (insertError) {
      // Rollback: delete uploaded video and thumbnail
      await deleteFile('therapist-videos', videoFilename)
      if (thumbnailFilename) {
        await deleteFile('video-thumbnails', thumbnailFilename)
      }
      console.error('Database insert error:', insertError)
      return { success: false, error: 'Failed to save video' }
    }

    revalidatePath('/dashboard/videos')
    revalidatePath('/videos')

    return {
      success: true,
      videoId: video.id,
      videoUrl,
    }
  } catch (err) {
    console.error('Video upload error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update video action
export async function updateVideoAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const videoId = formData.get('videoId') as string
    if (!videoId) {
      return { success: false, error: 'Video ID required' }
    }

    // Parse form data
    const sessionFormatStr = formData.get('session_format') as string
    const rawData = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      session_format: sessionFormatStr ? JSON.parse(sessionFormatStr) : undefined,
    }

    const validation = videoUpdateSchema.safeParse(rawData)
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' }
    }

    const { title, description, session_format } = validation.data

    // Sanitize inputs
    const sanitizedTitle = title.replace(/[<>]/g, '')
    const sanitizedDescription = description?.replace(/[<>]/g, '')

    // Update video (RLS ensures user can only update their own)
    const { error: updateError } = await supabase
      .from('therapist_videos')
      .update({
        title: sanitizedTitle,
        description: sanitizedDescription || null,
        session_format: session_format || [],
      })
      .eq('id', videoId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Video update error:', updateError)
      return { success: false, error: 'Failed to update video' }
    }

    revalidatePath('/dashboard/videos')
    revalidatePath('/videos')

    return { success: true }
  } catch (err) {
    console.error('Video update error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete video action
export async function deleteVideoAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const videoId = formData.get('videoId') as string
    if (!videoId) {
      return { success: false, error: 'Video ID required' }
    }

    // Get video to find file paths
    const { data: video } = await supabase
      .from('therapist_videos')
      .select('video_url, thumbnail_url')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single()

    if (!video) {
      return { success: false, error: 'Video not found' }
    }

    // Delete from database first
    const { error: deleteError } = await supabase
      .from('therapist_videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Video delete error:', deleteError)
      return { success: false, error: 'Failed to delete video' }
    }

    // Delete video file from R2 storage
    if (video.video_url) {
      try {
        const fullPath = extractR2Path(video.video_url)
        if (fullPath) {
          const parsed = parsePath(fullPath)
          if (parsed) {
            await deleteFile(parsed.folder, parsed.filename)
          }
        }
      } catch (err) {
        console.warn('Failed to delete video file:', err)
      }
    }

    // Delete thumbnail from R2 storage
    if (video.thumbnail_url) {
      try {
        const fullPath = extractR2Path(video.thumbnail_url)
        if (fullPath) {
          const parsed = parsePath(fullPath)
          if (parsed) {
            await deleteFile(parsed.folder, parsed.filename)
          }
        }
      } catch (err) {
        console.warn('Failed to delete thumbnail:', err)
      }
    }

    revalidatePath('/dashboard/videos')
    revalidatePath('/videos')

    return { success: true }
  } catch (err) {
    console.error('Video delete error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get user's videos
export async function getUserVideos(): Promise<TherapistVideo[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data: videos, error } = await supabase
      .from('therapist_videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching videos:', error)
      return []
    }

    return (videos || []) as TherapistVideo[]
  } catch (err) {
    console.error('Error fetching videos:', err)
    return []
  }
}

// Get single video by ID
export async function getVideoById(videoId: string): Promise<TherapistVideo | null> {
  try {
    const supabase = await createClient()

    const { data: video, error } = await supabase
      .from('therapist_videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (error) {
      console.error('Error fetching video:', error)
      return null
    }

    return video as TherapistVideo
  } catch (err) {
    console.error('Error fetching video:', err)
    return null
  }
}

// Get single video by slug with therapist data for public viewing
export async function getVideoBySlug(slug: string): Promise<VideoFeedItem | null> {
  try {
    const supabase = await createClient()

    const { data: video, error } = await supabase
      .from('therapist_videos')
      .select(`
        id,
        slug,
        title,
        description,
        video_url,
        thumbnail_url,
        duration_seconds,
        session_format,
        created_at,
        published_at,
        therapist_profile_id,
        therapist_profiles!inner (
          slug,
          session_format,
          users!inner (
            name,
            photo_url
          )
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !video) {
      console.error('Error fetching video:', error)
      return null
    }

    const profile = video.therapist_profiles as any
    const user = profile.users

    return {
      id: video.id,
      slug: video.slug,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds,
      session_format: video.session_format,
      created_at: video.created_at,
      published_at: video.published_at,
      therapist_profile_id: video.therapist_profile_id,
      therapist_name: user?.name || 'Therapist',
      therapist_slug: profile.slug,
      therapist_photo_url: user?.photo_url || null,
      therapist_session_format: profile.session_format,
      total_count: 1,
    } as VideoFeedItem
  } catch (err) {
    console.error('Error fetching video:', err)
    return null
  }
}

// Get single video by ID with therapist data for public viewing (legacy)
export async function getVideoByIdPublic(videoId: string): Promise<VideoFeedItem | null> {
  try {
    const supabase = await createClient()

    const { data: video, error } = await supabase
      .from('therapist_videos')
      .select(`
        id,
        slug,
        title,
        description,
        video_url,
        thumbnail_url,
        duration_seconds,
        session_format,
        created_at,
        published_at,
        therapist_profile_id,
        therapist_profiles!inner (
          slug,
          session_format,
          users!inner (
            name,
            photo_url
          )
        )
      `)
      .eq('id', videoId)
      .eq('status', 'published')
      .single()

    if (error || !video) {
      console.error('Error fetching video:', error)
      return null
    }

    const profile = video.therapist_profiles as any
    const user = profile.users

    return {
      id: video.id,
      slug: video.slug,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds,
      session_format: video.session_format,
      created_at: video.created_at,
      published_at: video.published_at,
      therapist_profile_id: video.therapist_profile_id,
      therapist_name: user?.name || 'Therapist',
      therapist_slug: profile.slug,
      therapist_photo_url: user?.photo_url || null,
      therapist_session_format: profile.session_format,
      total_count: 1,
    } as VideoFeedItem
  } catch (err) {
    console.error('Error fetching video:', err)
    return null
  }
}

// Get related videos from same therapist
export async function getRelatedVideos(
  therapistProfileId: string,
  excludeVideoId?: string,
  limit: number = 8
): Promise<VideoFeedItem[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('therapist_videos')
      .select(`
        id,
        slug,
        title,
        description,
        video_url,
        thumbnail_url,
        duration_seconds,
        session_format,
        created_at,
        published_at,
        therapist_profile_id,
        therapist_profiles!inner (
          slug,
          session_format,
          users!inner (
            name,
            photo_url
          )
        )
      `)
      .eq('therapist_profile_id', therapistProfileId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (excludeVideoId) {
      query = query.neq('id', excludeVideoId)
    }

    const { data: videos, error } = await query

    if (error || !videos) {
      console.error('Error fetching related videos:', error)
      return []
    }

    return videos.map((video: any) => {
      const profile = video.therapist_profiles
      const user = profile.users
      return {
        id: video.id,
        slug: video.slug,
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        duration_seconds: video.duration_seconds,
        session_format: video.session_format,
        created_at: video.created_at,
        published_at: video.published_at,
        therapist_profile_id: video.therapist_profile_id,
        therapist_name: user?.name || 'Therapist',
        therapist_slug: profile.slug,
        therapist_photo_url: user?.photo_url || null,
        therapist_session_format: profile.session_format,
        total_count: videos.length,
      } as VideoFeedItem
    })
  } catch (err) {
    console.error('Error fetching related videos:', err)
    return []
  }
}

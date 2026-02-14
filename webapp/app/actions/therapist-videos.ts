'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  generateVideoFilename,
  generateThumbnailFilename,
  getVideoExtension,
} from '@/lib/utils/videoValidation'
import type { TherapistVideo, TherapistVideoWithServices, SessionFormat, VideoFeedItem } from '@/lib/types/videos'
import { deleteFile, getPublicUrl, extractR2Path, parsePath, generatePresignedUploadUrl, fileExists } from '@/lib/r2/storage'

type ActionResponse = {
  success: boolean
  error?: string
}

type UploadUrlResponse = ActionResponse & {
  videoUploadUrl?: string
  videoFilename?: string
  thumbnailUploadUrl?: string
  thumbnailFilename?: string
}

type CompleteUploadResponse = ActionResponse & {
  videoId?: string
}

const videoMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  session_format: z.array(z.enum(['in-person', 'online', 'phone'])).optional(),
  duration_seconds: z.number().min(3).max(120).optional(),
  orientation: z.enum(['landscape', 'portrait']).optional(),
  tags: z.array(z.string().max(50, 'Each tag must be 50 characters or less')).max(5, 'Maximum 5 tags allowed').optional(),
  service_ids: z.array(z.string().uuid()).optional(),
})

const videoUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  session_format: z.array(z.enum(['in-person', 'online', 'phone'])).optional(),
  tags: z.array(z.string().max(50, 'Each tag must be 50 characters or less')).max(5, 'Maximum 5 tags allowed').optional(),
  service_ids: z.array(z.string().uuid()).optional(),
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

// Get presigned URLs for direct client-to-R2 upload
export async function getVideoUploadUrl(
  videoContentType: string,
  includeThumbnail: boolean = false
): Promise<UploadUrlResponse> {
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

    // Generate video filename and presigned URL
    const extension = getVideoExtension(videoContentType)
    const videoFilename = generateVideoFilename(user.id, extension)
    const videoUploadUrl = await generatePresignedUploadUrl(
      'therapist-videos',
      videoFilename,
      videoContentType
    )

    // Generate thumbnail presigned URL if requested
    let thumbnailUploadUrl: string | undefined
    let thumbnailFilename: string | undefined
    if (includeThumbnail) {
      const tempId = crypto.randomUUID()
      thumbnailFilename = generateThumbnailFilename(user.id, tempId)
      thumbnailUploadUrl = await generatePresignedUploadUrl(
        'video-thumbnails',
        thumbnailFilename,
        'image/jpeg'
      )
    }

    return {
      success: true,
      videoUploadUrl,
      videoFilename,
      thumbnailUploadUrl,
      thumbnailFilename,
    }
  } catch (err) {
    console.error('Error generating upload URL:', err)
    return { success: false, error: 'Failed to generate upload URL' }
  }
}

// Complete video upload after files are uploaded directly to R2
export async function completeVideoUpload(data: {
  videoFilename: string
  thumbnailFilename?: string
  title: string
  description?: string
  session_format?: string[]
  duration_seconds?: number
  orientation?: string
  tags?: string[]
  service_ids?: string[]
}): Promise<CompleteUploadResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get therapist profile
    const profile = await getTherapistProfile(supabase, user.id)
    if (!profile) {
      return { success: false, error: 'Therapist profile not found' }
    }

    // Validate metadata
    const validation = videoMetadataSchema.safeParse({
      title: data.title,
      description: data.description || undefined,
      session_format: data.session_format,
      duration_seconds: data.duration_seconds,
      orientation: data.orientation,
      tags: data.tags,
      service_ids: data.service_ids,
    })
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' }
    }

    const { title, description, session_format, duration_seconds, orientation, tags, service_ids } = validation.data

    // Sanitize inputs
    const sanitizedTitle = title.replace(/[<>]/g, '')
    const sanitizedDescription = description?.replace(/[<>]/g, '')
    const sanitizedTags = (tags || [])
      .map(t => t.trim().replace(/[<>]/g, ''))
      .filter(t => t.length > 0)
      .filter((t, i, arr) => arr.indexOf(t) === i)

    // Verify video was uploaded to R2
    const videoExists = await fileExists('therapist-videos', data.videoFilename)
    if (!videoExists) {
      return { success: false, error: 'Video file not found. Upload may have failed.' }
    }

    // Get public URLs
    const videoUrl = getPublicUrl('therapist-videos', data.videoFilename)
    let thumbnailUrl: string | null = null
    if (data.thumbnailFilename) {
      const thumbExists = await fileExists('video-thumbnails', data.thumbnailFilename)
      if (thumbExists) {
        thumbnailUrl = getPublicUrl('video-thumbnails', data.thumbnailFilename)
      }
    }

    // Create database record
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
        orientation: orientation || 'landscape',
        status: 'published',
        published_at: new Date().toISOString(),
        tags: sanitizedTags,
      })
      .select('id')
      .single()

    if (insertError) {
      // Rollback: delete uploaded files
      await deleteFile('therapist-videos', data.videoFilename)
      if (data.thumbnailFilename) {
        await deleteFile('video-thumbnails', data.thumbnailFilename)
      }
      console.error('Database insert error:', insertError)
      return { success: false, error: 'Failed to save video' }
    }

    // Generate and update slug
    if (video) {
      const slug = generateVideoSlug(sanitizedTitle, video.id)
      await supabase
        .from('therapist_videos')
        .update({ slug })
        .eq('id', video.id)

      // Link services to video
      if (service_ids && service_ids.length > 0) {
        const videoServiceRows = service_ids.map(serviceId => ({
          video_id: video.id,
          service_id: serviceId,
        }))
        const { error: vsError } = await supabase
          .from('video_services')
          .insert(videoServiceRows)
        if (vsError) {
          console.error('Error linking services to video:', vsError)
        }
      }
    }

    revalidatePath('/dashboard/practice')
    revalidatePath('/videos')

    return {
      success: true,
      videoId: video.id,
    }
  } catch (err) {
    console.error('Complete upload error:', err)
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
    const tagsStr = formData.get('tags') as string
    const serviceIdsStr = formData.get('service_ids') as string
    const rawData = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      session_format: sessionFormatStr ? JSON.parse(sessionFormatStr) : undefined,
      tags: tagsStr ? JSON.parse(tagsStr) : undefined,
      service_ids: serviceIdsStr ? JSON.parse(serviceIdsStr) : undefined,
    }

    const validation = videoUpdateSchema.safeParse(rawData)
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' }
    }

    const { title, description, session_format, tags, service_ids } = validation.data

    // Sanitize inputs
    const sanitizedTitle = title.replace(/[<>]/g, '')
    const sanitizedDescription = description?.replace(/[<>]/g, '')
    const sanitizedTags = (tags || [])
      .map(t => t.trim().replace(/[<>]/g, ''))
      .filter(t => t.length > 0)
      .filter((t, i, arr) => arr.indexOf(t) === i)

    // Update video (RLS ensures user can only update their own)
    const { error: updateError } = await supabase
      .from('therapist_videos')
      .update({
        title: sanitizedTitle,
        description: sanitizedDescription || null,
        session_format: session_format || [],
        tags: sanitizedTags,
      })
      .eq('id', videoId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Video update error:', updateError)
      return { success: false, error: 'Failed to update video' }
    }

    // Update service links (delete and reinsert)
    await supabase
      .from('video_services')
      .delete()
      .eq('video_id', videoId)

    if (service_ids && service_ids.length > 0) {
      const videoServiceRows = service_ids.map(serviceId => ({
        video_id: videoId,
        service_id: serviceId,
      }))
      const { error: vsError } = await supabase
        .from('video_services')
        .insert(videoServiceRows)
      if (vsError) {
        console.error('Error linking services to video:', vsError)
      }
    }

    revalidatePath('/dashboard/practice')
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

// Get user's videos with linked service IDs
export async function getUserVideos(): Promise<TherapistVideoWithServices[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data: videos, error } = await supabase
      .from('therapist_videos')
      .select('*, video_services(service_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching videos:', error)
      return []
    }

    return (videos || []).map((v: any) => ({
      ...v,
      service_ids: (v.video_services || []).map((vs: any) => vs.service_id),
      video_services: undefined,
    })) as TherapistVideoWithServices[]
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
        orientation,
        tags,
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
        ),
        video_services (
          therapist_services (
            id,
            name,
            image_url,
            service_type,
            price_display_mode,
            price,
            price_min,
            price_max,
            session_count,
            show_per_session_price,
            is_featured,
            show_price
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
      orientation: (video.orientation as 'landscape' | 'portrait') || 'landscape',
      created_at: video.created_at,
      published_at: video.published_at,
      therapist_profile_id: video.therapist_profile_id,
      therapist_name: user?.name || 'Therapist',
      therapist_slug: profile.slug,
      therapist_photo_url: user?.photo_url || null,
      therapist_session_format: profile.session_format,
      total_count: 1,
      tags: video.tags || null,
      services: ((video as any).video_services || [])
        .map((vs: any) => vs.therapist_services)
        .filter(Boolean),
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
        orientation,
        tags,
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
        ),
        video_services (
          therapist_services (
            id,
            name,
            image_url,
            service_type,
            price_display_mode,
            price,
            price_min,
            price_max,
            session_count,
            show_per_session_price,
            is_featured,
            show_price
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
      orientation: (video.orientation as 'landscape' | 'portrait') || 'landscape',
      created_at: video.created_at,
      published_at: video.published_at,
      therapist_profile_id: video.therapist_profile_id,
      therapist_name: user?.name || 'Therapist',
      therapist_slug: profile.slug,
      therapist_photo_url: user?.photo_url || null,
      therapist_session_format: profile.session_format,
      total_count: 1,
      tags: video.tags || null,
      services: ((video as any).video_services || [])
        .map((vs: any) => vs.therapist_services)
        .filter(Boolean),
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
        orientation,
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
        orientation: video.orientation || 'landscape',
        created_at: video.created_at,
        published_at: video.published_at,
        therapist_profile_id: video.therapist_profile_id,
        therapist_name: user?.name || 'Therapist',
        therapist_slug: profile.slug,
        therapist_photo_url: user?.photo_url || null,
        therapist_session_format: profile.session_format,
        total_count: videos.length,
        tags: null,
        services: null,
      } as VideoFeedItem
    })
  } catch (err) {
    console.error('Error fetching related videos:', err)
    return []
  }
}

// Get videos by tag
export async function getVideosByTag(
  tag: string,
  limit: number = 50
): Promise<VideoFeedItem[]> {
  try {
    const supabase = await createClient()

    const { data: videos, error } = await supabase
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
        orientation,
        tags,
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
      .eq('status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error || !videos) {
      console.error('Error fetching videos by tag:', error)
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
        orientation: video.orientation || 'landscape',
        created_at: video.created_at,
        published_at: video.published_at,
        therapist_profile_id: video.therapist_profile_id,
        therapist_name: user?.name || 'Therapist',
        therapist_slug: profile.slug,
        therapist_photo_url: user?.photo_url || null,
        therapist_session_format: profile.session_format,
        total_count: videos.length,
        tags: video.tags || null,
        services: null,
      } as VideoFeedItem
    })
  } catch (err) {
    console.error('Error fetching videos by tag:', err)
    return []
  }
}

// Fetch therapist contact/booking data for video detail page
export async function getTherapistContactInfo(therapistProfileId: string): Promise<{
  acceptsOnlineBooking: boolean
  offersFreeConsultation: boolean
  bookingUrl: string | null
} | null> {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('therapist_profiles')
      .select(`
        offers_free_consultation,
        booking_url,
        therapist_booking_settings(accepts_online_booking)
      `)
      .eq('id', therapistProfileId)
      .eq('is_published', true)
      .single()

    if (error || !profile) {
      return null
    }

    const bookingSettings = profile.therapist_booking_settings as unknown as {
      accepts_online_booking: boolean | null
    } | null

    return {
      acceptsOnlineBooking: bookingSettings?.accepts_online_booking === true,
      offersFreeConsultation: profile.offers_free_consultation === true,
      bookingUrl: (profile as any).booking_url || null,
    }
  } catch (err) {
    console.error('Error fetching therapist contact info:', err)
    return null
  }
}

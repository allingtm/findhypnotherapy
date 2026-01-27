'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { validateImageFile, getFileExtension } from '@/lib/utils/fileValidation'
import { generateBannerFilename } from '@/lib/utils/imageCrop'
import { uploadFile, deleteFile, getPublicUrl, extractR2Path, parsePath } from '@/lib/r2/storage'

// Response type for form actions
type ActionResponse = {
  success: boolean
  error?: string
}

// Response type for banner upload
type BannerUploadResponse = ActionResponse & {
  bannerUrl?: string
}

// Therapist profile update schema
const therapistProfileSchema = z.object({
  professional_title: z.string().max(100, 'Title must be 100 characters or less').optional().or(z.literal('')),
  credentials: z.array(z.string()).optional(),
  years_experience: z.coerce.number().int().min(0).max(100).optional().nullable(),
  bio: z.string().max(5000, 'Bio must be 5000 characters or less').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  booking_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  address_line1: z.string().max(200).optional().or(z.literal('')),
  address_line2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state_province: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  address_visibility: z.enum(['full', 'city_only', 'hidden']).optional(),
  session_format: z.array(z.enum(['in-person', 'online', 'phone'])).optional(),
  offers_free_consultation: z.coerce.boolean().optional(),
  availability_notes: z.string().max(1000).optional().or(z.literal('')),
  meta_description: z.string().max(160).optional().or(z.literal('')),
})

// Get or create therapist profile
export async function getOrCreateTherapistProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { profile: null, error: 'Not authenticated' }
  }

  // Try to get existing profile
  const { data: profile, error: fetchError } = await supabase
    .from('therapist_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profile) {
    return { profile, error: null }
  }

  // Create new profile if doesn't exist
  if (fetchError?.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('therapist_profiles')
      .insert({ user_id: user.id })
      .select()
      .single()

    if (createError) {
      return { profile: null, error: 'Failed to create profile' }
    }

    return { profile: newProfile, error: null }
  }

  return { profile: null, error: fetchError?.message || 'Failed to fetch profile' }
}

// Update therapist profile action
export async function updateTherapistProfileAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Parse credentials from comma-separated string
    const credentialsRaw = formData.get('credentials') as string
    const credentials = credentialsRaw
      ? credentialsRaw.split(',').map(c => c.trim()).filter(Boolean)
      : []

    // Parse session formats
    const sessionFormats = formData.getAll('session_format') as string[]

    // Parse form data
    const rawData = {
      professional_title: formData.get('professional_title') || '',
      credentials,
      years_experience: formData.get('years_experience') || null,
      bio: formData.get('bio') || '',
      phone: formData.get('phone') || '',
      website_url: formData.get('website_url') || '',
      booking_url: formData.get('booking_url') || '',
      address_line1: formData.get('address_line1') || '',
      address_line2: formData.get('address_line2') || '',
      city: formData.get('city') || '',
      state_province: formData.get('state_province') || '',
      postal_code: formData.get('postal_code') || '',
      country: formData.get('country') || 'United Kingdom',
      address_visibility: (formData.get('address_visibility') as 'full' | 'city_only' | 'hidden') || 'full',
      session_format: sessionFormats,
      offers_free_consultation: formData.get('offers_free_consultation') === 'true',
      availability_notes: formData.get('availability_notes') || '',
      meta_description: formData.get('meta_description') || '',
    }

    const validation = therapistProfileSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data

    // Sanitize text fields
    const sanitize = (str: string | undefined) => str?.replace(/[<>]/g, '') || null

    // Update profile
    const { error: updateError } = await supabase
      .from('therapist_profiles')
      .update({
        professional_title: sanitize(data.professional_title),
        credentials: data.credentials || [],
        years_experience: data.years_experience || null,
        bio: sanitize(data.bio),
        phone: sanitize(data.phone),
        website_url: data.website_url || null,
        booking_url: data.booking_url || null,
        address_line1: sanitize(data.address_line1),
        address_line2: sanitize(data.address_line2),
        city: sanitize(data.city),
        state_province: sanitize(data.state_province),
        postal_code: sanitize(data.postal_code),
        country: sanitize(data.country) || 'United Kingdom',
        address_visibility: data.address_visibility || 'full',
        session_format: data.session_format || [],
        offers_free_consultation: data.offers_free_consultation || false,
        availability_notes: sanitize(data.availability_notes),
        meta_description: sanitize(data.meta_description),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Profile update error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update specializations action
export async function updateSpecializationsAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get therapist profile
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Get selected specialization IDs
    const specializationIds = formData.getAll('specializations') as string[]

    // Delete existing specializations
    await supabase
      .from('therapist_specializations')
      .delete()
      .eq('therapist_profile_id', profile.id)

    // Insert new specializations
    if (specializationIds.length > 0) {
      const { error: insertError } = await supabase
        .from('therapist_specializations')
        .insert(
          specializationIds.map((specId, index) => ({
            therapist_profile_id: profile.id,
            specialization_id: specId,
            is_primary: index === 0, // First one is primary
          }))
        )

      if (insertError) {
        console.error('Specialization insert error:', insertError)
        return { success: false, error: 'Failed to update specialisations' }
      }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Specializations update error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Toggle profile publish status
export async function togglePublishProfileAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const shouldPublish = formData.get('publish') === 'true'

    // Get current profile
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('id, is_published, slug')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // If publishing, check for at least one active service
    if (shouldPublish) {
      const { data: services, error: servicesError } = await supabase
        .from('therapist_services')
        .select('id')
        .eq('therapist_profile_id', profile.id)
        .eq('is_active', true)
        .limit(1)

      if (servicesError || !services || services.length === 0) {
        return { success: false, error: 'Please add at least one service before publishing your profile' }
      }
    }

    // If publishing for first time, generate slug
    let slug = profile.slug
    if (shouldPublish && !slug) {
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()

      if (userData?.name) {
        const { data: generatedSlug } = await supabase
          .rpc('generate_profile_slug', {
            user_name: userData.name,
            profile_user_id: user.id
          })
        slug = generatedSlug
      }
    }

    // Update publish status
    const { error: updateError } = await supabase
      .from('therapist_profiles')
      .update({
        is_published: shouldPublish,
        slug: slug,
        published_at: shouldPublish ? new Date().toISOString() : null,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Publish toggle error:', updateError)
      return { success: false, error: 'Failed to update publish status' }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')
    if (slug) {
      revalidatePath(`/directory/${slug}`)
    }

    return { success: true }
  } catch (err) {
    console.error('Publish toggle error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get all active specializations
export async function getSpecializations() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('specializations')
    .select('id, name, slug, category')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Error fetching specializations:', error)
    return []
  }

  return data || []
}

// Get therapist's selected specializations
export async function getTherapistSpecializations(profileId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('therapist_specializations')
    .select('specialization_id, is_primary')
    .eq('therapist_profile_id', profileId)

  if (error) {
    console.error('Error fetching therapist specializations:', error)
    return []
  }

  return data || []
}

// Upload banner action
export async function uploadBannerAction(
  prevState: any,
  formData: FormData
): Promise<BannerUploadResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const file = formData.get('banner') as File

    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'No file provided',
      }
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Generate unique filename
    const fileExtension = getFileExtension(file.type)
    const filename = generateBannerFilename(user.id, fileExtension)

    // Get current banner_url to delete later
    const { data: currentProfile } = await supabase
      .from('therapist_profiles')
      .select('banner_url')
      .eq('user_id', user.id)
      .single()

    // Convert File to Buffer for R2 upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to R2 Storage
    const uploadResult = await uploadFile('profile-banners', filename, buffer, {
      contentType: file.type,
      cacheControl: 'max-age=3600',
    })

    if (!uploadResult.success) {
      console.error('Banner upload error:', uploadResult.error)
      return {
        success: false,
        error: 'Failed to upload banner',
      }
    }

    // Get public URL
    const publicUrl = getPublicUrl('profile-banners', filename)

    // Update therapist profile with new banner URL
    const { error: updateError } = await supabase
      .from('therapist_profiles')
      .update({ banner_url: publicUrl })
      .eq('user_id', user.id)

    if (updateError) {
      // Rollback: delete uploaded file
      await deleteFile('profile-banners', filename)

      return {
        success: false,
        error: 'Failed to update profile',
      }
    }

    // Delete old banner if exists
    if (currentProfile?.banner_url) {
      try {
        const oldPath = extractR2Path(currentProfile.banner_url)
        if (oldPath) {
          const parsed = parsePath(oldPath)
          if (parsed) {
            await deleteFile(parsed.folder, parsed.filename)
          }
        }
      } catch (err) {
        // Non-critical error, log but don't fail
        console.warn('Failed to delete old banner:', err)
      }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return {
      success: true,
      bannerUrl: publicUrl,
    }
  } catch (err) {
    console.error('Banner upload error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Delete banner action
export async function deleteBannerAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Get current banner URL
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('banner_url')
      .eq('user_id', user.id)
      .single()

    if (!profile?.banner_url) {
      return {
        success: false,
        error: 'No banner to delete',
      }
    }

    // Delete from R2 storage
    try {
      const fullPath = extractR2Path(profile.banner_url)
      if (fullPath) {
        const parsed = parsePath(fullPath)
        if (parsed) {
          await deleteFile(parsed.folder, parsed.filename)
        }
      }
    } catch (err) {
      console.warn('Failed to delete banner file:', err)
    }

    // Update profile to remove banner URL
    const { error: updateError } = await supabase
      .from('therapist_profiles')
      .update({ banner_url: null })
      .eq('user_id', user.id)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update profile',
      }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Banner delete error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

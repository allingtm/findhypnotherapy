'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { validateImageFile, getFileExtension } from '@/lib/utils/fileValidation'
import { generateServiceImageFilename } from '@/lib/utils/imageCrop'

// Response type for form actions
type ActionResponse = {
  success: boolean
  error?: string
  data?: unknown
}

// Response type for service image upload
type ServiceImageUploadResponse = ActionResponse & {
  imageUrl?: string
}

// Service type and price display mode enums
const serviceTypeValues = ['single_session', 'package', 'programme', 'consultation', 'subscription'] as const
const priceDisplayModeValues = ['exact', 'from', 'range', 'contact', 'free'] as const

// Service validation schema
const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().or(z.literal('')),
  short_description: z.string().max(100, 'Short description must be 100 characters or less').optional().or(z.literal('')),

  // Service classification
  service_type: z.enum(serviceTypeValues).default('single_session'),
  price_display_mode: z.enum(priceDisplayModeValues).default('exact'),

  // Pricing fields
  price: z.coerce.number().min(0, 'Price must be positive').optional().nullable(),
  price_min: z.coerce.number().min(0, 'Minimum price must be positive').optional().nullable(),
  price_max: z.coerce.number().min(0, 'Maximum price must be positive').optional().nullable(),
  currency: z.string().max(3).default('GBP'),

  // Session details
  duration_minutes: z.coerce.number().int().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
  session_count: z.coerce.number().int().min(1, 'At least 1 session required').max(50, 'Maximum 50 sessions').default(1),
  session_count_min: z.coerce.number().int().min(1).optional().nullable(),
  session_count_max: z.coerce.number().int().min(1).optional().nullable(),

  // Content fields
  includes: z.array(z.string()).default([]),
  outcome_focus: z.string().max(200, 'Outcome focus must be 200 characters or less').optional().or(z.literal('')),

  // Display options
  is_active: z.coerce.boolean().default(true),
  is_featured: z.coerce.boolean().default(false),
  show_per_session_price: z.coerce.boolean().default(true),
  show_price: z.coerce.boolean().default(true),
  show_session_details: z.coerce.boolean().default(true),
  show_includes: z.coerce.boolean().default(true),
  show_outcome_focus: z.coerce.boolean().default(true),
}).superRefine((data, ctx) => {
  // Validate price based on display mode
  if (data.price_display_mode === 'exact' || data.price_display_mode === 'from') {
    if (data.price === undefined || data.price === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price is required for this display mode',
        path: ['price'],
      })
    }
  }

  if (data.price_display_mode === 'range') {
    if (data.price_min === undefined || data.price_min === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum price is required for range pricing',
        path: ['price_min'],
      })
    }
    if (data.price_max === undefined || data.price_max === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum price is required for range pricing',
        path: ['price_max'],
      })
    }
    // Only compare if both values are defined numbers
    if (typeof data.price_min === 'number' && typeof data.price_max === 'number' && data.price_min >= data.price_max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum price must be greater than minimum price',
        path: ['price_max'],
      })
    }
  }

  // Validate session count range
  if (typeof data.session_count_min === 'number' && typeof data.session_count_max === 'number' &&
      data.session_count_min > data.session_count_max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Maximum sessions must be greater than or equal to minimum',
      path: ['session_count_max'],
    })
  }
})

// Get therapist's services
export async function getTherapistServices(profileId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('therapist_services')
    .select('*')
    .eq('therapist_profile_id', profileId)
    .order('display_order')

  if (error) {
    console.error('Error fetching therapist services:', error)
    return []
  }

  return data || []
}

// Create a new service
export async function createServiceAction(
  prevState: ActionResponse,
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

    // Parse includes from JSON string
    let includes: string[] = []
    const includesRaw = formData.get('includes')
    if (includesRaw && typeof includesRaw === 'string') {
      try {
        includes = JSON.parse(includesRaw)
      } catch {
        includes = []
      }
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get('name') || '',
      description: formData.get('description') || '',
      short_description: formData.get('short_description') || '',
      service_type: formData.get('service_type') || 'single_session',
      price_display_mode: formData.get('price_display_mode') || 'exact',
      price: formData.get('price') ? Number(formData.get('price')) : null,
      price_min: formData.get('price_min') ? Number(formData.get('price_min')) : null,
      price_max: formData.get('price_max') ? Number(formData.get('price_max')) : null,
      currency: formData.get('currency') || 'GBP',
      duration_minutes: formData.get('duration_minutes') || 60,
      session_count: formData.get('session_count') || 1,
      session_count_min: formData.get('session_count_min') ? Number(formData.get('session_count_min')) : null,
      session_count_max: formData.get('session_count_max') ? Number(formData.get('session_count_max')) : null,
      includes,
      outcome_focus: formData.get('outcome_focus') || '',
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
      show_per_session_price: formData.get('show_per_session_price') !== 'false',
      show_price: formData.get('show_price') !== 'false',
      show_session_details: formData.get('show_session_details') !== 'false',
      show_includes: formData.get('show_includes') !== 'false',
      show_outcome_focus: formData.get('show_outcome_focus') !== 'false',
    }

    const validation = serviceSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data

    // Get current max display_order
    const { data: existingServices } = await supabase
      .from('therapist_services')
      .select('display_order')
      .eq('therapist_profile_id', profile.id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = (existingServices?.[0]?.display_order ?? -1) + 1

    // Create service
    const { error: insertError } = await supabase
      .from('therapist_services')
      .insert({
        therapist_profile_id: profile.id,
        name: data.name,
        description: data.description || null,
        short_description: data.short_description || null,
        service_type: data.service_type,
        price_display_mode: data.price_display_mode,
        price: data.price,
        price_min: data.price_min,
        price_max: data.price_max,
        currency: data.currency,
        duration_minutes: data.duration_minutes,
        session_count: data.session_count,
        session_count_min: data.session_count_min,
        session_count_max: data.session_count_max,
        includes: data.includes,
        outcome_focus: data.outcome_focus || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
        show_per_session_price: data.show_per_session_price,
        show_price: data.show_price,
        show_session_details: data.show_session_details,
        show_includes: data.show_includes,
        show_outcome_focus: data.show_outcome_focus,
        display_order: nextOrder,
      })

    if (insertError) {
      console.error('Service create error:', insertError)
      return { success: false, error: 'Failed to create service' }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Service create error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update an existing service
export async function updateServiceAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const serviceId = formData.get('service_id') as string
    if (!serviceId) {
      return { success: false, error: 'Service ID required' }
    }

    // Get service and verify ownership
    const { data: service } = await supabase
      .from('therapist_services')
      .select('therapist_profile_id')
      .eq('id', serviceId)
      .single()

    if (!service) {
      return { success: false, error: 'Service not found' }
    }

    // Check profile ownership
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('user_id')
      .eq('id', service.therapist_profile_id)
      .single()

    if (!profile || profile.user_id !== user.id) {
      return { success: false, error: 'Not authorised to edit this service' }
    }

    // Parse includes from JSON string
    let includes: string[] = []
    const includesRaw = formData.get('includes')
    if (includesRaw && typeof includesRaw === 'string') {
      try {
        includes = JSON.parse(includesRaw)
      } catch {
        includes = []
      }
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get('name') || '',
      description: formData.get('description') || '',
      short_description: formData.get('short_description') || '',
      service_type: formData.get('service_type') || 'single_session',
      price_display_mode: formData.get('price_display_mode') || 'exact',
      price: formData.get('price') ? Number(formData.get('price')) : null,
      price_min: formData.get('price_min') ? Number(formData.get('price_min')) : null,
      price_max: formData.get('price_max') ? Number(formData.get('price_max')) : null,
      currency: formData.get('currency') || 'GBP',
      duration_minutes: formData.get('duration_minutes') || 60,
      session_count: formData.get('session_count') || 1,
      session_count_min: formData.get('session_count_min') ? Number(formData.get('session_count_min')) : null,
      session_count_max: formData.get('session_count_max') ? Number(formData.get('session_count_max')) : null,
      includes,
      outcome_focus: formData.get('outcome_focus') || '',
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
      show_per_session_price: formData.get('show_per_session_price') !== 'false',
      show_price: formData.get('show_price') !== 'false',
      show_session_details: formData.get('show_session_details') !== 'false',
      show_includes: formData.get('show_includes') !== 'false',
      show_outcome_focus: formData.get('show_outcome_focus') !== 'false',
    }

    const validation = serviceSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data

    // Update service
    const { error: updateError } = await supabase
      .from('therapist_services')
      .update({
        name: data.name,
        description: data.description || null,
        short_description: data.short_description || null,
        service_type: data.service_type,
        price_display_mode: data.price_display_mode,
        price: data.price,
        price_min: data.price_min,
        price_max: data.price_max,
        currency: data.currency,
        duration_minutes: data.duration_minutes,
        session_count: data.session_count,
        session_count_min: data.session_count_min,
        session_count_max: data.session_count_max,
        includes: data.includes,
        outcome_focus: data.outcome_focus || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
        show_per_session_price: data.show_per_session_price,
        show_price: data.show_price,
        show_session_details: data.show_session_details,
        show_includes: data.show_includes,
        show_outcome_focus: data.show_outcome_focus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId)

    if (updateError) {
      console.error('Service update error:', updateError)
      return { success: false, error: 'Failed to update service' }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Service update error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete a service
export async function deleteServiceAction(serviceId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get service and verify ownership
    const { data: service } = await supabase
      .from('therapist_services')
      .select('therapist_profile_id')
      .eq('id', serviceId)
      .single()

    if (!service) {
      return { success: false, error: 'Service not found' }
    }

    // Check profile ownership
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('user_id')
      .eq('id', service.therapist_profile_id)
      .single()

    if (!profile || profile.user_id !== user.id) {
      return { success: false, error: 'Not authorised to delete this service' }
    }

    // Delete service
    const { error: deleteError } = await supabase
      .from('therapist_services')
      .delete()
      .eq('id', serviceId)

    if (deleteError) {
      console.error('Service delete error:', deleteError)
      return { success: false, error: 'Failed to delete service' }
    }

    revalidatePath('/dashboard/profile/therapist')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Service delete error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Reorder services
export async function reorderServicesAction(serviceIds: string[]): Promise<ActionResponse> {
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

    // Update display_order for each service
    const updates = serviceIds.map((id, index) =>
      supabase
        .from('therapist_services')
        .update({ display_order: index })
        .eq('id', id)
        .eq('therapist_profile_id', profile.id)
    )

    const results = await Promise.all(updates)
    const hasError = results.some(r => r.error)

    if (hasError) {
      console.error('Service reorder error:', results.find(r => r.error)?.error)
      return { success: false, error: 'Failed to reorder services' }
    }

    revalidatePath('/dashboard/profile/therapist')

    return { success: true }
  } catch (err) {
    console.error('Service reorder error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Upload service image action
export async function uploadServiceImageAction(
  prevState: any,
  formData: FormData
): Promise<ServiceImageUploadResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const serviceId = formData.get('service_id') as string
    const file = formData.get('image') as File

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID required',
      }
    }

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

    // Get service and verify ownership
    const { data: service } = await supabase
      .from('therapist_services')
      .select('therapist_profile_id, image_url')
      .eq('id', serviceId)
      .single()

    if (!service) {
      return { success: false, error: 'Service not found' }
    }

    // Check profile ownership
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('user_id')
      .eq('id', service.therapist_profile_id)
      .single()

    if (!profile || profile.user_id !== user.id) {
      return { success: false, error: 'Not authorised to edit this service' }
    }

    // Generate unique filename
    const fileExtension = getFileExtension(file.type)
    const filename = generateServiceImageFilename(user.id, serviceId, fileExtension)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('service-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Service image upload error:', uploadError)
      return {
        success: false,
        error: 'Failed to upload image',
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(filename)

    // Update service with new image URL
    const { error: updateError } = await supabase
      .from('therapist_services')
      .update({ image_url: publicUrl })
      .eq('id', serviceId)

    if (updateError) {
      // Rollback: delete uploaded file
      await supabase.storage
        .from('service-images')
        .remove([filename])

      return {
        success: false,
        error: 'Failed to update service',
      }
    }

    // Delete old image if exists
    if (service.image_url) {
      try {
        const urlParts = service.image_url.split('/storage/v1/object/public/service-images/')
        if (urlParts.length > 1) {
          const oldPath = urlParts[1]
          await supabase.storage
            .from('service-images')
            .remove([oldPath])
        }
      } catch (err) {
        console.warn('Failed to delete old service image:', err)
      }
    }

    revalidatePath('/dashboard/services')
    revalidatePath('/directory')

    return {
      success: true,
      imageUrl: publicUrl,
    }
  } catch (err) {
    console.error('Service image upload error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Delete service image action
export async function deleteServiceImageAction(serviceId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Get service and verify ownership
    const { data: service } = await supabase
      .from('therapist_services')
      .select('therapist_profile_id, image_url')
      .eq('id', serviceId)
      .single()

    if (!service) {
      return { success: false, error: 'Service not found' }
    }

    // Check profile ownership
    const { data: profile } = await supabase
      .from('therapist_profiles')
      .select('user_id')
      .eq('id', service.therapist_profile_id)
      .single()

    if (!profile || profile.user_id !== user.id) {
      return { success: false, error: 'Not authorised to edit this service' }
    }

    if (!service.image_url) {
      return {
        success: false,
        error: 'No image to delete',
      }
    }

    // Delete from storage
    try {
      const urlParts = service.image_url.split('/storage/v1/object/public/service-images/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('service-images')
          .remove([filePath])
      }
    } catch (err) {
      console.warn('Failed to delete service image file:', err)
    }

    // Update service to remove image URL
    const { error: updateError } = await supabase
      .from('therapist_services')
      .update({ image_url: null })
      .eq('id', serviceId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update service',
      }
    }

    revalidatePath('/dashboard/services')
    revalidatePath('/directory')

    return { success: true }
  } catch (err) {
    console.error('Service image delete error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

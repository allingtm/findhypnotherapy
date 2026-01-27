'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { validateImageFile, getFileExtension } from '@/lib/utils/fileValidation'
import { generatePhotoFilename } from '@/lib/utils/imageCrop'
import { uploadFile, deleteFile, getPublicUrl, extractR2Path, parsePath } from '@/lib/r2/storage'

// Response type for form actions
type ActionResponse = {
  success: boolean
  error?: string
}

// Response type for photo upload
type PhotoUploadResponse = ActionResponse & {
  photoUrl?: string
}

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
})

// Update profile action
export async function updateProfileAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      photoUrl: formData.get('photoUrl') || '',
    }

    const validation = profileSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const { name, email, photoUrl } = validation.data

    // Sanitize name to prevent XSS
    const sanitizedName = name.replace(/[<>]/g, '')

    // Update user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .update({
        name: sanitizedName,
        ...(photoUrl && { photo_url: photoUrl }),
      })
      .eq('id', user.id)

    if (profileError) {
      return {
        success: false,
        error: 'Failed to update profile',
      }
    }

    // Update email if changed
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email,
      })

      if (emailError) {
        return {
          success: false,
          error: 'Failed to update email. Please check if the email is already in use.',
        }
      }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('Profile update error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Update password action
export async function updatePasswordAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Parse and validate form data
    const rawData = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    }

    const validation = passwordSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const { currentPassword, newPassword, confirmPassword } = validation.data

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'New passwords do not match',
      }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return {
        success: false,
        error: 'Current password is incorrect',
      }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update password',
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Password update error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Upload profile photo action
export async function uploadProfilePhotoAction(
  prevState: any,
  formData: FormData
): Promise<PhotoUploadResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const file = formData.get('photo') as File

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
    const filename = generatePhotoFilename(user.id, fileExtension)

    // Get old photo URL to delete later
    const { data: currentProfile } = await supabase
      .from('users')
      .select('photo_url')
      .eq('id', user.id)
      .single()

    // Convert File to Buffer for R2 upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to R2 Storage
    const uploadResult = await uploadFile('profile-photos', filename, buffer, {
      contentType: file.type,
      cacheControl: 'max-age=3600',
    })

    if (!uploadResult.success) {
      console.error('Upload error:', uploadResult.error)
      return {
        success: false,
        error: 'Failed to upload photo',
      }
    }

    // Get public URL
    const publicUrl = getPublicUrl('profile-photos', filename)

    // Update user profile with new photo URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ photo_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      // Rollback: delete uploaded file
      await deleteFile('profile-photos', filename)

      return {
        success: false,
        error: 'Failed to update profile',
      }
    }

    // Delete old photo if exists
    if (currentProfile?.photo_url) {
      try {
        const oldPath = extractR2Path(currentProfile.photo_url)
        if (oldPath) {
          const parsed = parsePath(oldPath)
          if (parsed) {
            await deleteFile(parsed.folder, parsed.filename)
          }
        }
      } catch (err) {
        // Non-critical error, log but don't fail
        console.warn('Failed to delete old photo:', err)
      }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      photoUrl: publicUrl,
    }
  } catch (err) {
    console.error('Photo upload error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Delete profile photo action
export async function deleteProfilePhotoAction(
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

    // Get current photo URL
    const { data: profile } = await supabase
      .from('users')
      .select('photo_url')
      .eq('id', user.id)
      .single()

    if (!profile?.photo_url) {
      return {
        success: false,
        error: 'No photo to delete',
      }
    }

    // Extract path from URL
    const fullPath = extractR2Path(profile.photo_url)
    if (!fullPath) {
      return {
        success: false,
        error: 'Invalid photo URL',
      }
    }

    const parsed = parsePath(fullPath)
    if (!parsed) {
      return {
        success: false,
        error: 'Invalid photo URL',
      }
    }

    // Delete from R2 storage
    const deleteResult = await deleteFile(parsed.folder, parsed.filename)

    if (!deleteResult.success) {
      return {
        success: false,
        error: 'Failed to delete photo',
      }
    }

    // Update user profile (remove photo_url)
    const { error: updateError } = await supabase
      .from('users')
      .update({ photo_url: null })
      .eq('id', user.id)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update profile',
      }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('Photo deletion error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

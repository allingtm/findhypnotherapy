'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cancelCustomerSubscriptions } from './stripe'
import { revalidatePath } from 'next/cache'

type ActionResponse = {
  success: boolean
  error?: string
}

/**
 * Request account deletion - GDPR compliant soft delete
 *
 * This action:
 * 1. Cancels any active Stripe subscriptions
 * 2. Deletes calendar OAuth tokens
 * 3. Deletes profile photos/videos from storage
 * 4. Anonymizes personal data (keeps records for 7-year legal compliance)
 * 5. Marks the account as deleted
 * 6. Signs the user out
 */
export async function requestAccountDeletionAction(
  confirmEmail: string
): Promise<ActionResponse> {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Failed to fetch user profile' }
    }

    // Verify email confirmation matches
    if (profile.email?.toLowerCase() !== confirmEmail.toLowerCase()) {
      return { success: false, error: 'Email confirmation does not match your account email' }
    }

    // Get therapist profile if exists
    const { data: therapistProfile } = await supabase
      .from('therapist_profiles')
      .select('id, photo_url, video_url')
      .eq('user_id', user.id)
      .single()

    const now = new Date().toISOString()

    // 1. Cancel Stripe subscriptions if customer exists
    if (profile.stripe_customer_id) {
      const { error: stripeError } = await cancelCustomerSubscriptions(profile.stripe_customer_id)
      if (stripeError) {
        console.error('Failed to cancel Stripe subscriptions:', stripeError)
        // Continue with deletion - subscription will lapse
      }
    }

    // 2. Delete calendar OAuth tokens
    const { error: tokenError } = await adminClient
      .from('calendar_oauth_tokens')
      .delete()
      .eq('user_id', user.id)

    if (tokenError) {
      console.error('Failed to delete OAuth tokens:', tokenError)
    }

    // 3. Delete calendar busy times
    const { error: busyError } = await adminClient
      .from('calendar_busy_times')
      .delete()
      .eq('user_id', user.id)

    if (busyError) {
      console.error('Failed to delete calendar busy times:', busyError)
    }

    // 4. Delete files from storage if therapist profile exists
    if (therapistProfile) {
      // Delete profile photo
      if (therapistProfile.photo_url) {
        const photoPath = extractStoragePath(therapistProfile.photo_url)
        if (photoPath) {
          await adminClient.storage.from('profile-photos').remove([photoPath])
        }
      }

      // Delete profile video
      if (therapistProfile.video_url) {
        const videoPath = extractStoragePath(therapistProfile.video_url)
        if (videoPath) {
          await adminClient.storage.from('profile-videos').remove([videoPath])
        }
      }

      // 5. Delete therapist-related records (not needed for 7-year retention)
      // Delete availability
      await adminClient
        .from('therapist_availability')
        .delete()
        .eq('therapist_profile_id', therapistProfile.id)

      // Delete availability overrides
      await adminClient
        .from('therapist_availability_overrides')
        .delete()
        .eq('therapist_profile_id', therapistProfile.id)

      // Delete services
      await adminClient
        .from('therapist_services')
        .delete()
        .eq('therapist_profile_id', therapistProfile.id)

      // Delete blocked visitors
      await adminClient
        .from('blocked_visitors')
        .delete()
        .eq('therapist_profile_id', therapistProfile.id)

      // Delete booking settings
      await adminClient
        .from('therapist_booking_settings')
        .delete()
        .eq('therapist_profile_id', therapistProfile.id)

      // 6. Anonymize therapist profile (keep for booking records)
      await adminClient
        .from('therapist_profiles')
        .update({
          bio: null,
          phone: null,
          website_url: null,
          photo_url: null,
          video_url: null,
          is_published: false,
          location: null,
          address_line1: null,
          address_line2: null,
          city: null,
          postcode: null,
        })
        .eq('id', therapistProfile.id)
    }

    // 7. Anonymize user data (keep structure for foreign key integrity)
    const deletedUserId = `deleted_${user.id.slice(0, 8)}`
    await adminClient
      .from('users')
      .update({
        name: 'Deleted User',
        email: `${deletedUserId}@deleted.local`,
        photo_url: null,
        deleted_at: now,
        deletion_requested_at: now,
        // Clear Stripe ID to prevent any billing issues
        stripe_customer_id: null,
        subscription_status: null,
        subscription_current_period_end: null,
      })
      .eq('id', user.id)

    // 8. Sign out the user
    await supabase.auth.signOut()

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Account deletion error:', error)
    return { success: false, error: 'An unexpected error occurred during account deletion' }
  }
}

/**
 * Extract storage path from full URL
 */
function extractStoragePath(url: string): string | null {
  try {
    // URLs typically look like: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Check if user's account is deleted
 */
export async function checkAccountDeleted(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('users')
    .select('deleted_at')
    .eq('id', user.id)
    .single()

  return !!profile?.deleted_at
}

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { checkIsAdmin } from './permissions'

/**
 * Check if the current user has an active subscription
 * @param supabase - Supabase client instance
 * @returns Promise resolving to true if user has active subscription, false otherwise
 */
export async function hasActiveSubscription(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_active_subscription')

  if (error) {
    console.error('Error checking subscription:', error)
    return false
  }

  return data === true
}

/**
 * Get full subscription details for the current user
 * @param supabase - Supabase client instance
 * @returns Promise resolving to subscription data or null
 */
export async function getUserSubscription(
  supabase: SupabaseClient<Database>
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

/**
 * Check if user can access dashboard (has subscription OR is admin)
 * @param supabase - Supabase client instance
 * @returns Promise resolving to true if user can access dashboard, false otherwise
 */
export async function canAccessDashboard(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  // Check if admin (admins bypass subscription requirement)
  const isAdmin = await checkIsAdmin(supabase)
  if (isAdmin) return true

  // Check subscription
  return await hasActiveSubscription(supabase)
}

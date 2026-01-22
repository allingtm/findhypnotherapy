import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Check if the current user has admin privileges
 * @param supabase - Supabase client instance
 * @returns Promise resolving to true if user is admin, false otherwise
 */
export async function checkIsAdmin(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data, error } = await supabase.rpc('is_admin')

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data === true
}

/**
 * Get all roles assigned to the current user
 * @param supabase - Supabase client instance
 * @returns Promise resolving to array of role names
 */
export async function getUserRoles(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_user_roles')

  if (error) {
    console.error('Error fetching user roles:', error)
    return []
  }

  return data || []
}

/**
 * Check if the current user has a specific role
 * @param supabase - Supabase client instance
 * @param roleName - Name of the role to check (e.g., 'Admin', 'Member')
 * @returns Promise resolving to true if user has the role, false otherwise
 */
export async function hasRole(
  supabase: SupabaseClient<Database>,
  roleName: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', { role_name: roleName })

  if (error) {
    console.error('Error checking role:', error)
    return false
  }

  return data === true
}

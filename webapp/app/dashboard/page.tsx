import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUserRoles } from '@/lib/auth/permissions'
import { getUserSubscription } from '@/lib/auth/subscriptions'
import Link from 'next/link'

// Cache the user profile query for performance
const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
})

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile, roles, and subscription
  const profile = await getUserProfile(user.id)
  const userRoles = await getUserRoles(supabase)
  const isAdmin = userRoles.includes('Admin')
  const subscription = await getUserSubscription(supabase)

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back!</p>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Admin Dashboard
          </Link>
        )}
      </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg text-gray-900">{profile?.name || 'Not set'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-lg text-gray-900">
                  {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-600 font-mono">{user.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="flex gap-2 mt-1">
                  {userRoles.map(role => (
                    <span
                      key={role}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                  {userRoles.length === 0 && (
                    <span className="text-sm text-gray-500">No roles assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {subscription && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-green-900">
                    {subscription.status === 'trialing' ? '14-Day Free Trial Active' : 'Active Subscription'}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {subscription.plan_name} - Renews {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                  {subscription.status === 'trialing' && subscription.trial_end && (
                    <p className="text-sm text-green-600 mt-1">
                      Trial ends {new Date(subscription.trial_end).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAdmin && !subscription && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <span className="font-semibold">Admin Access:</span> You have access to all features as an administrator.
              </p>
            </div>
          )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Authentication Status:</span> Active Session
        </p>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'

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

  // Fetch user profile
  const profile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back!</p>
            </div>
            <LogoutButton />
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
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Authentication Status:</span> Active Session
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

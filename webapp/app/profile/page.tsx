import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You can edit your basic profile information here.
              <a href="/subscribe" className="underline ml-1 font-medium hover:text-blue-900">
                Subscribe
              </a> to unlock full dashboard access.
            </p>
          </div>

          <ProfileEditForm
            initialName={profile?.name || ''}
            initialEmail={user.email || ''}
          />
        </div>
      </div>
    </div>
  )
}

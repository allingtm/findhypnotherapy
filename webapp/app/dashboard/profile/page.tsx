import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Profile Settings</h1>
      <ProfileForm
        user={{
          id: user.id,
          email: user.email || '',
          name: profile?.name || '',
          photo_url: profile?.photo_url,
        }}
      />
    </div>
  )
}

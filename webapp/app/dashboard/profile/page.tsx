import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TherapistProfilePageContent } from '@/components/therapist-profile/TherapistProfilePageContent'
import {
  getOrCreateTherapistProfile,
  getSpecializations,
  getTherapistSpecializations,
} from '@/app/actions/therapist-profile'

export const metadata = {
  title: 'Profile | Find Hypnotherapy',
  description: 'Manage your profile and directory listing',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get or create therapist profile
  const { profile, error } = await getOrCreateTherapistProfile()

  if (error || !profile) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Profile</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your profile. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Fetch specializations and user's selected ones
  const [specializations, therapistSpecializations, userData] = await Promise.all([
    getSpecializations(),
    getTherapistSpecializations(profile.id),
    supabase.from('users').select('name, photo_url').eq('id', user.id).single(),
  ])

  const selectedSpecializationIds = therapistSpecializations.map(ts => ts.specialization_id)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your professional profile and account settings.
        </p>
      </div>

      <TherapistProfilePageContent
        profile={profile}
        specializations={specializations}
        selectedSpecializationIds={selectedSpecializationIds}
        userName={userData.data?.name || ''}
        user={{
          id: user.id,
          email: user.email || '',
          name: userData.data?.name || '',
          photo_url: userData.data?.photo_url,
        }}
      />
    </div>
  )
}

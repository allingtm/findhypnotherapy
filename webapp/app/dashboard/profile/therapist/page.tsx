import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TherapistProfileForm } from '@/components/therapist-profile/TherapistProfileForm'
import {
  getOrCreateTherapistProfile,
  getSpecializations,
  getTherapistSpecializations,
} from '@/app/actions/therapist-profile'

export const metadata = {
  title: 'Therapist Profile | Find Hypnotherapy',
  description: 'Manage your therapist profile and directory listing',
}

export default async function TherapistProfilePage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Therapist Profile</h1>
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
    supabase.from('users').select('name').eq('id', user.id).single(),
  ])

  const selectedSpecializationIds = therapistSpecializations.map(ts => ts.specialization_id)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Therapist Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Complete your profile to appear in the public directory and help clients find you.
        </p>
      </div>

      <TherapistProfileForm
        profile={profile}
        specializations={specializations}
        selectedSpecializationIds={selectedSpecializationIds}
        userName={userData.data?.name || ''}
      />
    </div>
  )
}

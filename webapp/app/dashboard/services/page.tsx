import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ServicesSection } from '@/components/therapist-profile/ServicesSection'
import { getOrCreateTherapistProfile } from '@/app/actions/therapist-profile'
import { getTherapistServices } from '@/app/actions/therapist-services'

export const metadata = {
  title: 'Services & Pricing | Find Hypnotherapy',
  description: 'Manage your services and pricing',
}

export default async function ServicesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Services & Pricing</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your profile. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Fetch services
  const services = await getTherapistServices(profile.id)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Services & Pricing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Add the services you offer with their prices and session details. You need at least one service to publish your profile.
        </p>
      </div>

      <ServicesSection services={services} />
    </div>
  )
}

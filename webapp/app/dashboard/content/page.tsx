import { getUserVideos } from '@/app/actions/therapist-videos'
import { getOrCreateTherapistProfile } from '@/app/actions/therapist-profile'
import { getTherapistServices } from '@/app/actions/therapist-services'
import { ContentPageClient } from './ContentPageClient'

export const metadata = {
  title: 'My Content | Find Hypnotherapy',
  description: 'Manage your video content',
}

export default async function DashboardContentPage() {
  const { profile } = await getOrCreateTherapistProfile()
  const [videos, services] = await Promise.all([
    getUserVideos(),
    profile ? getTherapistServices(profile.id) : Promise.resolve([]),
  ])

  return <ContentPageClient initialVideos={videos} services={services} />
}

import { getUserVideos } from '@/app/actions/therapist-videos'
import { ContentPageClient } from './ContentPageClient'

export const metadata = {
  title: 'My Content | Find Hypnotherapy',
  description: 'Manage your video content',
}

export default async function DashboardContentPage() {
  const videos = await getUserVideos()

  return <ContentPageClient initialVideos={videos} />
}

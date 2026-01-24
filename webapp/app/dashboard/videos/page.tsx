import { getUserVideos } from '@/app/actions/therapist-videos'
import { VideosPageClient } from './VideosPageClient'

export const metadata = {
  title: 'My Videos | Find Hypnotherapy',
  description: 'Manage your video content',
}

export default async function DashboardVideosPage() {
  const videos = await getUserVideos()

  return <VideosPageClient initialVideos={videos} />
}

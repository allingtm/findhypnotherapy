import { notFound } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { VideoDetailView } from '@/components/video-feed/VideoDetailView'
import { getVideoBySlug, getVideoByIdPublic, getRelatedVideos, getTherapistContactInfo } from '@/app/actions/therapist-videos'
import type { Metadata } from 'next'

interface VideoPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params
  // Try slug first, then ID for backward compatibility
  let video = await getVideoBySlug(slug)
  if (!video) {
    video = await getVideoByIdPublic(slug)
  }

  if (!video) {
    return {
      title: 'Video Not Found | Find Hypnotherapy',
    }
  }

  return {
    title: `${video.title} | Find Hypnotherapy`,
    description: video.description || `Watch this video from ${video.therapist_name}`,
    openGraph: {
      title: video.title,
      description: video.description || `Watch this video from ${video.therapist_name}`,
      type: 'video.other',
      images: video.thumbnail_url ? [video.thumbnail_url] : [],
    },
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params

  // Try slug first, then ID for backward compatibility
  let video = await getVideoBySlug(slug)
  if (!video) {
    video = await getVideoByIdPublic(slug)
  }

  if (!video) {
    notFound()
  }

  // Fetch related videos and contact info in parallel
  const [relatedVideos, contactInfo] = await Promise.all([
    getRelatedVideos(video.therapist_profile_id, video.id),
    getTherapistContactInfo(video.therapist_profile_id),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 dark:bg-neutral-950">
        <VideoDetailView video={video} relatedVideos={relatedVideos} contactInfo={contactInfo} />
      </div>
      <Footer />
    </div>
  )
}

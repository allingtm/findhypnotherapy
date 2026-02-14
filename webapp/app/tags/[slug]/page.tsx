import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { VideoWall } from '@/components/video-feed/VideoWall'
import { getVideosByTag } from '@/app/actions/therapist-videos'
import type { Metadata } from 'next'

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = decodeURIComponent(slug)

  return {
    title: `#${tag} Videos | Find Hypnotherapy`,
    description: `Watch hypnotherapy videos tagged with #${tag}`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const tag = decodeURIComponent(slug)

  const videos = await getVideosByTag(tag)

  if (videos.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/videos"
              className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all videos
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            #{tag}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </p>

          <VideoWall videos={videos} />
        </div>
      </div>
      <Footer />
    </div>
  )
}

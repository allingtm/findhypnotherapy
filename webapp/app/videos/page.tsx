import { createClient } from '@/lib/supabase/server'
import { VideoFeedClient } from './VideoFeedClient'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import type { VideoFeedItem } from '@/lib/types/videos'

export const metadata = {
  title: 'Videos | Find Hypnotherapy',
  description: 'Watch short videos from hypnotherapists to find the right fit for you.',
}

interface VideosPageProps {
  searchParams: Promise<{
    q?: string
    format?: string
    page?: string
  }>
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const searchQuery = params.q || null
  const sessionFormat = params.format || null
  const page = parseInt(params.page || '1', 10)
  const pageSize = 20

  // Fetch videos using RPC function
  const { data: videos, error } = await supabase.rpc('search_videos', {
    search_query: searchQuery,
    session_format_filter: sessionFormat,
    page_number: page,
    page_size: pageSize,
  })

  if (error) {
    console.error('Error fetching videos:', error)
  }

  const videoList = (videos || []) as VideoFeedItem[]
  const totalCount = videoList[0]?.total_count || 0
  const hasMore = totalCount > page * pageSize

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 dark:bg-neutral-950">
        <VideoFeedClient initialVideos={videoList} hasMore={hasMore} />
      </div>
      <Footer />
    </div>
  )
}

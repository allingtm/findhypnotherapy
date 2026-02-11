'use client'

import { VideoWall } from '@/components/video-feed/VideoWall'
import { VideoFeedFilters } from '@/components/video-feed/VideoFeedFilters'
import type { VideoFeedItem } from '@/lib/types/videos'

interface Specialization {
  id: string
  name: string
  slug: string
  category: string | null
}

interface VideoFeedClientProps {
  initialVideos: VideoFeedItem[]
  hasMore: boolean
  specializations: Specialization[]
}

export function VideoFeedClient({ initialVideos, hasMore, specializations }: VideoFeedClientProps) {
  const landscapeVideos = initialVideos.filter(v => v.orientation !== 'portrait')
  const portraitVideos = initialVideos.filter(v => v.orientation === 'portrait')

  if (initialVideos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Videos
          </h1>

          <VideoFeedFilters specializations={specializations} />

          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-lg shadow">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No videos found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your search or check back later for new content
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Videos
        </h1>

        <VideoFeedFilters specializations={specializations} />

        {/* Landscape Videos Section */}
        {landscapeVideos.length > 0 && (
          <section className="mb-10">
            {portraitVideos.length > 0 && (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Landscape
              </h2>
            )}
            <VideoWall videos={landscapeVideos} orientation="landscape" />
          </section>
        )}

        {/* Portrait Videos Section */}
        {portraitVideos.length > 0 && (
          <section>
            {landscapeVideos.length > 0 && (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Portrait
              </h2>
            )}
            <VideoWall videos={portraitVideos} orientation="portrait" />
          </section>
        )}

        {/* Load more indicator */}
        {hasMore && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scroll down or adjust filters to see more videos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

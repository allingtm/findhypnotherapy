'use client'

import { useState, useEffect } from 'react'
import { MobileVideoFeed } from '@/components/video-feed/MobileVideoFeed'
import { DesktopVideoFeed } from '@/components/video-feed/DesktopVideoFeed'
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
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide filters when viewing video on mobile
  useEffect(() => {
    if (isMobile && initialVideos.length > 0) {
      setShowFilters(false)
    }
  }, [isMobile, initialVideos.length])

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

  // Mobile: Full-screen TikTok-style feed
  if (isMobile) {
    return (
      <div className="relative">
        {/* Toggle filters button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="fixed top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>

        {/* Filters overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-40 bg-black/80 flex items-start justify-center pt-16 px-4">
            <div className="w-full max-w-md">
              <VideoFeedFilters specializations={specializations} />
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-4 px-4 py-2 bg-white text-black rounded-lg font-medium"
              >
                View Videos
              </button>
            </div>
          </div>
        )}

        <MobileVideoFeed videos={initialVideos} hasMore={hasMore} />
      </div>
    )
  }

  // Desktop: Video player with sidebar queue
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Videos
        </h1>

        <VideoFeedFilters specializations={specializations} />

        <DesktopVideoFeed videos={initialVideos} hasMore={hasMore} />
      </div>
    </div>
  )
}

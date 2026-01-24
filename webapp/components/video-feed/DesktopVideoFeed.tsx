'use client'

import { useState, useCallback, useEffect } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { VideoOverlay } from './VideoOverlay'
import type { VideoFeedItem } from '@/lib/types/videos'
import { formatDuration } from '@/lib/utils/videoValidation'

interface DesktopVideoFeedProps {
  videos: VideoFeedItem[]
  onLoadMore?: () => void
  hasMore?: boolean
}

export function DesktopVideoFeed({ videos, onLoadMore, hasMore }: DesktopVideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else if (hasMore && onLoadMore) {
      onLoadMore()
    }
  }, [currentIndex, videos.length, hasMore, onLoadMore])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 dark:bg-neutral-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">No videos available</p>
      </div>
    )
  }

  const currentVideo = videos[currentIndex]

  return (
    <div className="flex gap-6">
      {/* Main video player */}
      <div className="flex-1">
        <div className="relative aspect-square bg-black rounded-lg overflow-hidden max-w-2xl mx-auto">
          <VideoPlayer
            src={currentVideo.video_url}
            poster={currentVideo.thumbnail_url}
            isActive={true}
            className="h-full w-full"
          />
          <VideoOverlay video={currentVideo} />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm">Previous</span>
          </button>

          <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {videos.length}
          </span>

          <button
            onClick={goToNext}
            disabled={currentIndex === videos.length - 1 && !hasMore}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <span className="text-sm">Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-2">
          Use arrow keys or J/K to navigate
        </p>
      </div>

      {/* Sidebar queue */}
      <div className="w-64 flex-shrink-0">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Up Next</h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => handleThumbnailClick(index)}
              className={`w-full text-left rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900'
                  : 'hover:opacity-80'
              }`}
            >
              <div className="relative aspect-square bg-gray-100 dark:bg-neutral-800">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  </div>
                )}

                {/* Duration badge */}
                {video.duration_seconds && (
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration_seconds)}
                  </span>
                )}

                {/* Playing indicator */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2 bg-white dark:bg-neutral-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {video.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {video.therapist_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

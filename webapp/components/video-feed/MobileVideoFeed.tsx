'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { VideoOverlay } from './VideoOverlay'

const VideoPlayer = dynamic(() => import('./VideoPlayer').then(mod => ({ default: mod.VideoPlayer })), {
  ssr: false,
})
import { useSwipeGesture } from '@/lib/hooks/useSwipeGesture'
import type { VideoFeedItem } from '@/lib/types/videos'

interface MobileVideoFeedProps {
  videos: VideoFeedItem[]
  onLoadMore?: () => void
  hasMore?: boolean
}

export function MobileVideoFeed({ videos, onLoadMore, hasMore }: MobileVideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const swipeHandlers = useSwipeGesture({
    onSwipeUp: goToNext,
    onSwipeDown: goToPrevious,
    threshold: 50,
  })

  // Preload adjacent videos
  useEffect(() => {
    // Preload next video
    if (currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1]
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = nextVideo.video_url
      document.head.appendChild(link)
    }
  }, [currentIndex, videos])

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>No videos available</p>
      </div>
    )
  }

  const currentVideo = videos[currentIndex]

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-black overflow-hidden touch-none"
      {...swipeHandlers}
    >
      {/* Current video */}
      <div className="relative h-full w-full">
        <VideoPlayer
          src={currentVideo.video_url}
          poster={currentVideo.thumbnail_url}
          isActive={true}
          className="h-full w-full"
        />
        <VideoOverlay video={currentVideo} />
      </div>

      {/* Navigation indicators */}
      <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-2">
        {/* Up indicator */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="p-2 bg-white/20 rounded-full text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}

        {/* Down indicator */}
        {currentIndex < videos.length - 1 && (
          <button
            onClick={goToNext}
            className="p-2 bg-white/20 rounded-full text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
        {videos.slice(0, Math.min(videos.length, 10)).map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
        {videos.length > 10 && (
          <span className="text-white/60 text-xs ml-1">+{videos.length - 10}</span>
        )}
      </div>
    </div>
  )
}

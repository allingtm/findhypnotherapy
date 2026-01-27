'use client'

import Link from 'next/link'
import type { VideoFeedItem } from '@/lib/types/videos'
import { formatDuration } from '@/lib/utils/videoValidation'

interface VideoWallProps {
  videos: VideoFeedItem[]
  showTherapistInfo?: boolean
}

export function VideoWall({ videos, showTherapistInfo = true }: VideoWallProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500 dark:text-gray-400">No videos found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoWallCard
          key={video.id}
          video={video}
          showTherapistInfo={showTherapistInfo}
        />
      ))}
    </div>
  )
}

interface VideoWallCardProps {
  video: VideoFeedItem
  showTherapistInfo?: boolean
}

function VideoWallCard({ video, showTherapistInfo = true }: VideoWallCardProps) {
  // Use slug if available, fallback to id
  const videoPath = video.slug || video.id

  return (
    <Link
      href={`/videos/${videoPath}`}
      className="group block rounded-lg overflow-hidden bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-neutral-700">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-neutral-500"
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
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration_seconds)}
          </span>
        )}

        {/* Play icon overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 rounded-full p-3">
              <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 leading-snug">
          {video.title}
        </h3>

        {showTherapistInfo && (
          <div className="mt-2 flex items-center gap-2">
            {video.therapist_photo_url ? (
              <img
                src={video.therapist_photo_url}
                alt={video.therapist_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-neutral-600 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {video.therapist_name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {video.therapist_name}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

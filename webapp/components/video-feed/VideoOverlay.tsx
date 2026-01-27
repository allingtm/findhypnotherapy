'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { VideoFeedItem, SessionFormat } from '@/lib/types/videos'

interface VideoOverlayProps {
  video: VideoFeedItem
}

const SessionFormatIcon = ({ format }: { format: SessionFormat }) => {
  switch (format) {
    case 'in-person':
      return (
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">Face to Face</span>
        </div>
      )
    case 'online':
      return (
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Online</span>
        </div>
      )
    case 'phone':
      return (
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="text-sm">Phone</span>
        </div>
      )
    default:
      return null
  }
}

export function VideoOverlay({ video }: VideoOverlayProps) {
  const sessionFormats = video.session_format || video.therapist_session_format || []

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 text-white pointer-events-auto">
        {/* Therapist info */}
        <Link
          href={video.therapist_slug ? `/directory/${video.therapist_slug}` : '#'}
          className="flex items-center gap-3 mb-3 hover:opacity-90 transition-opacity"
        >
          {video.therapist_photo_url ? (
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={video.therapist_photo_url}
                alt={video.therapist_name}
                fill
                className="rounded-full object-cover border-2 border-white"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
              <span className="text-sm font-semibold">
                {video.therapist_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-semibold">{video.therapist_name}</span>
        </Link>

        {/* Video title */}
        <h2 className="text-lg font-medium mb-2">{video.title}</h2>

        {/* Description */}
        {video.description && (
          <p className="text-sm text-white/80 line-clamp-2 mb-3">{video.description}</p>
        )}

        {/* Session format badges */}
        {sessionFormats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sessionFormats.map((format) => (
              <SessionFormatIcon key={format} format={format as SessionFormat} />
            ))}
          </div>
        )}

        {/* View Profile button */}
        {video.therapist_slug && (
          <Link
            href={`/directory/${video.therapist_slug}`}
            className="inline-block mt-4 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  )
}

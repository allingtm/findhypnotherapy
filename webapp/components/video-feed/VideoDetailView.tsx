'use client'

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { VideoWall } from './VideoWall'
import { ServicesWall } from '@/components/services/ServicesWall'
import type { VideoFeedItem } from '@/lib/types/videos'
import { SESSION_FORMAT_LABELS } from '@/lib/types/videos'

const VideoPlayer = dynamic(() => import('./VideoPlayer').then(mod => ({ default: mod.VideoPlayer })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black animate-pulse" />,
})

interface VideoDetailViewProps {
  video: VideoFeedItem
  relatedVideos: VideoFeedItem[]
}

export function VideoDetailView({ video, relatedVideos }: VideoDetailViewProps) {
  const formattedDate = video.published_at
    ? new Date(video.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Video Player */}
      <div className={`relative ${video.orientation === 'portrait' ? 'aspect-[9/16] max-w-md mx-auto' : 'aspect-video'} bg-black rounded-lg overflow-hidden shadow-lg`}>
        <VideoPlayer
          src={video.video_url}
          poster={video.thumbnail_url}
          isActive={true}
          autoPlay={true}
          loop={false}
          muted={false}
          showFullControls={true}
          className="w-full h-full"
        />
      </div>

      {/* Video Info Section */}
      <div className="mt-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {video.title}
        </h1>

        {/* Meta info row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          {/* Session format badges */}
          {video.session_format && video.session_format.length > 0 && (
            <div className="flex gap-2">
              {video.session_format.map((format) => (
                <span
                  key={format}
                  className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs"
                >
                  {SESSION_FORMAT_LABELS[format]}
                </span>
              ))}
            </div>
          )}

          {formattedDate && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-neutral-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Description */}
        {video.description && (
          <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {video.description}
          </p>
        )}
      </div>

      {/* Therapist Info Card */}
      <div className="mt-6 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          {/* Photo */}
          {video.therapist_photo_url ? (
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={video.therapist_photo_url}
                alt={video.therapist_name}
                fill
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-600 flex items-center justify-center">
              <span className="text-2xl text-gray-500 dark:text-gray-400">
                {video.therapist_name.charAt(0)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {video.therapist_name}
            </h2>
            {video.therapist_slug && (
              <Link
                href={`/directory/${video.therapist_slug}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Related Services */}
      {video.services && video.services.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Related Services
          </h2>
          <ServicesWall services={video.services} therapistSlug={video.therapist_slug || ''} />
        </div>
      )}

      {/* Related Videos Section */}
      {relatedVideos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            More from {video.therapist_name}
          </h2>
          <VideoWall videos={relatedVideos} showTherapistInfo={false} />
        </div>
      )}

      {/* Back to videos link */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-neutral-700">
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all videos
        </Link>
      </div>
    </div>
  )
}

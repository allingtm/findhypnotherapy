'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { VideoUploadForm } from '@/components/video/VideoUploadForm'
import { VideoCard } from '@/components/video/VideoCard'
import { Button } from '@/components/ui/Button'
import type { TherapistVideo } from '@/lib/types/videos'

interface VideosPageClientProps {
  initialVideos: TherapistVideo[]
}

export function VideosPageClient({ initialVideos }: VideosPageClientProps) {
  const router = useRouter()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<TherapistVideo | null>(null)

  const handleUploadSuccess = useCallback(() => {
    setShowUploadForm(false)
    setEditingVideo(null)
    router.refresh()
  }, [router])

  const handleEditVideo = useCallback((video: TherapistVideo) => {
    setEditingVideo(video)
    setShowUploadForm(true)
  }, [])

  const handleCancel = useCallback(() => {
    setShowUploadForm(false)
    setEditingVideo(null)
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Videos
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Upload short videos to showcase your services
          </p>
        </div>

        {!showUploadForm && (
          <Button variant="primary" onClick={() => setShowUploadForm(true)}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload Video
          </Button>
        )}
      </div>

      {/* Upload/Edit Form */}
      {showUploadForm && (
        <div className="mb-8">
          <VideoUploadForm
            editVideo={editingVideo || undefined}
            onSuccess={handleUploadSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Video Grid */}
      {initialVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onEdit={handleEditVideo}
            />
          ))}
        </div>
      ) : (
        !showUploadForm && (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow">
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
              No videos yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Upload your first video to start connecting with potential clients
            </p>
            <Button
              variant="primary"
              onClick={() => setShowUploadForm(true)}
              className="mt-4"
            >
              Upload Your First Video
            </Button>
          </div>
        )
      )}

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100">
          Tips for Great Videos
        </h3>
        <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>Keep videos short and engaging (under 90 seconds)</li>
          <li>Use square format (1:1 aspect ratio) for best display</li>
          <li>Good lighting and clear audio make a big difference</li>
          <li>Introduce yourself and your specialty</li>
          <li>Include a call to action (e.g., &ldquo;Visit my profile to book&rdquo;)</li>
        </ul>
      </div>
    </div>
  )
}

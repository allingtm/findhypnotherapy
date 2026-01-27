'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { deleteVideoAction } from '@/app/actions/therapist-videos'
import { Button } from '@/components/ui/Button'
import type { TherapistVideo } from '@/lib/types/videos'
import { formatDuration } from '@/lib/utils/videoValidation'
import { SESSION_FORMAT_LABELS } from '@/lib/types/videos'

interface VideoCardProps {
  video: TherapistVideo
  onEdit: (video: TherapistVideo) => void
}

export function VideoCard({ video, onEdit }: VideoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteVideoAction, {
    success: false,
  })

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-neutral-700">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
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
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {formatDuration(video.duration_seconds)}
          </span>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded capitalize ${statusColors[video.status] || statusColors.processing}`}
        >
          {video.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {video.title}
        </h3>

        {video.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Session format badges */}
        {video.session_format && video.session_format.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {video.session_format.map((format) => (
              <span
                key={format}
                className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded"
              >
                {SESSION_FORMAT_LABELS[format as keyof typeof SESSION_FORMAT_LABELS] || format}
              </span>
            ))}
          </div>
        )}

        {/* Created date */}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          {new Date(video.created_at).toLocaleDateString()}
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => onEdit(video)}
            className="flex-1 text-sm"
          >
            Edit
          </Button>

          {showDeleteConfirm ? (
            <form action={deleteAction} className="flex gap-2 flex-1">
              <input type="hidden" name="videoId" value={video.id} />
              <Button
                type="submit"
                variant="primary"
                className="flex-1 text-sm !bg-red-600 hover:!bg-red-700"
                loading={isDeleting}
              >
                Confirm
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm"
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </Button>
          )}
        </div>

        {deleteState.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {deleteState.error}
          </p>
        )}
      </div>
    </div>
  )
}

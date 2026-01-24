'use client'

import { useState, useRef, useCallback, useActionState } from 'react'
import { uploadVideoAction, updateVideoAction } from '@/app/actions/therapist-videos'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ThumbnailSelector } from './ThumbnailSelector'
import {
  VIDEO_CONSTRAINTS,
  validateVideoFile,
  validateVideoAspectRatio,
  validateVideoDuration,
  formatDuration,
} from '@/lib/utils/videoValidation'
import type { TherapistVideo } from '@/lib/types/videos'

interface VideoUploadFormProps {
  editVideo?: TherapistVideo
  onSuccess?: () => void
  onCancel?: () => void
}

export function VideoUploadForm({ editVideo, onSuccess, onCancel }: VideoUploadFormProps) {
  const isEditing = !!editVideo

  const [uploadState, uploadAction, isUploading] = useActionState(
    isEditing ? updateVideoAction : uploadVideoAction,
    { success: false }
  )

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    editVideo?.thumbnail_url || null
  )
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [title, setTitle] = useState(editVideo?.title || '')
  const [description, setDescription] = useState(editVideo?.description || '')

  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleVideoSelect = useCallback((file: File) => {
    setVideoError(null)

    // Validate file type and size
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setVideoError(validation.error || 'Invalid video file')
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setVideoPreviewUrl(url)
    setVideoFile(file)

    // Reset thumbnail when new video is selected
    setThumbnailFile(null)
    setThumbnailPreviewUrl(null)
  }, [])

  const handleVideoMetadataLoaded = useCallback(() => {
    const video = videoPreviewRef.current
    if (!video) return

    // Validate duration
    const durationValidation = validateVideoDuration(video.duration)
    if (!durationValidation.valid) {
      setVideoError(durationValidation.error || 'Invalid video duration')
      setVideoFile(null)
      setVideoPreviewUrl(null)
      return
    }

    // Validate aspect ratio
    const aspectValidation = validateVideoAspectRatio(video.videoWidth, video.videoHeight)
    if (!aspectValidation.valid) {
      setVideoError(aspectValidation.error || 'Invalid aspect ratio')
      setVideoFile(null)
      setVideoPreviewUrl(null)
      return
    }

    setVideoDuration(video.duration)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleVideoSelect(file)
      }
    },
    [handleVideoSelect]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleVideoSelect(file)
      }
    },
    [handleVideoSelect]
  )

  const handleThumbnailCapture = useCallback((file: File) => {
    setThumbnailFile(file)
    setThumbnailPreviewUrl(URL.createObjectURL(file))
    setShowThumbnailSelector(false)
  }, [])

  const handleSubmit = useCallback(
    (formData: FormData) => {
      if (!isEditing && !videoFile) {
        setVideoError('Please select a video')
        return
      }

      // Add video file if uploading new
      if (videoFile) {
        formData.set('video', videoFile)
      }

      // Add thumbnail if selected
      if (thumbnailFile) {
        formData.set('thumbnail', thumbnailFile)
      }

      // Add duration if available
      if (videoDuration) {
        formData.set('duration_seconds', Math.floor(videoDuration).toString())
      }

      // Add video ID if editing
      if (isEditing && editVideo) {
        formData.set('videoId', editVideo.id)
      }
    },
    [videoFile, thumbnailFile, videoDuration, isEditing, editVideo]
  )

  // Handle success
  if (uploadState.success) {
    onSuccess?.()
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {isEditing ? 'Edit Video' : 'Upload New Video'}
      </h2>

      {uploadState.error && (
        <Alert type="error" message={uploadState.error} />
      )}

      {videoError && (
        <Alert type="error" message={videoError} />
      )}

      <form
        ref={formRef}
        action={(formData) => {
          handleSubmit(formData)
          uploadAction(formData)
        }}
        className="space-y-6"
      >
        {/* Video Upload Area (only for new uploads) */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video (1:1 square, max {VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS}s)
            </label>

            {!videoPreviewUrl ? (
              <div
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  MP4, WebM, or MOV (max {VIDEO_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="aspect-square bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoPreviewRef}
                    src={videoPreviewUrl}
                    onLoadedMetadata={handleVideoMetadataLoaded}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>
                {videoDuration && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Duration: {formatDuration(videoDuration)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null)
                    setVideoPreviewUrl(null)
                    setVideoDuration(null)
                    setThumbnailFile(null)
                    setThumbnailPreviewUrl(null)
                  }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove video
                </button>
              </div>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Thumbnail Selection */}
        {(videoPreviewUrl || isEditing) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thumbnail
            </label>

            <div className="flex items-start gap-4">
              {thumbnailPreviewUrl ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
                  <img
                    src={thumbnailPreviewUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-600 flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    No thumbnail
                  </span>
                </div>
              )}

              {videoPreviewUrl && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowThumbnailSelector(true)}
                >
                  {thumbnailPreviewUrl ? 'Change Thumbnail' : 'Select Thumbnail'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          placeholder="Give your video a title"
        />

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Tell viewers what this video is about"
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {description.length}/500 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isUploading}
            disabled={!isEditing && !videoFile}
          >
            {isEditing ? 'Save Changes' : 'Upload Video'}
          </Button>
        </div>
      </form>

      {/* Thumbnail Selector Modal */}
      {showThumbnailSelector && videoPreviewUrl && (
        <ThumbnailSelector
          videoUrl={videoPreviewUrl}
          onThumbnailCapture={handleThumbnailCapture}
          onClose={() => setShowThumbnailSelector(false)}
        />
      )}
    </div>
  )
}

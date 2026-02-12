'use client'

import { useState, useRef, useCallback, useActionState } from 'react'
import { getVideoUploadUrl, completeVideoUpload, updateVideoAction } from '@/app/actions/therapist-videos'
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

  // Only use useActionState for edit mode (metadata-only, no large files)
  const [editState, editAction, isEditSubmitting] = useActionState(updateVideoAction, {
    success: false,
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    editVideo?.thumbnail_url || null
  )
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [videoOrientation, setVideoOrientation] = useState<'landscape' | 'portrait' | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<string | null>(null)

  const [title, setTitle] = useState(editVideo?.title || '')
  const [description, setDescription] = useState(editVideo?.description || '')

  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

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
    setVideoOrientation(aspectValidation.orientation || null)
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

  // Upload file directly to R2 using presigned URL with progress tracking
  const uploadFileToR2 = useCallback(
    (url: string, file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Content-Type', file.type)

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.send(file)
      })
    },
    []
  )

  // Handle new video upload (presigned URL flow)
  const handleUploadSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!videoFile) {
        setVideoError('Please select a video')
        return
      }

      if (!title.trim()) {
        setVideoError('Please enter a title')
        return
      }

      setIsUploading(true)
      setVideoError(null)
      setUploadProgress(0)

      try {
        // Step 1: Get presigned URLs from server
        setUploadStage('Preparing upload...')
        const urlResult = await getVideoUploadUrl(videoFile.type, !!thumbnailFile)

        if (!urlResult.success || !urlResult.videoUploadUrl || !urlResult.videoFilename) {
          setVideoError(urlResult.error || 'Failed to prepare upload')
          return
        }

        // Step 2: Upload video directly to R2
        setUploadStage('Uploading video...')
        await uploadFileToR2(urlResult.videoUploadUrl, videoFile)

        // Step 3: Upload thumbnail if selected
        let thumbnailFilename: string | undefined
        if (thumbnailFile && urlResult.thumbnailUploadUrl && urlResult.thumbnailFilename) {
          setUploadStage('Uploading thumbnail...')
          setUploadProgress(0)
          await uploadFileToR2(urlResult.thumbnailUploadUrl, thumbnailFile)
          thumbnailFilename = urlResult.thumbnailFilename
        }

        // Step 4: Save metadata to database
        setUploadStage('Saving...')
        setUploadProgress(100)
        const result = await completeVideoUpload({
          videoFilename: urlResult.videoFilename,
          thumbnailFilename,
          title: title.trim(),
          description: description.trim() || undefined,
          duration_seconds: videoDuration ? Math.floor(videoDuration) : undefined,
          orientation: videoOrientation || undefined,
        })

        if (!result.success) {
          setVideoError(result.error || 'Failed to save video')
          return
        }

        onSuccess?.()
      } catch (err) {
        console.error('Upload error:', err)
        setVideoError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      } finally {
        setIsUploading(false)
        setUploadStage(null)
        setUploadProgress(0)
      }
    },
    [videoFile, thumbnailFile, title, description, videoDuration, videoOrientation, uploadFileToR2, onSuccess]
  )

  // Handle edit form submission (uses useActionState - metadata only)
  const handleEditSubmit = useCallback(
    (formData: FormData) => {
      if (editVideo) {
        formData.set('videoId', editVideo.id)
      }
    },
    [editVideo]
  )

  // Handle edit success
  if (isEditing && editState.success) {
    onSuccess?.()
  }

  const showError = videoError || (isEditing && editState.error)

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {isEditing ? 'Edit Video' : 'Upload New Video'}
      </h2>

      {showError && (
        <Alert type="error" message={showError} />
      )}

      {isEditing ? (
        // Edit form uses useActionState (no large files)
        <form
          action={(formData) => {
            handleEditSubmit(formData)
            editAction(formData)
          }}
          className="space-y-6"
        >
          {/* Thumbnail Selection */}
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
            </div>
          </div>

          <Input
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            placeholder="Give your video a title"
          />

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

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" loading={isEditSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        // New upload form uses direct R2 upload
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Video Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video (landscape 16:9 or portrait 9:16, max {VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS}s)
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
                <div className={`${videoOrientation === 'portrait' ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video'} bg-black rounded-lg overflow-hidden`}>
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
                    setVideoOrientation(null)
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

          {/* Thumbnail Selection */}
          {videoPreviewUrl && (
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

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowThumbnailSelector(true)}
                >
                  {thumbnailPreviewUrl ? 'Change Thumbnail' : 'Select Thumbnail'}
                </Button>
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

          {/* Upload Progress */}
          {isUploading && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {uploadStage}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel} disabled={isUploading}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={isUploading}
              disabled={!videoFile}
            >
              Upload Video
            </Button>
          </div>
        </form>
      )}

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

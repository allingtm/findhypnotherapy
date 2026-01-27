'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface ThumbnailSelectorProps {
  videoUrl: string
  onThumbnailCapture: (file: File) => void
  onClose: () => void
}

export function ThumbnailSelector({
  videoUrl,
  onThumbnailCapture,
  onClose,
}: ThumbnailSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Set canvas size to match video dimensions (16:9)
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw full video frame to canvas
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

    // Generate preview
    const previewUrl = canvas.toDataURL('image/webp', 0.9)
    setThumbnailPreview(previewUrl)
  }, [])

  const handleConfirm = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !thumbnailPreview) return

    setIsCapturing(true)

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create thumbnail'))
          },
          'image/webp',
          0.9
        )
      })

      // Create file from blob
      const file = new File([blob], 'thumbnail.webp', { type: 'image/webp' })
      onThumbnailCapture(file)
    } catch (err) {
      console.error('Failed to capture thumbnail:', err)
    } finally {
      setIsCapturing(false)
    }
  }, [thumbnailPreview, onThumbnailCapture])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Select Thumbnail
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Scrub through the video and select a frame to use as thumbnail
          </p>
        </div>

        {/* Video Preview */}
        <div className="p-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>

          {/* Timeline scrubber */}
          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Capture button */}
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={captureFrame}
              className="w-full"
            >
              Capture This Frame
            </Button>
          </div>

          {/* Thumbnail preview */}
          {thumbnailPreview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail Preview
              </p>
              <div className="w-40 aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isCapturing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!thumbnailPreview || isCapturing}
            loading={isCapturing}
          >
            Use This Thumbnail
          </Button>
        </div>
      </div>
    </div>
  )
}

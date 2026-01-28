'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Area, getCroppedImage } from '@/lib/utils/imageCrop'
import { Button } from '@/components/ui/Button'

interface OgImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  initialImage: string
}

export function OgImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  initialImage,
}: OgImageUploadModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Safe zone overlay state
  const containerRef = useRef<HTMLDivElement>(null)
  const [safeZone, setSafeZone] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const updateSafeZone = () => {
      const container = containerRef.current
      if (!container) return
      const cropArea = container.querySelector(
        '[class*="CropArea"]'
      ) as HTMLElement
      if (!cropArea) return

      const containerRect = container.getBoundingClientRect()
      const cropRect = cropArea.getBoundingClientRect()

      // Safe zone: 5% horizontal inset, 10% vertical inset
      const hInset = cropRect.width * 0.05
      const vInset = cropRect.height * 0.1

      setSafeZone({
        top: cropRect.top - containerRect.top + vInset,
        left: cropRect.left - containerRect.left + hInset,
        width: cropRect.width - 2 * hInset,
        height: cropRect.height - 2 * vInset,
      })
    }

    // Small delay to let react-easy-crop render the crop area
    const timer = setTimeout(updateSafeZone, 100)
    const observer = new ResizeObserver(updateSafeZone)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [isOpen])

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedBlob = await getCroppedImage(
        initialImage,
        croppedAreaPixels,
        'image/jpeg',
        0.9
      )

      const file = new File([croppedBlob], 'og-image.jpg', {
        type: 'image/jpeg',
      })

      onUpload(file)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Crop Social Sharing Image
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Adjust your image. The dashed border shows the safe zone &mdash; keep
            text and logos inside it to avoid being cropped on social media.
          </p>
        </div>

        {/* Cropper Area */}
        <div
          ref={containerRef}
          className="relative h-80 bg-gray-100 dark:bg-neutral-800"
        >
          <Cropper
            image={initialImage}
            crop={crop}
            zoom={zoom}
            aspect={1200 / 630}
            cropShape="rect"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />

          {/* Safe zone overlay */}
          {safeZone && (
            <div
              className="absolute border-2 border-dashed border-white/40 rounded-sm pointer-events-none z-10"
              style={{
                top: safeZone.top,
                left: safeZone.left,
                width: safeZone.width,
                height: safeZone.height,
              }}
            >
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-medium uppercase tracking-wider">
                Safe Zone
              </span>
            </div>
          )}
        </div>

        {/* Zoom Control */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Safe zone explanation */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong className="text-gray-700 dark:text-gray-300">
              What is the safe zone?
            </strong>{' '}
            Social media platforms like Facebook, LinkedIn and X/Twitter may crop
            the edges of your image when displaying it. The dashed border marks
            the area that will be visible on all platforms. Keep important text
            and logos inside this boundary.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isProcessing}
          >
            Save Image
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Area, getCroppedImage } from '@/lib/utils/imageCrop'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface MobileBannerUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  initialImage: string
}

export function MobileBannerUploadModal({
  isOpen,
  onClose,
  onUpload,
  initialImage,
}: MobileBannerUploadModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
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
        0.9,
        1200,  // Enforce exact width
        400    // Enforce exact height (3:1 ratio)
      )

      // Convert blob to File
      const file = new File([croppedBlob], 'mobile-banner.jpg', {
        type: 'image/jpeg',
      })

      onUpload(file)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to process image. Please try again.')
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
            Crop Mobile Banner
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Adjust your mobile banner image. The crop area represents a 3:1 aspect ratio (1200x400px).
          </p>
        </div>

        {/* Cropper Area */}
        <div className="relative h-80 bg-gray-100 dark:bg-neutral-800">
          <Cropper
            image={initialImage}
            crop={crop}
            zoom={zoom}
            aspect={3}
            cropShape="rect"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
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
            Save Mobile Banner
          </Button>
        </div>
      </div>
    </div>
  )
}

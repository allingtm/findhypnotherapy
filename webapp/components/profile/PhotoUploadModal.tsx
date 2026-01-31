'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Area, getCroppedImage } from '@/lib/utils/imageCrop'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  initialImage: string
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  onUpload,
  initialImage,
}: PhotoUploadModalProps) {
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
        0.9
      )

      // Convert blob to File
      const file = new File([croppedBlob], 'profile-photo.jpg', {
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
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Crop Profile Photo
          </h2>
        </div>

        {/* Cropper Area */}
        <div className="relative h-96 bg-gray-100 dark:bg-neutral-800">
          <Cropper
            image={initialImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
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
            Save Photo
          </Button>
        </div>
      </div>
    </div>
  )
}

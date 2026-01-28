'use client'

import { useState, useRef, useActionState } from 'react'
import { uploadServiceImageAction, deleteServiceImageAction } from '@/app/actions/therapist-services'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { validateImageFile } from '@/lib/utils/fileValidation'

interface ServiceImageUploadProps {
  serviceId: string
  currentImageUrl?: string | null
}

export function ServiceImageUpload({
  serviceId,
  currentImageUrl,
}: ServiceImageUploadProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction] = useActionState(uploadServiceImageAction, {
    success: false,
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Upload directly (no cropping for service images to keep it simple)
    const formData = new FormData()
    formData.append('service_id', serviceId)
    formData.append('image', file)

    await uploadAction(formData)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this image?')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)
    setDeleteSuccess(false)

    try {
      const result = await deleteServiceImageAction(serviceId)
      if (result.success) {
        setDeleteSuccess(true)
      } else {
        setDeleteError(result.error || 'Failed to delete image')
      }
    } catch {
      setDeleteError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const displayImageUrl = uploadState.imageUrl || currentImageUrl

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      <div className="relative">
        {displayImageUrl && !deleteSuccess ? (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
            <img
              src={displayImageUrl}
              alt="Service image"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-neutral-600">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <svg
                className="w-8 h-8 mx-auto mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">No image</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          {displayImageUrl && !deleteSuccess ? 'Change' : 'Upload'}
        </Button>

        {displayImageUrl && !deleteSuccess && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDelete}
            loading={isDeleting}
          >
            Remove
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Status Messages */}
      {uploadState.error && (
        <Alert type="error" message={uploadState.error} />
      )}
      {uploadState.success && (
        <Alert type="success" message="Image uploaded!" />
      )}
      {deleteError && (
        <Alert type="error" message={deleteError} />
      )}
      {deleteSuccess && (
        <Alert type="success" message="Image removed!" />
      )}
    </div>
  )
}

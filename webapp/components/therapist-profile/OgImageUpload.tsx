'use client'

import { useState, useRef, useActionState } from 'react'
import { OgImageUploadModal } from './OgImageUploadModal'
import { uploadOgImageAction, deleteOgImageAction } from '@/app/actions/therapist-profile'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { validateImageFile } from '@/lib/utils/fileValidation'
import { toast } from 'sonner'

interface OgImageUploadProps {
  currentOgImageUrl?: string | null
}

export function OgImageUpload({ currentOgImageUrl }: OgImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction] = useActionState(uploadOgImageAction, {
    success: false,
  })
  const [deleteState, deleteAction] = useActionState(deleteOgImageAction, {
    success: false,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setIsModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('og_image', file)

    await uploadAction(formData)
    setIsModalOpen(false)
    setSelectedImage(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    const formData = new FormData()
    await deleteAction(formData)
  }

  const displayImageUrl = uploadState.bannerUrl || currentOgImageUrl

  return (
    <div className="space-y-4">
      {/* OG Image Preview */}
      <div className="relative w-full">
        {displayImageUrl ? (
          <div className="relative w-full aspect-[1200/630] max-w-lg rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
            <img
              src={displayImageUrl}
              alt="Social sharing image"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-[1200/630] max-w-lg rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-gray-200 dark:border-neutral-700 border-dashed">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 opacity-75"
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
              <span className="text-sm font-medium">1200 x 630px</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Recommended: 1200x630px. JPG or PNG. Max 5MB.
        </p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayImageUrl ? 'Change Image' : 'Upload Image'}
          </Button>

          {displayImageUrl && (
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Remove
            </Button>
          )}
        </div>

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
        <Alert type="success" message="Social sharing image uploaded successfully!" />
      )}
      {deleteState.error && (
        <Alert type="error" message={deleteState.error} />
      )}
      {deleteState.success && (
        <Alert type="success" message="Social sharing image removed successfully!" />
      )}

      {/* Cropper Modal */}
      {selectedImage && (
        <OgImageUploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedImage(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
          onUpload={handleUpload}
          initialImage={selectedImage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Image"
        message="Are you sure you want to remove the social sharing image?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

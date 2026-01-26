'use client'

import { useState, useRef, useActionState } from 'react'
import { BannerUploadModal } from './BannerUploadModal'
import { uploadBannerAction, deleteBannerAction } from '@/app/actions/therapist-profile'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { validateImageFile } from '@/lib/utils/fileValidation'

interface BannerUploadProps {
  currentBannerUrl?: string | null
}

export function BannerUpload({ currentBannerUrl }: BannerUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction] = useActionState(uploadBannerAction, {
    success: false,
  })
  const [deleteState, deleteAction] = useActionState(deleteBannerAction, {
    success: false,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setIsModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('banner', file)

    await uploadAction(formData)
    setIsModalOpen(false)
    setSelectedImage(null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your profile banner?')) {
      return
    }

    const formData = new FormData()
    await deleteAction(formData)
  }

  const displayBannerUrl = uploadState.bannerUrl || currentBannerUrl

  return (
    <div className="space-y-4">
      {/* Banner Preview */}
      <div className="relative w-full">
        {displayBannerUrl ? (
          <div className="relative w-full h-40 md:h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
            <img
              src={displayBannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-40 md:h-48 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center border border-gray-200 dark:border-neutral-700">
            <div className="text-center text-white">
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
              <span className="text-sm font-medium opacity-90">No banner image</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Recommended size: 1200x300px. JPG, PNG or WebP. Max 5MB.
        </p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayBannerUrl ? 'Change Banner' : 'Upload Banner'}
          </Button>

          {displayBannerUrl && (
            <Button
              variant="secondary"
              onClick={handleDelete}
            >
              Remove
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Status Messages */}
      {uploadState.error && (
        <Alert type="error" message={uploadState.error} />
      )}
      {uploadState.success && (
        <Alert type="success" message="Banner uploaded successfully!" />
      )}
      {deleteState.error && (
        <Alert type="error" message={deleteState.error} />
      )}
      {deleteState.success && (
        <Alert type="success" message="Banner removed successfully!" />
      )}

      {/* Cropper Modal */}
      {selectedImage && (
        <BannerUploadModal
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
    </div>
  )
}

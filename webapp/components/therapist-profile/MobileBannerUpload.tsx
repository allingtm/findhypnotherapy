'use client'

import { useState, useRef, useActionState } from 'react'
import { MobileBannerUploadModal } from './MobileBannerUploadModal'
import { uploadMobileBannerAction, deleteMobileBannerAction } from '@/app/actions/therapist-profile'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { validateImageFile } from '@/lib/utils/fileValidation'

interface MobileBannerUploadProps {
  currentMobileBannerUrl?: string | null
}

export function MobileBannerUpload({ currentMobileBannerUrl }: MobileBannerUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction] = useActionState(uploadMobileBannerAction, {
    success: false,
  })
  const [deleteState, deleteAction] = useActionState(deleteMobileBannerAction, {
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
    formData.append('mobile_banner', file)

    await uploadAction(formData)
    setIsModalOpen(false)
    setSelectedImage(null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your mobile banner?')) {
      return
    }

    const formData = new FormData()
    await deleteAction(formData)
  }

  const displayBannerUrl = uploadState.bannerUrl || currentMobileBannerUrl

  return (
    <div className="space-y-4">
      {/* Banner Preview */}
      <div className="relative w-full">
        {displayBannerUrl ? (
          <div className="relative w-full h-32 md:h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
            <img
              src={displayBannerUrl}
              alt="Mobile banner"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 md:h-40 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center border border-gray-200 dark:border-neutral-700">
            <div className="text-center text-white">
              <svg
                className="w-10 h-10 mx-auto mb-2 opacity-75"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium opacity-90">No mobile banner</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          1200x400px. JPG or PNG. Max 5MB.
        </p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayBannerUrl ? 'Change' : 'Upload'}
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
        <Alert type="success" message="Mobile banner uploaded successfully!" />
      )}
      {deleteState.error && (
        <Alert type="error" message={deleteState.error} />
      )}
      {deleteState.success && (
        <Alert type="success" message="Mobile banner removed successfully!" />
      )}

      {/* Cropper Modal */}
      {selectedImage && (
        <MobileBannerUploadModal
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

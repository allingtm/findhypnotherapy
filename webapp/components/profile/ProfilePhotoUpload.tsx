'use client'

import { useState, useRef, useActionState } from 'react'
import { PhotoUploadModal } from './PhotoUploadModal'
import { uploadProfilePhotoAction, deleteProfilePhotoAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { validateImageFile } from '@/lib/utils/fileValidation'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
  userName: string
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  userName,
}: ProfilePhotoUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction] = useActionState(uploadProfilePhotoAction, {
    success: false,
  })
  const [deleteState, deleteAction] = useActionState(deleteProfilePhotoAction, {
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
    formData.append('photo', file)

    await uploadAction(formData)
    setIsModalOpen(false)
    setSelectedImage(null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
      return
    }

    const formData = new FormData()
    await deleteAction(formData)
  }

  const displayPhotoUrl = uploadState.photoUrl || currentPhotoUrl

  return (
    <div className="space-y-4">
      {/* Current Photo Preview */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {displayPhotoUrl ? (
            <img
              src={displayPhotoUrl}
              alt={userName}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-neutral-700"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-gray-200 dark:border-neutral-700">
              <span className="text-4xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a professional photo. JPG, PNG or WebP. Max 5MB.
          </p>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              {displayPhotoUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {displayPhotoUrl && (
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
      </div>

      {/* Status Messages */}
      {uploadState.error && (
        <Alert type="error" message={uploadState.error} />
      )}
      {uploadState.success && (
        <Alert type="success" message="Photo uploaded successfully!" />
      )}
      {deleteState.error && (
        <Alert type="error" message={deleteState.error} />
      )}
      {deleteState.success && (
        <Alert type="success" message="Photo removed successfully!" />
      )}

      {/* Cropper Modal */}
      {selectedImage && (
        <PhotoUploadModal
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

'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfileAction, updatePasswordAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ProfilePhotoUpload } from './ProfilePhotoUpload'

interface ProfileFormProps {
  user: {
    id: string
    email: string
    name: string
    photo_url?: string | null
  }
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending}>
      {children}
    </Button>
  )
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [profileState, profileAction] = useActionState(updateProfileAction, { success: false })
  const [passwordState, passwordAction] = useActionState(updatePasswordAction, { success: false })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  return (
    <div className="space-y-8">
      {/* Profile Photo Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Photo</h2>
        <ProfilePhotoUpload
          currentPhotoUrl={user.photo_url}
          userName={user.name}
        />
      </div>

      {/* Profile Information Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        <form action={profileAction} className="space-y-4">
          {profileState.error && <Alert type="error" message={profileState.error} />}
          {profileState.success && <Alert type="success" message="Profile updated successfully!" />}

          <Input
            label="Full Name"
            type="text"
            name="name"
            defaultValue={user.name}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            defaultValue={user.email}
            placeholder="your@email.com"
            required
          />

          <div className="flex gap-3">
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

        {!showPasswordForm ? (
          <Button
            variant="secondary"
            onClick={() => setShowPasswordForm(true)}
          >
            Change Password
          </Button>
        ) : (
          <form action={passwordAction} className="space-y-4">
            {passwordState.error && <Alert type="error" message={passwordState.error} />}
            {passwordState.success && (
              <Alert type="success" message="Password changed successfully!" />
            )}

            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              required
            />

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="At least 8 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
            />

            <div className="flex gap-3">
              <SubmitButton>Update Password</SubmitButton>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordForm(false)}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

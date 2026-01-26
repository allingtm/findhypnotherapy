'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  updateTherapistProfileAction,
  updateSpecializationsAction,
  togglePublishProfileAction,
} from '@/app/actions/therapist-profile'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { BannerUpload } from './BannerUpload'
import type { Tables } from '@/lib/types/database'

interface TherapistProfileFormProps {
  profile: Tables<'therapist_profiles'>
  specializations: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  selectedSpecializationIds: string[]
  userName: string
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending}>
      {children}
    </Button>
  )
}

function TextArea({
  label,
  error,
  className = '',
  id,
  ...props
}: {
  label: string
  error?: string
  className?: string
  id?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-neutral-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

export function TherapistProfileForm({
  profile,
  specializations,
  selectedSpecializationIds,
  userName,
}: TherapistProfileFormProps) {
  const [profileState, profileAction] = useActionState(updateTherapistProfileAction, { success: false })
  const [specializationsState, specializationsAction] = useActionState(updateSpecializationsAction, { success: false })
  const [publishState, publishAction] = useActionState(togglePublishProfileAction, { success: false })

  // Group specializations by category
  const groupedSpecializations = specializations.reduce((acc, spec) => {
    const category = spec.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(spec)
    return acc
  }, {} as Record<string, typeof specializations>)

  return (
    <div className="space-y-8">
      {/* Profile Status Banner */}
      <div className={`rounded-lg p-4 ${profile.is_published ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${profile.is_published ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              {profile.is_published ? 'Profile Published' : 'Profile Not Published'}
            </h3>
            <p className={`text-sm ${profile.is_published ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {profile.is_published
                ? `Your profile is visible in the directory at /directory/${profile.slug}`
                : 'Your profile is hidden from the public directory. Publish it when ready.'}
            </p>
          </div>
          <form action={publishAction}>
            <input type="hidden" name="publish" value={profile.is_published ? 'false' : 'true'} />
            <Button type="submit" variant={profile.is_published ? 'secondary' : 'primary'}>
              {profile.is_published ? 'Unpublish' : 'Publish Profile'}
            </Button>
          </form>
        </div>
        {publishState.error && <Alert type="error" message={publishState.error} />}
      </div>

      {/* Profile Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Profile Banner
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add a banner image to personalise your profile page. This appears at the top of your public profile.
        </p>
        <BannerUpload currentBannerUrl={profile.banner_url} />
      </div>

      {/* Professional Information */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Professional Information</h2>
        <form action={profileAction} className="space-y-4">
          {profileState.error && <Alert type="error" message={profileState.error} />}
          {profileState.success && <Alert type="success" message="Profile updated successfully!" />}

          <Input
            label="Professional Title"
            type="text"
            name="professional_title"
            defaultValue={profile.professional_title || ''}
            placeholder="e.g., Clinical Hypnotherapist, Certified Hypnotherapy Practitioner"
          />

          <Input
            label="Credentials (comma-separated)"
            type="text"
            name="credentials"
            defaultValue={profile.credentials?.join(', ') || ''}
            placeholder="e.g., CHt, CCHt, NLP Practitioner"
          />

          <Input
            label="Years of Experience"
            type="number"
            name="years_experience"
            defaultValue={profile.years_experience?.toString() || ''}
            placeholder="Enter number of years"
            min="0"
            max="100"
          />

          <TextArea
            label="Bio"
            name="bio"
            defaultValue={profile.bio || ''}
            placeholder="Tell potential clients about yourself, your approach, and what makes you unique..."
            rows={6}
          />

          <hr className="my-6 dark:border-neutral-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            defaultValue={profile.phone || ''}
            placeholder="+44 123 456 7890"
          />

          <Input
            label="Website URL"
            type="url"
            name="website_url"
            defaultValue={profile.website_url || ''}
            placeholder="https://yourwebsite.com"
          />

          <Input
            label="Booking URL"
            type="url"
            name="booking_url"
            defaultValue={profile.booking_url || ''}
            placeholder="https://calendly.com/yourname"
          />

          <hr className="my-6 dark:border-neutral-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Location</h3>

          <Input
            label="Address Line 1"
            type="text"
            name="address_line1"
            defaultValue={profile.address_line1 || ''}
            placeholder="123 Main Street"
          />

          <Input
            label="Address Line 2"
            type="text"
            name="address_line2"
            defaultValue={profile.address_line2 || ''}
            placeholder="Suite 100"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              type="text"
              name="city"
              defaultValue={profile.city || ''}
              placeholder="London"
            />

            <Input
              label="County/State"
              type="text"
              name="state_province"
              defaultValue={profile.state_province || ''}
              placeholder="Greater London"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              type="text"
              name="postal_code"
              defaultValue={profile.postal_code || ''}
              placeholder="SW1A 1AA"
            />

            <Input
              label="Country"
              type="text"
              name="country"
              defaultValue={profile.country || 'United Kingdom'}
              placeholder="United Kingdom"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address Visibility on Public Profile
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="radio"
                  name="address_visibility"
                  value="full"
                  defaultChecked={!profile.address_visibility || profile.address_visibility === 'full'}
                  className="mt-0.5 w-4 h-4 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Show full address</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Display your complete address on your public profile</span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="radio"
                  name="address_visibility"
                  value="city_only"
                  defaultChecked={profile.address_visibility === 'city_only'}
                  className="mt-0.5 w-4 h-4 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Show city/county only</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Only display your city, county/state, and country</span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="radio"
                  name="address_visibility"
                  value="hidden"
                  defaultChecked={profile.address_visibility === 'hidden'}
                  className="mt-0.5 w-4 h-4 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Hide location</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Do not display any location information on your profile</span>
                </div>
              </label>
            </div>
          </div>

          <hr className="my-6 dark:border-neutral-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Session Details</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Formats Offered
            </label>
            <div className="flex flex-wrap gap-4">
              {['in-person', 'online', 'phone'].map((format) => (
                <label key={format} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="session_format"
                    value={format}
                    defaultChecked={profile.session_format?.includes(format)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{format}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="offers_free_consultation"
                value="true"
                defaultChecked={profile.offers_free_consultation || false}
                className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Offer free initial consultation</span>
            </label>
          </div>

          <TextArea
            label="Availability Notes"
            name="availability_notes"
            defaultValue={profile.availability_notes || ''}
            placeholder="e.g., Monday-Friday 9am-5pm, Saturdays by appointment"
            rows={2}
          />

          <hr className="my-6 dark:border-neutral-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">SEO</h3>

          <TextArea
            label="Meta Description (for search engines)"
            name="meta_description"
            defaultValue={profile.meta_description || ''}
            placeholder="A brief description for search results (max 160 characters)"
            maxLength={160}
            rows={2}
          />

          <div className="flex gap-3 pt-4">
            <SubmitButton>Save Profile</SubmitButton>
          </div>
        </form>
      </div>

      {/* Specializations */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Specialisations</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select the issues and areas you specialise in treating. This helps clients find you when searching the directory.
        </p>

        <form action={specializationsAction} className="space-y-6">
          {specializationsState.error && <Alert type="error" message={specializationsState.error} />}
          {specializationsState.success && <Alert type="success" message="Specialisations updated successfully!" />}

          {Object.entries(groupedSpecializations).map(([category, specs]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specs.map((spec) => (
                  <label key={spec.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      name="specializations"
                      value={spec.id}
                      defaultChecked={selectedSpecializationIds.includes(spec.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{spec.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <SubmitButton>Save Specialisations</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useActionState, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { createServiceAction, updateServiceAction } from '@/app/actions/therapist-services'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import type { Tables, ServiceType, PriceDisplayMode } from '@/lib/types/database'
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_DESCRIPTIONS,
  PRICE_DISPLAY_LABELS,
  INCLUDES_SUGGESTIONS,
} from '@/lib/types/services'

interface ServiceFormProps {
  service?: Tables<'therapist_services'>
  onClose: () => void
  onSuccess?: () => void
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending}>
      {isEditing ? 'Update Service' : 'Add Service'}
    </Button>
  )
}

function TextArea({
  label,
  error,
  className = '',
  id,
  hint,
  ...props
}: {
  label: string
  error?: string
  className?: string
  id?: string
  hint?: string
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
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

function TagInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}) {
  const [inputValue, setInputValue] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  const unusedSuggestions = suggestions?.filter((s) => !value.includes(s)) || []

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-blue-600 dark:hover:text-blue-300"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 text-sm"
        />
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600"
        >
          Add
        </button>
      </div>
      {unusedSuggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {unusedSuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const isEditing = !!service
  const action = isEditing ? updateServiceAction : createServiceAction
  const [state, formAction] = useActionState(action, { success: false })

  // Form state
  const [serviceType, setServiceType] = useState<ServiceType>(service?.service_type || 'single_session')
  const [priceDisplayMode, setPriceDisplayMode] = useState<PriceDisplayMode>(service?.price_display_mode || 'exact')
  const [includes, setIncludes] = useState<string[]>(service?.includes || [])

  // Handle success
  useEffect(() => {
    if (state.success) {
      onSuccess?.()
      onClose()
    }
  }, [state.success, onSuccess, onClose])

  const showPriceFields = priceDisplayMode === 'exact' || priceDisplayMode === 'from'
  const showRangeFields = priceDisplayMode === 'range'
  const showSessionCountRange = serviceType === 'programme'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Edit Service' : 'Add Service'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form action={formAction} className="space-y-6">
            {state.error && <Alert type="error" message={state.error} />}

            {isEditing && (
              <input type="hidden" name="service_id" value={service.id} />
            )}
            <input type="hidden" name="includes" value={JSON.stringify(includes)} />

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['single_session', 'package', 'programme', 'consultation'] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${
                      serviceType === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-neutral-600 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_type"
                      value={type}
                      checked={serviceType === type}
                      onChange={(e) => setServiceType(e.target.value as ServiceType)}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {SERVICE_TYPE_LABELS[type]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {SERVICE_TYPE_DESCRIPTIONS[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>

              <Input
                label="Service Name"
                type="text"
                name="name"
                defaultValue={service?.name || ''}
                placeholder={
                  serviceType === 'single_session' ? 'e.g., Individual Hypnotherapy Session' :
                  serviceType === 'package' ? 'e.g., 5-Session Anxiety Relief Package' :
                  serviceType === 'programme' ? 'e.g., Stop Smoking Programme' :
                  'e.g., Free Discovery Call'
                }
                required
              />

              <Input
                label="Short Description (optional)"
                type="text"
                name="short_description"
                defaultValue={service?.short_description || ''}
                placeholder="Brief tagline shown on cards (max 100 chars)"
                maxLength={100}
              />

              <TextArea
                label="Full Description (optional)"
                name="description"
                defaultValue={service?.description || ''}
                placeholder="Detailed description of what this service includes..."
                rows={3}
                maxLength={500}
                hint="Up to 500 characters"
              />

              <Input
                label="Outcome Focus (optional)"
                type="text"
                name="outcome_focus"
                defaultValue={service?.outcome_focus || ''}
                placeholder="e.g., Quit smoking for good, Reduce anxiety naturally"
                maxLength={200}
              />
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Pricing</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Display Mode
                </label>
                <select
                  name="price_display_mode"
                  value={priceDisplayMode}
                  onChange={(e) => setPriceDisplayMode(e.target.value as PriceDisplayMode)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
                >
                  {(['exact', 'from', 'range', 'contact', 'free'] as const).map((mode) => (
                    <option key={mode} value={mode}>
                      {PRICE_DISPLAY_LABELS[mode]}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {priceDisplayMode === 'exact' && 'Shows the exact price (e.g., "\u00A380")'}
                  {priceDisplayMode === 'from' && 'Shows minimum price (e.g., "From \u00A380")'}
                  {priceDisplayMode === 'range' && 'Shows a price range (e.g., "\u00A380-\u00A3150")'}
                  {priceDisplayMode === 'contact' && 'Hides price, shows "Enquire for pricing"'}
                  {priceDisplayMode === 'free' && 'Shows as free or complimentary'}
                </p>
              </div>

              {(showPriceFields || showRangeFields) && (
                <div className="grid grid-cols-2 gap-4">
                  {showPriceFields && (
                    <Input
                      label="Price"
                      type="number"
                      name="price"
                      defaultValue={service?.price?.toString() || ''}
                      placeholder="80"
                      min="0"
                      step="0.01"
                      required
                    />
                  )}

                  {showRangeFields && (
                    <>
                      <Input
                        label="Minimum Price"
                        type="number"
                        name="price_min"
                        defaultValue={service?.price_min?.toString() || ''}
                        placeholder="80"
                        min="0"
                        step="0.01"
                        required
                      />
                      <Input
                        label="Maximum Price"
                        type="number"
                        name="price_max"
                        defaultValue={service?.price_max?.toString() || ''}
                        placeholder="150"
                        min="0"
                        step="0.01"
                        required
                      />
                    </>
                  )}

                  <input type="hidden" name="currency" value="GBP" />
                </div>
              )}
            </div>

            {/* Session Details */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Session Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duration (minutes)"
                  type="number"
                  name="duration_minutes"
                  defaultValue={service?.duration_minutes?.toString() || '60'}
                  placeholder="60"
                  min="15"
                  max="480"
                  required
                />

                {!showSessionCountRange ? (
                  <Input
                    label="Number of Sessions"
                    type="number"
                    name="session_count"
                    defaultValue={service?.session_count?.toString() || '1'}
                    placeholder="1"
                    min="1"
                    max="50"
                    required
                  />
                ) : (
                  <>
                    <Input
                      label="Min Sessions"
                      type="number"
                      name="session_count_min"
                      defaultValue={service?.session_count_min?.toString() || ''}
                      placeholder="3"
                      min="1"
                      max="50"
                    />
                    <Input
                      label="Max Sessions"
                      type="number"
                      name="session_count_max"
                      defaultValue={service?.session_count_max?.toString() || ''}
                      placeholder="6"
                      min="1"
                      max="50"
                    />
                    {/* Hidden field to satisfy validation */}
                    <input type="hidden" name="session_count" value={service?.session_count || '1'} />
                  </>
                )}
              </div>

              {(serviceType === 'package' || serviceType === 'programme') && priceDisplayMode === 'exact' && (
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="show_per_session_price"
                      value="true"
                      defaultChecked={service?.show_per_session_price !== false}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show per-session price breakdown
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* What's Included */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">What&apos;s Included</h3>

              <TagInput
                label="Included Items"
                value={includes}
                onChange={setIncludes}
                suggestions={INCLUDES_SUGGESTIONS[serviceType]}
                placeholder="e.g., Session recording, Follow-up email"
              />
            </div>

            {/* Display Options */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Display Options</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={service?.is_active !== false}
                    className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Service is active and visible on profile
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    value="true"
                    defaultChecked={service?.is_featured === true}
                    className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Feature this service (highlight on profile)
                  </span>
                </label>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-neutral-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Show on public profile:</p>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="show_price"
                      value="true"
                      defaultChecked={service?.show_price !== false}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show price
                    </span>
                  </label>

                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      name="show_session_details"
                      value="true"
                      defaultChecked={service?.show_session_details !== false}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show session details (duration, count)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      name="show_includes"
                      value="true"
                      defaultChecked={service?.show_includes !== false}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show what&apos;s included
                    </span>
                  </label>

                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      name="show_outcome_focus"
                      value="true"
                      defaultChecked={service?.show_outcome_focus !== false}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show outcome/tagline
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <SubmitButton isEditing={isEditing} />
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

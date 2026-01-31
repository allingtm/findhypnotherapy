'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { createServiceAction, updateServiceAction } from '@/app/actions/therapist-services'
import { Alert } from '@/components/ui/Alert'
import type { Tables, ServiceType, PriceDisplayMode, OnboardingRequirements } from '@/lib/types/database'
import { DEFAULT_ONBOARDING_REQUIREMENTS } from '@/lib/types/database'
import { IconX } from '@tabler/icons-react'
import {
  serviceNameSchema,
  serviceShortDescriptionSchema,
  serviceDescriptionSchema,
  serviceOutcomeFocusSchema,
  servicePriceSchema,
  servicePriceMinSchema,
  servicePriceMaxSchema,
  serviceDurationSchema,
  serviceSessionCountSchema,
} from '@/lib/validation/services'

// Wizard components
import { WizardProgress } from './service-wizard/WizardProgress'
import { WizardNavigation } from './service-wizard/WizardNavigation'
import { ServiceTypeStep } from './service-wizard/ServiceTypeStep'
import { BasicInfoStep } from './service-wizard/BasicInfoStep'
import { PricingStep } from './service-wizard/PricingStep'
import { SessionsStep } from './service-wizard/SessionsStep'
import { IncludesStep } from './service-wizard/IncludesStep'
import { DisplaySettingsStep } from './service-wizard/DisplaySettingsStep'

interface ServiceFormProps {
  service?: Tables<'therapist_services'>
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  // Step 1: Service Type
  serviceType: ServiceType
  // Step 2: Basic Info
  name: string
  shortDescription: string
  description: string
  outcomeFocus: string
  // Step 3: Pricing
  priceDisplayMode: PriceDisplayMode
  price: string
  priceMin: string
  priceMax: string
  // Step 4: Sessions
  durationMinutes: string
  sessionCount: string
  sessionCountMin: string
  sessionCountMax: string
  showPerSessionPrice: boolean
  // Step 5: Includes
  includes: string[]
  // Step 6: Display Settings
  isActive: boolean
  isFeatured: boolean
  showPrice: boolean
  showSessionDetails: boolean
  showIncludes: boolean
  showOutcomeFocus: boolean
  termsContent: string
  onboardingRequirements: OnboardingRequirements
}

const STEPS = [
  { id: 'type', label: 'Type' },
  { id: 'info', label: 'Info' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'includes', label: 'Includes' },
  { id: 'settings', label: 'Settings' },
]

export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const isEditing = !!service
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Initialize form data from existing service or defaults
  const [formData, setFormData] = useState<FormData>(() => ({
    serviceType: service?.service_type || 'single_session',
    name: service?.name || '',
    shortDescription: service?.short_description || '',
    description: service?.description || '',
    outcomeFocus: service?.outcome_focus || '',
    priceDisplayMode: service?.price_display_mode || 'exact',
    price: service?.price?.toString() || '',
    priceMin: service?.price_min?.toString() || '',
    priceMax: service?.price_max?.toString() || '',
    durationMinutes: service?.duration_minutes?.toString() || '60',
    sessionCount: service?.session_count?.toString() || '1',
    sessionCountMin: service?.session_count_min?.toString() || '',
    sessionCountMax: service?.session_count_max?.toString() || '',
    showPerSessionPrice: service?.show_per_session_price ?? true,
    includes: service?.includes || [],
    isActive: service?.is_active ?? true,
    isFeatured: service?.is_featured ?? false,
    showPrice: service?.show_price ?? true,
    showSessionDetails: service?.show_session_details ?? true,
    showIncludes: service?.show_includes ?? true,
    showOutcomeFocus: service?.show_outcome_focus ?? true,
    termsContent: service?.terms_content || '',
    onboardingRequirements: (service?.onboarding_requirements as OnboardingRequirements) || DEFAULT_ONBOARDING_REQUIREMENTS,
  }))

  // Update form data helper
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  // Validate single field on blur
  const validateField = (fieldName: string, value: string) => {
    try {
      let schema: z.ZodTypeAny | undefined
      switch (fieldName) {
        case 'name':
          schema = serviceNameSchema
          break
        case 'short_description':
          schema = serviceShortDescriptionSchema
          break
        case 'description':
          schema = serviceDescriptionSchema
          break
        case 'outcome_focus':
          schema = serviceOutcomeFocusSchema
          break
        case 'price':
          schema = servicePriceSchema
          break
        case 'price_min':
          schema = servicePriceMinSchema
          break
        case 'price_max':
          schema = servicePriceMaxSchema
          break
        case 'duration_minutes':
          schema = serviceDurationSchema
          break
        case 'session_count':
        case 'session_count_min':
        case 'session_count_max':
          schema = serviceSessionCountSchema
          break
      }
      if (schema) {
        schema.parse(value || undefined)
        setFieldErrors((prev) => {
          const updated = { ...prev }
          delete updated[fieldName]
          return updated
        })
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const message = err.issues[0]?.message || 'Invalid input'
        setFieldErrors((prev) => ({ ...prev, [fieldName]: [message] }))
      }
    }
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string[]> = {}

    switch (step) {
      case 0: // Service Type - always valid (has default)
        break

      case 1: // Basic Info
        if (!formData.name.trim()) {
          errors.name = ['Service name is required']
        } else if (formData.name.length > 100) {
          errors.name = ['Service name must be 100 characters or less']
        }
        break

      case 2: // Pricing
        if (formData.priceDisplayMode === 'exact' || formData.priceDisplayMode === 'from') {
          if (!formData.price) {
            errors.price = ['Price is required']
          } else if (parseFloat(formData.price) < 0) {
            errors.price = ['Price must be positive']
          }
        }
        if (formData.priceDisplayMode === 'range') {
          if (!formData.priceMin) {
            errors.price_min = ['Minimum price is required']
          }
          if (!formData.priceMax) {
            errors.price_max = ['Maximum price is required']
          }
          if (formData.priceMin && formData.priceMax) {
            if (parseFloat(formData.priceMax) <= parseFloat(formData.priceMin)) {
              errors.price_max = ['Maximum price must be greater than minimum']
            }
          }
        }
        break

      case 3: // Sessions
        if (!formData.durationMinutes) {
          errors.duration_minutes = ['Duration is required']
        } else {
          const duration = parseInt(formData.durationMinutes)
          if (duration < 15 || duration > 480) {
            errors.duration_minutes = ['Duration must be between 15 and 480 minutes']
          }
        }
        if (formData.serviceType === 'programme') {
          if (formData.sessionCountMin && formData.sessionCountMax) {
            if (parseInt(formData.sessionCountMax) < parseInt(formData.sessionCountMin)) {
              errors.session_count_max = ['Maximum sessions must be greater than or equal to minimum']
            }
          }
        } else {
          if (!formData.sessionCount) {
            errors.session_count = ['Number of sessions is required']
          }
        }
        break

      case 4: // Includes - no required fields
        break

      case 5: // Display Settings - no required fields
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    // Validate current step first
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Build FormData for server action
      const fd = new FormData()

      if (isEditing && service) {
        fd.append('service_id', service.id)
      }

      // Basic fields
      fd.append('service_type', formData.serviceType)
      fd.append('name', formData.name)
      fd.append('short_description', formData.shortDescription)
      fd.append('description', formData.description)
      fd.append('outcome_focus', formData.outcomeFocus)

      // Pricing
      fd.append('price_display_mode', formData.priceDisplayMode)
      if (formData.price) fd.append('price', formData.price)
      if (formData.priceMin) fd.append('price_min', formData.priceMin)
      if (formData.priceMax) fd.append('price_max', formData.priceMax)
      fd.append('currency', 'GBP')

      // Sessions
      fd.append('duration_minutes', formData.durationMinutes)
      if (formData.serviceType === 'programme') {
        fd.append('session_count', '1') // Default for programmes
        if (formData.sessionCountMin) fd.append('session_count_min', formData.sessionCountMin)
        if (formData.sessionCountMax) fd.append('session_count_max', formData.sessionCountMax)
      } else {
        fd.append('session_count', formData.sessionCount)
      }
      fd.append('show_per_session_price', formData.showPerSessionPrice.toString())

      // Includes (as JSON)
      fd.append('includes', JSON.stringify(formData.includes))

      // Display settings
      fd.append('is_active', formData.isActive.toString())
      fd.append('is_featured', formData.isFeatured.toString())
      fd.append('show_price', formData.showPrice.toString())
      fd.append('show_session_details', formData.showSessionDetails.toString())
      fd.append('show_includes', formData.showIncludes.toString())
      fd.append('show_outcome_focus', formData.showOutcomeFocus.toString())
      fd.append('terms_content', formData.termsContent)
      fd.append('onboarding_requirements', JSON.stringify(formData.onboardingRequirements))

      // Call appropriate action
      const action = isEditing ? updateServiceAction : createServiceAction
      const result = await action({ success: false }, fd)

      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        setError(result.error || 'Failed to save service')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Edit Service' : 'Add Service'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <WizardProgress currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          <div className="min-h-[300px]">
            {currentStep === 0 && (
              <ServiceTypeStep
                value={formData.serviceType}
                onChange={(serviceType) => updateFormData({ serviceType })}
              />
            )}

            {currentStep === 1 && (
              <BasicInfoStep
                name={formData.name}
                shortDescription={formData.shortDescription}
                description={formData.description}
                outcomeFocus={formData.outcomeFocus}
                serviceType={formData.serviceType}
                onChange={updateFormData}
                errors={fieldErrors}
                onBlur={validateField}
              />
            )}

            {currentStep === 2 && (
              <PricingStep
                priceDisplayMode={formData.priceDisplayMode}
                price={formData.price}
                priceMin={formData.priceMin}
                priceMax={formData.priceMax}
                onChange={updateFormData}
                errors={fieldErrors}
                onBlur={validateField}
              />
            )}

            {currentStep === 3 && (
              <SessionsStep
                serviceType={formData.serviceType}
                priceDisplayMode={formData.priceDisplayMode}
                durationMinutes={formData.durationMinutes}
                sessionCount={formData.sessionCount}
                sessionCountMin={formData.sessionCountMin}
                sessionCountMax={formData.sessionCountMax}
                showPerSessionPrice={formData.showPerSessionPrice}
                onChange={updateFormData}
                errors={fieldErrors}
                onBlur={validateField}
              />
            )}

            {currentStep === 4 && (
              <IncludesStep
                includes={formData.includes}
                serviceType={formData.serviceType}
                onChange={(includes) => updateFormData({ includes })}
              />
            )}

            {currentStep === 5 && (
              <DisplaySettingsStep
                isActive={formData.isActive}
                isFeatured={formData.isFeatured}
                showPrice={formData.showPrice}
                showSessionDetails={formData.showSessionDetails}
                showIncludes={formData.showIncludes}
                showOutcomeFocus={formData.showOutcomeFocus}
                termsContent={formData.termsContent}
                onboardingRequirements={formData.onboardingRequirements}
                serviceId={service?.id}
                imageUrl={service?.image_url}
                onChange={updateFormData}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700">
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  )
}

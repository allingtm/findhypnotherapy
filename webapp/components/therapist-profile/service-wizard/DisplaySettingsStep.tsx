"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { ServiceImageUpload } from "../ServiceImageUpload"
import type { OnboardingRequirements, OnboardingFieldRequirement } from "@/lib/types/database"
import { IconChevronDown, IconChevronUp, IconUserPlus } from "@tabler/icons-react"

interface DisplaySettingsStepProps {
  isActive: boolean
  isFeatured: boolean
  showPrice: boolean
  showSessionDetails: boolean
  showIncludes: boolean
  showOutcomeFocus: boolean
  termsContent: string
  onboardingRequirements: OnboardingRequirements
  serviceId?: string
  imageUrl?: string | null
  onChange: (updates: Partial<{
    isActive: boolean
    isFeatured: boolean
    showPrice: boolean
    showSessionDetails: boolean
    showIncludes: boolean
    showOutcomeFocus: boolean
    termsContent: string
    onboardingRequirements: OnboardingRequirements
  }>) => void
}

const ONBOARDING_FIELDS: { key: keyof OnboardingRequirements; label: string; description: string }[] = [
  { key: "phone", label: "Phone Number", description: "Client's contact phone number" },
  { key: "address", label: "Address", description: "Street address, city, and postal code" },
  { key: "emergency_contact", label: "Emergency Contact", description: "Name and phone of emergency contact" },
  { key: "health_info", label: "Health Information", description: "Health conditions, medications, allergies" },
  { key: "gp_info", label: "GP Details", description: "Client's GP name and practice" },
]

export function DisplaySettingsStep({
  isActive,
  isFeatured,
  showPrice,
  showSessionDetails,
  showIncludes,
  showOutcomeFocus,
  termsContent,
  onboardingRequirements,
  serviceId,
  imageUrl,
  onChange,
}: DisplaySettingsStepProps) {
  const [showOnboardingConfig, setShowOnboardingConfig] = useState(false)

  const updateOnboardingField = (field: keyof OnboardingRequirements, value: OnboardingFieldRequirement) => {
    onChange({
      onboardingRequirements: { ...onboardingRequirements, [field]: value },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Display & Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure visibility, terms, and client requirements
        </p>
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Service Visibility</h4>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => onChange({ isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Service is active and visible</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => onChange({ isFeatured: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Feature this service (highlight on profile)</span>
        </label>
      </div>

      {/* Display Options */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Profile Display Options</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showPrice}
              onChange={(e) => onChange({ showPrice: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Show price</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showSessionDetails}
              onChange={(e) => onChange({ showSessionDetails: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Show session details</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showIncludes}
              onChange={(e) => onChange({ showIncludes: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Show what&apos;s included</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showOutcomeFocus}
              onChange={(e) => onChange({ showOutcomeFocus: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Show outcome focus</span>
          </label>
        </div>
      </div>

      {/* Service Image (only for editing) */}
      {serviceId && (
        <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Service Image</h4>
          <ServiceImageUpload
            serviceId={serviceId}
            currentImageUrl={imageUrl}
          />
        </div>
      )}

      {/* Service Terms */}
      <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Service-Specific Terms</h4>
        <textarea
          value={termsContent}
          onChange={(e) => onChange({ termsContent: e.target.value })}
          placeholder="e.g., This package requires full payment before the first session. Cancellations within 48 hours are non-refundable..."
          rows={3}
          maxLength={5000}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional. Leave empty to use your global Terms & Conditions.
        </p>
      </div>

      {/* Client Onboarding Requirements */}
      <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setShowOnboardingConfig(!showOnboardingConfig)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <IconUserPlus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Client Onboarding Requirements
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure what information clients provide when onboarding
              </p>
            </div>
          </div>
          {showOnboardingConfig ? (
            <IconChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <IconChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showOnboardingConfig && (
          <div className="mt-4 space-y-4 pl-7">
            {ONBOARDING_FIELDS.map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <div className="flex gap-1">
                  {(["required", "optional", "hidden"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateOnboardingField(key, value)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        onboardingRequirements[key] === value
                          ? value === "required"
                            ? "bg-blue-600 text-white"
                            : value === "optional"
                            ? "bg-green-600 text-white"
                            : "bg-gray-500 text-white"
                          : "bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      {value === "required" ? "Required" : value === "optional" ? "Optional" : "Hidden"}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <strong>Required:</strong> Client must provide this info &bull;{" "}
              <strong>Optional:</strong> Shown but not required &bull;{" "}
              <strong>Hidden:</strong> Not shown at all
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

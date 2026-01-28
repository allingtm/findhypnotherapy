"use client"

import { Input } from "@/components/ui/Input"
import type { ServiceType } from "@/lib/types/database"

interface BasicInfoStepProps {
  name: string
  shortDescription: string
  description: string
  outcomeFocus: string
  serviceType: ServiceType
  onChange: (updates: Partial<{
    name: string
    shortDescription: string
    description: string
    outcomeFocus: string
  }>) => void
  errors: Record<string, string[]>
}

const PLACEHOLDER_NAMES: Record<ServiceType, string> = {
  single_session: "e.g., Hypnotherapy Session",
  package: "e.g., Weight Loss Package",
  programme: "e.g., Stop Smoking Programme",
  consultation: "e.g., Free Discovery Call",
  subscription: "e.g., Monthly Support",
}

export function BasicInfoStep({
  name,
  shortDescription,
  description,
  outcomeFocus,
  serviceType,
  onChange,
  errors,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tell us about your service
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add a name and description to help clients understand what you offer
        </p>
      </div>

      <Input
        label="Service Name *"
        value={name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder={PLACEHOLDER_NAMES[serviceType]}
        maxLength={100}
        error={errors.name?.[0]}
      />

      <div>
        <Input
          label="Short Description"
          value={shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="A brief tagline shown on service cards"
          maxLength={100}
        />
        <p className="-mt-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
          Optional. Keep it short and compelling.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe what's included, the process, and what clients can expect..."
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional. Up to 500 characters.
        </p>
      </div>

      <div>
        <Input
          label="Outcome Focus"
          value={outcomeFocus}
          onChange={(e) => onChange({ outcomeFocus: e.target.value })}
          placeholder="e.g., Quit smoking for good, Reduce anxiety naturally"
          maxLength={200}
        />
        <p className="-mt-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
          Optional. What transformation or result can clients expect?
        </p>
      </div>
    </div>
  )
}

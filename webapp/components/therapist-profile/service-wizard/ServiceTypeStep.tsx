"use client"

import type { ServiceType } from "@/lib/types/database"
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_DESCRIPTIONS } from "@/lib/types/services"
import { IconCalendarEvent, IconPackage, IconTrendingUp, IconMessageCircle } from "@tabler/icons-react"

interface ServiceTypeStepProps {
  value: ServiceType
  onChange: (value: ServiceType) => void
}

const SERVICE_TYPE_ICONS: Record<ServiceType, React.ReactNode> = {
  single_session: <IconCalendarEvent className="w-8 h-8" />,
  package: <IconPackage className="w-8 h-8" />,
  programme: <IconTrendingUp className="w-8 h-8" />,
  consultation: <IconMessageCircle className="w-8 h-8" />,
  subscription: <IconCalendarEvent className="w-8 h-8" />,
}

// Only show these 4 types in the wizard (subscription is rarely used)
const VISIBLE_TYPES: ServiceType[] = ["single_session", "package", "programme", "consultation"]

export function ServiceTypeStep({ value, onChange }: ServiceTypeStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          What type of service is this?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose the type that best describes your offering
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {VISIBLE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              value === type
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800"
            }`}
          >
            <div
              className={`mb-3 ${
                value === type
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {SERVICE_TYPE_ICONS[type]}
            </div>
            <h4
              className={`font-semibold mb-1 ${
                value === type
                  ? "text-blue-900 dark:text-blue-100"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {SERVICE_TYPE_LABELS[type]}
            </h4>
            <p
              className={`text-sm ${
                value === type
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {SERVICE_TYPE_DESCRIPTIONS[type]}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

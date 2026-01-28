"use client"

import { Input } from "@/components/ui/Input"
import type { ServiceType, PriceDisplayMode } from "@/lib/types/database"

interface SessionsStepProps {
  serviceType: ServiceType
  priceDisplayMode: PriceDisplayMode
  durationMinutes: string
  sessionCount: string
  sessionCountMin: string
  sessionCountMax: string
  showPerSessionPrice: boolean
  onChange: (updates: Partial<{
    durationMinutes: string
    sessionCount: string
    sessionCountMin: string
    sessionCountMax: string
    showPerSessionPrice: boolean
  }>) => void
  errors: Record<string, string[]>
}

export function SessionsStep({
  serviceType,
  priceDisplayMode,
  durationMinutes,
  sessionCount,
  sessionCountMin,
  sessionCountMax,
  showPerSessionPrice,
  onChange,
  errors,
}: SessionsStepProps) {
  const isProgramme = serviceType === "programme"
  const isPackageOrProgramme = serviceType === "package" || serviceType === "programme"
  const canShowPerSessionPrice = isPackageOrProgramme && priceDisplayMode === "exact"

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Session details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Define the duration and number of sessions included
        </p>
      </div>

      <div>
        <Input
          label="Duration (minutes) *"
          type="number"
          value={durationMinutes}
          onChange={(e) => onChange({ durationMinutes: e.target.value })}
          placeholder="60"
          min={15}
          max={480}
          error={errors.duration_minutes?.[0]}
        />
        {!errors.duration_minutes && (
          <p className="-mt-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
            Per session. Between 15 and 480 minutes.
          </p>
        )}
      </div>

      {isProgramme ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Programmes have a flexible number of sessions. Set the typical range.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Sessions"
              type="number"
              value={sessionCountMin}
              onChange={(e) => onChange({ sessionCountMin: e.target.value })}
              placeholder="4"
              min={1}
              max={50}
              error={errors.session_count_min?.[0]}
            />
            <Input
              label="Maximum Sessions"
              type="number"
              value={sessionCountMax}
              onChange={(e) => onChange({ sessionCountMax: e.target.value })}
              placeholder="8"
              min={1}
              max={50}
              error={errors.session_count_max?.[0]}
            />
          </div>
        </div>
      ) : (
        <Input
          label="Number of Sessions *"
          type="number"
          value={sessionCount}
          onChange={(e) => onChange({ sessionCount: e.target.value })}
          placeholder={serviceType === "single_session" || serviceType === "consultation" ? "1" : "4"}
          min={1}
          max={50}
          error={errors.session_count?.[0]}
        />
      )}

      {canShowPerSessionPrice && (
        <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showPerSessionPrice}
              onChange={(e) => onChange({ showPerSessionPrice: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Show per-session price breakdown
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Displays the calculated price per session on your profile
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

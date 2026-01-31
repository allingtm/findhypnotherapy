"use client"

import { Input } from "@/components/ui/Input"
import type { PriceDisplayMode } from "@/lib/types/database"
import { PRICE_DISPLAY_LABELS } from "@/lib/types/services"

interface PricingStepProps {
  priceDisplayMode: PriceDisplayMode
  price: string
  priceMin: string
  priceMax: string
  onChange: (updates: Partial<{
    priceDisplayMode: PriceDisplayMode
    price: string
    priceMin: string
    priceMax: string
  }>) => void
  errors: Record<string, string[]>
  onBlur?: (fieldName: string, value: string) => void
}

export function PricingStep({
  priceDisplayMode,
  price,
  priceMin,
  priceMax,
  onChange,
  errors,
  onBlur,
}: PricingStepProps) {
  const showSinglePrice = priceDisplayMode === "exact" || priceDisplayMode === "from"
  const showRangePrice = priceDisplayMode === "range"
  const showAnyPrice = showSinglePrice || showRangePrice

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Set your pricing
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose how you want to display your price to potential clients
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Price Display Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(PRICE_DISPLAY_LABELS) as [PriceDisplayMode, string][]).map(
            ([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ priceDisplayMode: mode })}
                className={`px-4 py-3 rounded-lg border text-left transition-colors ${
                  priceDisplayMode === mode
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
                    : "border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium">{label}</span>
                <span className="block text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                  {mode === "exact" && "e.g., £80"}
                  {mode === "from" && "e.g., From £80"}
                  {mode === "range" && "e.g., £80 - £150"}
                  {mode === "contact" && "Enquire for pricing"}
                  {mode === "free" && "No charge"}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {showSinglePrice && (
        <Input
          label={priceDisplayMode === "from" ? "Starting Price (£) *" : "Price (£) *"}
          type="number"
          value={price}
          onChange={(e) => onChange({ price: e.target.value })}
          onBlur={(e) => onBlur?.("price", e.target.value)}
          placeholder="80"
          min={0}
          step={0.01}
          error={errors.price?.[0]}
        />
      )}

      {showRangePrice && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Minimum Price (£) *"
            type="number"
            value={priceMin}
            onChange={(e) => onChange({ priceMin: e.target.value })}
            onBlur={(e) => onBlur?.("price_min", e.target.value)}
            placeholder="80"
            min={0}
            step={0.01}
            error={errors.price_min?.[0]}
          />
          <Input
            label="Maximum Price (£) *"
            type="number"
            value={priceMax}
            onChange={(e) => onChange({ priceMax: e.target.value })}
            onBlur={(e) => onBlur?.("price_max", e.target.value)}
            placeholder="150"
            min={0}
            step={0.01}
            error={errors.price_max?.[0]}
          />
        </div>
      )}

      {!showAnyPrice && (
        <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          {priceDisplayMode === "contact" && (
            <p>Clients will see &quot;Enquire for pricing&quot; and can contact you directly.</p>
          )}
          {priceDisplayMode === "free" && (
            <p>This service will be displayed as free or complimentary.</p>
          )}
        </div>
      )}
    </div>
  )
}

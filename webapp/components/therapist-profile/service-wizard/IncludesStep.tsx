"use client"

import { useState } from "react"
import type { ServiceType } from "@/lib/types/database"
import { INCLUDES_SUGGESTIONS } from "@/lib/types/services"
import { IconPlus, IconX } from "@tabler/icons-react"

interface IncludesStepProps {
  includes: string[]
  serviceType: ServiceType
  onChange: (includes: string[]) => void
}

export function IncludesStep({ includes, serviceType, onChange }: IncludesStepProps) {
  const [inputValue, setInputValue] = useState("")
  const suggestions = INCLUDES_SUGGESTIONS[serviceType] || []

  // Filter out suggestions that are already added
  const availableSuggestions = suggestions.filter(
    (s) => !includes.some((i) => i.toLowerCase() === s.toLowerCase())
  )

  const addItem = (item: string) => {
    const trimmed = item.trim()
    if (trimmed && !includes.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...includes, trimmed])
    }
    setInputValue("")
  }

  const removeItem = (index: number) => {
    onChange(includes.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem(inputValue)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          What&apos;s included?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          List the features and benefits clients get with this service
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter to add..."
          className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => addItem(inputValue)}
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <IconPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Current items */}
      {includes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {includes.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Suggestions (click to add):
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addItem(suggestion)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {includes.length === 0 && (
        <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          No items added yet. Add features like session recordings, follow-up emails, or support.
        </div>
      )}
    </div>
  )
}

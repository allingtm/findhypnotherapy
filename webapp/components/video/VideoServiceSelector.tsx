'use client'

import { useCallback } from 'react'
import type { Tables } from '@/lib/types/database'

type TherapistService = Tables<'therapist_services'>

interface VideoServiceSelectorProps {
  services: TherapistService[]
  selectedServiceIds: string[]
  onChange: (serviceIds: string[]) => void
}

export function VideoServiceSelector({
  services,
  selectedServiceIds,
  onChange,
}: VideoServiceSelectorProps) {
  const activeServices = services.filter(s => s.is_active)

  const toggleService = useCallback(
    (serviceId: string) => {
      if (selectedServiceIds.includes(serviceId)) {
        onChange(selectedServiceIds.filter(id => id !== serviceId))
      } else {
        onChange([...selectedServiceIds, serviceId])
      }
    },
    [selectedServiceIds, onChange]
  )

  if (activeServices.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Linked Services (optional)
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Add services in the Services tab to link them to your videos.
        </p>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Linked Services (optional)
      </label>
      <div className="flex flex-wrap gap-2">
        {activeServices.map((service) => {
          const isSelected = selectedServiceIds.includes(service.id)
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'
              }`}
            >
              {service.name}
            </button>
          )
        })}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
        Select the services this video relates to.
      </p>
    </div>
  )
}

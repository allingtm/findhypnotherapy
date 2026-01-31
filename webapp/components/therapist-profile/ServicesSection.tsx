'use client'

import { useState, useTransition } from 'react'
import { deleteServiceAction } from '@/app/actions/therapist-services'
import { Button } from '@/components/ui/Button'
import { ServiceForm } from './ServiceForm'
import type { Tables } from '@/lib/types/database'
import { SERVICE_TYPE_LABELS } from '@/lib/types/services'
import { formatServicePrice, formatSessionCount } from '@/lib/utils/price-display'
import { toast } from 'sonner'

interface ServicesSectionProps {
  services: Tables<'therapist_services'>[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Tables<'therapist_services'> | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (serviceId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteServiceAction(serviceId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete service')
      }
    })
  }

  const handleEdit = (service: Tables<'therapist_services'>) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingService(null)
  }

  const activeServices = services.filter(s => s.is_active)
  const inactiveServices = services.filter(s => !s.is_active)

  // Sort: featured first, then by display_order
  const sortedActiveServices = [...activeServices].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Services & Pricing</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add the services you offer with their prices and durations.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No services added yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Add at least one service to publish your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Services */}
          {sortedActiveServices.map((service) => {
            const priceDisplay = formatServicePrice({
              price: service.price,
              price_min: service.price_min,
              price_max: service.price_max,
              price_display_mode: service.price_display_mode,
              session_count: service.session_count,
              show_per_session_price: service.show_per_session_price,
            })

            const sessionDisplay = formatSessionCount({
              service_type: service.service_type,
              session_count: service.session_count,
              session_count_min: service.session_count_min,
              session_count_max: service.session_count_max,
              duration_minutes: service.duration_minutes,
            })

            return (
              <div
                key={service.id}
                className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
                  service.is_featured
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {service.name}
                    </h3>
                    {service.is_featured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        Featured
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 capitalize">
                      {SERVICE_TYPE_LABELS[service.service_type]}
                    </span>
                  </div>

                  {service.outcome_focus && (
                    <p className={`text-sm text-blue-600 dark:text-blue-400 mt-1 ${service.show_outcome_focus === false ? 'line-through opacity-50' : ''}`}>
                      {service.outcome_focus}
                    </p>
                  )}

                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className={`font-semibold ${
                      priceDisplay.mode === 'free'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-900 dark:text-gray-100'
                    } ${service.show_price === false ? 'line-through opacity-50' : ''}`}>
                      {priceDisplay.formatted}
                    </span>
                    <span>•</span>
                    <span className={service.show_session_details === false ? 'line-through opacity-50' : ''}>
                      {sessionDisplay}
                    </span>
                    {priceDisplay.perSessionFormatted && (
                      <>
                        <span>•</span>
                        <span className={`text-green-600 dark:text-green-400 ${service.show_price === false ? 'line-through opacity-50' : ''}`}>
                          {priceDisplay.perSessionFormatted}
                        </span>
                      </>
                    )}
                  </div>

                  {/* What's Included */}
                  {service.includes && service.includes.length > 0 && (
                    <div className={`mt-3 flex flex-wrap gap-1.5 ${service.show_includes === false ? 'opacity-50' : ''}`}>
                      {service.includes.map((item, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ${service.show_includes === false ? 'line-through' : ''}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit service"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    disabled={isPending}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete service"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}

          {/* Inactive Services */}
          {inactiveServices.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Inactive Services
                </p>
              </div>
              {inactiveServices.map((service) => {
                const priceDisplay = formatServicePrice({
                  price: service.price,
                  price_min: service.price_min,
                  price_max: service.price_max,
                  price_display_mode: service.price_display_mode,
                      session_count: service.session_count,
                  show_per_session_price: service.show_per_session_price,
                })

                const sessionDisplay = formatSessionCount({
                  service_type: service.service_type,
                  session_count: service.session_count,
                  session_count_min: service.session_count_min,
                  session_count_max: service.session_count_max,
                  duration_minutes: service.duration_minutes,
                })

                return (
                  <div
                    key={service.id}
                    className="flex items-start justify-between p-4 border border-gray-200 dark:border-neutral-700 rounded-lg opacity-60"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {service.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                          Inactive
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{priceDisplay.formatted}</span>
                        <span>•</span>
                        <span>{sessionDisplay}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit service"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        disabled={isPending}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete service"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService || undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

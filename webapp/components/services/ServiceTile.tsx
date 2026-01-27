'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ServiceType, PriceDisplayMode } from '@/lib/types/database'
import { SERVICE_TYPE_LABELS } from '@/lib/types/services'
import { formatServicePrice } from '@/lib/utils/price-display'

interface ServiceTileProps {
  service: {
    id: string
    name: string
    image_url: string | null
    service_type: ServiceType
    price_display_mode: PriceDisplayMode
    price: number | null
    price_min: number | null
    price_max: number | null
    session_count: number
    show_per_session_price: boolean | null
    is_featured: boolean | null
    show_price: boolean | null
  }
  therapistSlug: string
}

export function ServiceTile({ service, therapistSlug }: ServiceTileProps) {
  const priceDisplay = formatServicePrice({
    price: service.price,
    price_min: service.price_min,
    price_max: service.price_max,
    price_display_mode: service.price_display_mode,
    session_count: service.session_count,
    show_per_session_price: service.show_per_session_price,
  })

  return (
    <Link
      href={`/directory/${therapistSlug}/service/${service.id}`}
      className="group block rounded-lg overflow-hidden bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-neutral-700"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 dark:bg-neutral-700 overflow-hidden">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}

        {/* Featured badge */}
        {service.is_featured && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 leading-snug">
          {service.name}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 rounded">
            {SERVICE_TYPE_LABELS[service.service_type]}
          </span>

          {service.show_price !== false && (
            <span className={`text-sm font-semibold ${
              priceDisplay.mode === 'free'
                ? 'text-green-600 dark:text-green-400'
                : priceDisplay.mode === 'contact'
                ? 'text-gray-500 dark:text-gray-400 text-xs'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {priceDisplay.formatted}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

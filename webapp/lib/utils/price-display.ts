import type { PriceDisplayMode, ServiceType } from '@/lib/types/database'

// UK only - always use GBP
const CURRENCY_SYMBOL = '\u00A3'

export interface DisplayPrice {
  mode: PriceDisplayMode
  formatted: string
  sortValue: number | null
  perSessionFormatted?: string
}

export interface ServicePriceInput {
  price: number | null
  price_min: number | null
  price_max: number | null
  price_display_mode: PriceDisplayMode
  session_count: number
  show_per_session_price: boolean | null
}

function formatAmount(amount: number): string {
  // Format with no decimals if whole number, otherwise 2 decimals
  const formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2)
  return `${CURRENCY_SYMBOL}${formatted}`
}

export function formatServicePrice(service: ServicePriceInput): DisplayPrice {
  switch (service.price_display_mode) {
    case 'exact':
      return {
        mode: 'exact',
        formatted: formatAmount(service.price!),
        sortValue: service.price,
        perSessionFormatted:
          service.session_count > 1 && service.show_per_session_price !== false
            ? `${formatAmount(service.price! / service.session_count)}/session`
            : undefined,
      }

    case 'from':
      return {
        mode: 'from',
        formatted: `From ${formatAmount(service.price!)}`,
        sortValue: service.price,
      }

    case 'range':
      return {
        mode: 'range',
        formatted: `${formatAmount(service.price_min!)}-${formatAmount(service.price_max!)}`,
        sortValue: service.price_min,
      }

    case 'contact':
      return {
        mode: 'contact',
        formatted: 'Enquire for pricing',
        sortValue: null,
      }

    case 'free':
      return {
        mode: 'free',
        formatted: 'Free',
        sortValue: 0,
      }
  }
}

export interface DirectoryPriceInput {
  directory_price: number | null
  price_display_mode: PriceDisplayMode
}

export function getDirectoryDisplayPrice(services: DirectoryPriceInput[]): string | null {
  if (!services || services.length === 0) return null

  const pricedServices = services.filter((s) => s.directory_price !== null)

  if (pricedServices.length === 0) {
    const hasContactServices = services.some((s) => s.price_display_mode === 'contact')
    return hasContactServices ? 'Enquire for pricing' : null
  }

  const minPrice = Math.min(...pricedServices.map((s) => s.directory_price!))

  if (minPrice === 0) {
    // Check if there are non-free services too
    const nonFreeServices = pricedServices.filter((s) => s.directory_price! > 0)
    if (nonFreeServices.length > 0) {
      const minNonFree = Math.min(...nonFreeServices.map((s) => s.directory_price!))
      return `Free consultation | From ${CURRENCY_SYMBOL}${minNonFree}`
    }
    return 'Free consultation available'
  }

  return `From ${CURRENCY_SYMBOL}${minPrice}`
}

export interface SessionCountInput {
  service_type: ServiceType
  session_count: number
  session_count_min: number | null
  session_count_max: number | null
  duration_minutes: number
}

export function formatSessionCount(service: SessionCountInput): string {
  const duration = `${service.duration_minutes} min`

  // For programmes with variable session counts
  if (
    service.service_type === 'programme' &&
    service.session_count_min &&
    service.session_count_max
  ) {
    if (service.session_count_min === service.session_count_max) {
      return `${service.session_count_min} \u00D7 ${duration} sessions`
    }
    return `${service.session_count_min}-${service.session_count_max} \u00D7 ${duration} sessions`
  }

  // For packages with fixed session counts
  if (service.session_count > 1) {
    return `${service.session_count} \u00D7 ${duration} sessions`
  }

  // Single session
  return duration
}

export function formatPrice(amount: number): string {
  return formatAmount(amount)
}

export const COOKIE_CONSENT_KEY = 'cookie-consent'
export const COOKIE_CONSENT_VERSION = '1.0'

export type CookieCategory = 'necessary'

export interface CookieConsent {
  version: string
  timestamp: number
  categories: Record<CookieCategory, boolean>
}

export const COOKIE_CATEGORY_INFO: Record<CookieCategory, {
  name: string
  description: string
  required: boolean
}> = {
  necessary: {
    name: 'Necessary',
    description: 'Essential cookies required for the website to function properly. These include authentication, calendar integration, and session management.',
    required: true,
  },
}

export const DEFAULT_CONSENT: CookieConsent = {
  version: COOKIE_CONSENT_VERSION,
  timestamp: 0,
  categories: {
    necessary: true,
  }
}

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as CookieConsent
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function setStoredConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
}

export function hasConsentForCategory(category: CookieCategory): boolean {
  const consent = getStoredConsent()
  return consent?.categories[category] ?? false
}

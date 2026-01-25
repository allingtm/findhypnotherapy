'use client'

import { useCookieConsent } from '@/components/providers/CookieConsentProvider'

export function CookieSettingsLink() {
  const { openPreferences } = useCookieConsent()

  return (
    <button
      onClick={openPreferences}
      className="hover:text-neutral-800 dark:hover:text-white transition-colors"
    >
      Cookie Settings
    </button>
  )
}

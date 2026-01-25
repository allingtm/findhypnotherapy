'use client'

import { useState, useEffect } from 'react'
import { useCookieConsent } from '@/components/providers/CookieConsentProvider'
import { Button } from '@/components/ui/Button'
import { CookiePreferencesModal } from './CookiePreferencesModal'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function CookieConsentBanner() {
  const { hasConsented, showBanner, showPreferencesModal, acceptAll, rejectAll, openPreferences, closePreferences } = useCookieConsent()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (hasConsented && !showPreferencesModal) return null
  if (!showBanner && !showPreferencesModal) return null

  return (
    <>
      {showBanner && !hasConsented && (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[60]",
            "bg-white dark:bg-neutral-900",
            "border-t border-gray-200 dark:border-neutral-700",
            "shadow-lg",
            "p-4 md:p-6"
          )}
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  We value your privacy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We use cookies to enhance your browsing experience and analyse our traffic.
                  By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                  <Link
                    href="/privacy"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Learn more
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={openPreferences}
                  className="order-3 sm:order-1"
                >
                  Customise
                </Button>
                <Button
                  variant="secondary"
                  onClick={rejectAll}
                  className="order-2"
                >
                  Reject All
                </Button>
                <Button
                  variant="primary"
                  onClick={acceptAll}
                  className="order-1 sm:order-3"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreferencesModal && (
        <CookiePreferencesModal onClose={closePreferences} />
      )}
    </>
  )
}

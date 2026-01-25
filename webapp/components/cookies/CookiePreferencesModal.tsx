'use client'

import { useState, useEffect } from 'react'
import { useCookieConsent } from '@/components/providers/CookieConsentProvider'
import { Button } from '@/components/ui/Button'
import { COOKIE_CATEGORY_INFO, CookieCategory } from '@/lib/cookies/consent'
import { cn } from '@/lib/utils'
import { IconX } from '@tabler/icons-react'

interface CookiePreferencesModalProps {
  onClose: () => void
}

export function CookiePreferencesModal({ onClose }: CookiePreferencesModalProps) {
  const { consent, updateConsent, acceptAll, rejectAll } = useCookieConsent()
  const [localPreferences, setLocalPreferences] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    analytics: consent?.categories.analytics ?? false,
    marketing: consent?.categories.marketing ?? false,
  })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSave = () => {
    updateConsent(localPreferences)
    onClose()
  }

  const handleAcceptAll = () => {
    acceptAll()
    onClose()
  }

  const handleRejectAll = () => {
    rejectAll()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
          <h2
            id="cookie-preferences-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Cookie Preferences
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <IconX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We use cookies to improve your experience on our site. You can choose which categories of cookies you allow below.
          </p>

          <div className="space-y-4">
            {(Object.keys(COOKIE_CATEGORY_INFO) as CookieCategory[]).map((category) => {
              const info = COOKIE_CATEGORY_INFO[category]
              return (
                <div
                  key={category}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gray-50 dark:bg-neutral-800"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {info.name}
                      {info.required && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Required)
                        </span>
                      )}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {info.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={localPreferences[category]}
                      onChange={(e) => setLocalPreferences(prev => ({
                        ...prev,
                        [category]: e.target.checked
                      }))}
                      disabled={info.required}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      "w-11 h-6 rounded-full",
                      "bg-gray-200 dark:bg-neutral-700",
                      "peer-checked:bg-purple-600",
                      "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                      "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                      "after:bg-white after:rounded-full after:h-5 after:w-5",
                      "after:transition-all peer-checked:after:translate-x-full",
                      "after:shadow-sm"
                    )} />
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button variant="secondary" onClick={handleAcceptAll}>
              Accept All
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

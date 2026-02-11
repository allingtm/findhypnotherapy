'use client'

import { useEffect } from 'react'
import { useCookieConsent } from '@/components/providers/CookieConsentProvider'
import { Button } from '@/components/ui/Button'
import { COOKIE_CATEGORY_INFO, CookieCategory } from '@/lib/cookies/consent'
import { IconX, IconCheck } from '@tabler/icons-react'
import Link from 'next/link'

interface CookiePreferencesModalProps {
  onClose: () => void
}

export function CookiePreferencesModal({ onClose }: CookiePreferencesModalProps) {
  const { acceptAll } = useCookieConsent()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleAccept = () => {
    acceptAll()
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
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md sm:max-w-xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
          <h2
            id="cookie-preferences-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Cookie Information
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
            We only use essential cookies required for the website to function properly. We do not use any analytics, advertising, or tracking cookies.
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
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (Required)
                      </span>
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {info.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-11 h-6">
                    <IconCheck className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            For more details, see our <Link href="/cookie-policy" className="text-purple-600 dark:text-purple-400 hover:underline">Cookie Policy</Link>.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAccept}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { CookieConsent, CookieCategory } from '@/lib/cookies/consent'
import {
  getStoredConsent,
  setStoredConsent,
  COOKIE_CONSENT_VERSION,
} from '@/lib/cookies/consent'

interface CookieConsentContextValue {
  consent: CookieConsent | null
  hasConsented: boolean
  showBanner: boolean
  showPreferencesModal: boolean
  acceptAll: () => void
  rejectAll: () => void
  updateConsent: (categories: Partial<Record<CookieCategory, boolean>>) => void
  openPreferences: () => void
  closePreferences: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined)

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [hasConsented, setHasConsented] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)

  useEffect(() => {
    const stored = getStoredConsent()
    if (stored) {
      setConsent(stored)
      setHasConsented(true)
      setShowBanner(false)
    } else {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = useCallback((categories: Record<CookieCategory, boolean>) => {
    const newConsent: CookieConsent = {
      version: COOKIE_CONSENT_VERSION,
      timestamp: Date.now(),
      categories,
    }
    setStoredConsent(newConsent)
    setConsent(newConsent)
    setHasConsented(true)
    setShowBanner(false)
    setShowPreferencesModal(false)
  }, [])

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
    })
  }, [saveConsent])

  const rejectAll = useCallback(() => {
    saveConsent({
      necessary: true,
    })
  }, [saveConsent])

  const updateConsent = useCallback((categories: Partial<Record<CookieCategory, boolean>>) => {
    const current = consent?.categories ?? {
      necessary: true,
    }
    saveConsent({
      ...current,
      ...categories,
      necessary: true, // Always required
    })
  }, [consent, saveConsent])

  const openPreferences = useCallback(() => {
    setShowPreferencesModal(true)
  }, [])

  const closePreferences = useCallback(() => {
    setShowPreferencesModal(false)
  }, [])

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented,
        showBanner,
        showPreferencesModal,
        acceptAll,
        rejectAll,
        updateConsent,
        openPreferences,
        closePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}

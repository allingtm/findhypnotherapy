'use client'

import { useEffect, useRef, useCallback } from 'react'

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

export function Turnstile({ onVerify, onError, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return

    // Remove existing widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // Widget may already be removed
      }
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.warn('Turnstile site key not configured')
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme: 'auto',
      size: 'normal',
    })
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Check if script is already being loaded
    if (scriptLoadedRef.current) return

    // Load the Turnstile script
    scriptLoadedRef.current = true

    window.onloadTurnstileCallback = () => {
      renderWidget()
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget may already be removed
        }
      }
    }
  }, [renderWidget])

  return <div ref={containerRef} className={className} />
}

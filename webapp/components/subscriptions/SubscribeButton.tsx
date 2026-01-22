'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/stripe'

export function SubscribeButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      await createCheckoutSession()
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Loading...' : 'Start Free Trial'}
    </button>
  )
}

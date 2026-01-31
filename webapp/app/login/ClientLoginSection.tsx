'use client'

import { useState } from 'react'
import { IconMail, IconLoader2, IconCheck, IconArrowLeft } from '@tabler/icons-react'
import { requestMagicLinkAction } from '@/app/actions/client-portal'

interface ClientLoginSectionProps {
  onBack: () => void
}

export function ClientLoginSection({ onBack }: ClientLoginSectionProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await requestMagicLinkAction(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to send login link')
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <IconCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Check Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a login link.
          Click the link in the email to access your client portal.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          The link will expire in 1 hour. If you don&apos;t see the email,
          check your spam folder or contact your therapist.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          Are you a therapist?{' '}
          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Use member login instead
          </button>
        </p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <IconArrowLeft className="w-4 h-4 mr-2" />
        Back to options
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <IconMail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Client Login
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter your email to receive a login link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="client-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address
          </label>
          <input
            id="client-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <IconLoader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <IconMail className="w-5 h-5" />
              Send Login Link
            </>
          )}
        </button>
      </form>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { IconMail, IconLoader2, IconCheck } from "@tabler/icons-react"
import { requestMagicLinkAction } from "@/app/actions/client-portal"

const emailSchema = z.string().min(1, "Email is required").email("Please enter a valid email address")

export function PortalLoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateEmail = (value: string) => {
    try {
      emailSchema.parse(value)
      setEmailError(null)
    } catch (err: any) {
      const message = err.errors?.[0]?.message || "Invalid email"
      setEmailError(message)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await requestMagicLinkAction(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Failed to send login link")
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <IconCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;ve sent a login link to <strong>{email}</strong>. Click the
              link in the email to access your client portal.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              The link will expire in 1 hour. If you don&apos;t see the email,
              check your spam folder.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IconMail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Client Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your email to receive a login link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => validateEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  emailError
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-neutral-700"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !!emailError}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
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

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Not a client yet?{" "}
              <Link
                href="/directory"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Find a therapist
              </Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Are you a therapist?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Member login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

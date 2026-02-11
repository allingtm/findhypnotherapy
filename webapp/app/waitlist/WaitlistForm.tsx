'use client'

import { useState, useActionState, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { z } from 'zod'
import { joinWaitlistAction } from '@/app/actions/waitlist'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Turnstile } from '@/components/ui/Turnstile'
import { parseFieldErrors } from '@/lib/utils/errorParsing'

// Client-side validation schema
const waitlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be 255 characters or less'),
  isQualified: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must confirm that you are a fully qualified hypnotherapist',
    }),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the Privacy Policy and Terms & Conditions',
    }),
})

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending} disabled={disabled || pending} className="w-full">
      Join Waiting List
    </Button>
  )
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlistAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isQualifiedChecked, setIsQualifiedChecked] = useState(false)
  const [acceptedTermsChecked, setAcceptedTermsChecked] = useState(false)
  const [earlyAdopterChecked, setEarlyAdopterChecked] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  // Form is valid when all required fields are filled
  const isFormValid =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    isQualifiedChecked &&
    acceptedTermsChecked

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  // Client-side validation on blur
  const validateField = (name: string, value: string | boolean) => {
    try {
      if (name === 'name') {
        waitlistSchema.shape.name.parse(value)
      } else if (name === 'email') {
        waitlistSchema.shape.email.parse(value)
      } else if (name === 'isQualified') {
        waitlistSchema.shape.isQualified.parse(value)
      } else if (name === 'acceptedTerms') {
        waitlistSchema.shape.acceptedTerms.parse(value)
      }
      setClientErrors(prev => ({ ...prev, [name]: '' }))
    } catch (error: any) {
      let message = 'Invalid input'

      if (typeof error.message === 'string' && error.message.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(error.message)
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
            message = parsed[0].message
          }
        } catch {
          message = error.message
        }
      } else if (error instanceof Error) {
        message = error.message
      }

      setClientErrors(prev => ({ ...prev, [name]: message }))
    }
  }

  // Merge server and client errors, preferring server errors
  const errors = {
    name: parseFieldErrors(state.fieldErrors, 'name', clientErrors.name),
    email: parseFieldErrors(state.fieldErrors, 'email', clientErrors.email),
    isQualified: parseFieldErrors(state.fieldErrors, 'isQualified', clientErrors.isQualified),
    acceptedTerms: parseFieldErrors(state.fieldErrors, 'acceptedTerms', clientErrors.acceptedTerms),
  }

  if (state.success) {
    return (
      <div>
        <div className="border rounded-lg p-6 mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
          <div className="flex flex-col items-center text-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            <div>
              <p className="font-semibold text-lg">You&apos;re on the list!</p>
              <p className="text-sm mt-1">Check your email for a confirmation. We&apos;ll let you know when registration opens.</p>
              <p className="text-xs mt-2 opacity-75">Don&apos;t see it? Check your spam or junk folder.</p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form action={formAction}>
      {state.error && <Alert type="error" message={state.error} />}

      <Input
        label="Full Name"
        type="text"
        name="name"
        placeholder="Jane Smith"
        required
        maxLength={100}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        onBlur={(e) => validateField('name', e.target.value)}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="jane@example.com"
        required
        maxLength={255}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        onBlur={(e) => validateField('email', e.target.value)}
      />

      {/* Qualified Therapist Confirmation */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="isQualified"
            name="isQualified"
            value="true"
            checked={isQualifiedChecked}
            onChange={(e) => {
              setIsQualifiedChecked(e.target.checked)
              validateField('isQualified', e.target.checked)
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="isQualified" className="text-sm text-gray-700 dark:text-gray-300">
            I confirm that I am a <strong>fully qualified hypnotherapist</strong>
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-7">
          This means you hold a recognised hypnotherapy qualification (e.g., Diploma in Hypnotherapy) and are registered with a professional body such as the <strong>NCH</strong> (National Council for Hypnotherapy), <strong>GHR</strong> (General Hypnotherapy Register), <strong>CNHC</strong> (Complementary &amp; Natural Healthcare Council), <strong>AfSFH</strong> (Association for Solution Focused Hypnotherapy), or equivalent.
        </p>
        {errors.isQualified && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 ml-7">{errors.isQualified}</p>
        )}
      </div>

      {/* Early Adopter Opt-in */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="earlyAdopter"
            name="earlyAdopter"
            value="true"
            checked={earlyAdopterChecked}
            onChange={(e) => setEarlyAdopterChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="earlyAdopter" className="text-sm text-gray-700 dark:text-gray-300">
            I&apos;d like to be an <strong>early adopter</strong> and receive early access as part of our soft launch
          </label>
        </div>
      </div>

      {/* Privacy Policy & Terms Acceptance */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptedTerms"
            name="acceptedTerms"
            value="true"
            checked={acceptedTermsChecked}
            onChange={(e) => {
              setAcceptedTermsChecked(e.target.checked)
              validateField('acceptedTerms', e.target.checked)
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="acceptedTerms" className="text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
              Terms &amp; Conditions
            </Link>
          </label>
        </div>
        {errors.acceptedTerms && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 ml-7">{errors.acceptedTerms}</p>
        )}
      </div>

      {/* Turnstile spam protection */}
      <div className="mb-6">
        <Turnstile onVerify={handleTurnstileVerify} />
        <input type="hidden" name="turnstileToken" value={turnstileToken} />
      </div>

      <SubmitButton disabled={!isFormValid} />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

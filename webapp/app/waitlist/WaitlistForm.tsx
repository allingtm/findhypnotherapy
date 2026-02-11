'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { z } from 'zod'
import { joinWaitlistAction } from '@/app/actions/waitlist'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending} className="w-full">
      Join Waiting List
    </Button>
  )
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlistAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [isQualifiedChecked, setIsQualifiedChecked] = useState(false)
  const [acceptedTermsChecked, setAcceptedTermsChecked] = useState(false)
  const [earlyAdopterChecked, setEarlyAdopterChecked] = useState(false)

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
        <Alert
          type="success"
          message="You're on the list! We'll email you when registration opens."
        />
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
        error={errors.name}
        onBlur={(e) => validateField('name', e.target.value)}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="jane@example.com"
        required
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

      <SubmitButton />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

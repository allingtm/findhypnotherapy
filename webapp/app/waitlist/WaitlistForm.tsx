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

  // Client-side validation on blur
  const validateField = (name: string, value: string) => {
    try {
      if (name === 'name') {
        waitlistSchema.shape.name.parse(value)
      } else if (name === 'email') {
        waitlistSchema.shape.email.parse(value)
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

'use client'

import { useState, useActionState, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { forgotPasswordSchema } from '@/lib/validation/auth'
import { forgotPasswordAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Turnstile } from '@/components/ui/Turnstile'
import { parseFieldErrors } from '@/lib/utils/errorParsing'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending} className="w-full">
      Send Reset Link
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const validateField = (name: string, value: string) => {
    try {
      if (name === 'email') {
        forgotPasswordSchema.shape.email.parse(value)
      }
      setClientErrors(prev => ({ ...prev, [name]: '' }))
    } catch (error: any) {
      const message = error.errors?.[0]?.message || 'Invalid input'
      setClientErrors(prev => ({ ...prev, [name]: message }))
    }
  }

  const errors = {
    email: parseFieldErrors(state.fieldErrors, 'email', clientErrors.email),
  }

  if (state.success) {
    return (
      <div>
        <Alert
          type="success"
          message="If an account exists with that email, you will receive a password reset link shortly."
        />
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Remember your password?{' '}
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
        label="Email"
        type="email"
        name="email"
        placeholder="john@example.com"
        required
        error={errors.email}
        onBlur={(e) => validateField('email', e.target.value)}
      />

      {/* Turnstile spam protection */}
      <div className="mb-4">
        <Turnstile onVerify={handleTurnstileVerify} />
        <input type="hidden" name="turnstileToken" value={turnstileToken} />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Remember your password?{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginSchema } from '@/lib/validation/auth'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { parseFieldErrors } from '@/lib/utils/errorParsing'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending} className="w-full">
      Sign In
    </Button>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(loginAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  // Diagnostic logging in development
  if (process.env.NODE_ENV === 'development' && state.fieldErrors) {
    console.log('[LoginForm] Received fieldErrors:', state.fieldErrors)
  }

  // Client-side validation on blur
  const validateField = (name: string, value: string) => {
    try {
      if (name === 'email') {
        loginSchema.shape.email.parse(value)
      } else if (name === 'password') {
        loginSchema.shape.password.parse(value)
      }
      setClientErrors(prev => ({ ...prev, [name]: '' }))
    } catch (error: any) {
      const message = error.errors?.[0]?.message || 'Invalid input'
      setClientErrors(prev => ({ ...prev, [name]: message }))
    }
  }

  // Redirect on success
  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [state.success, router])

  // Merge server and client errors, preferring server errors
  const errors = {
    email: parseFieldErrors(state.fieldErrors, 'email', clientErrors.email),
    password: parseFieldErrors(state.fieldErrors, 'password', clientErrors.password),
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

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        required
        error={errors.password}
        onBlur={(e) => validateField('password', e.target.value)}
      />

      <div className="text-right mb-4">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}

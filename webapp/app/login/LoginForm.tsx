'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginSchema } from '@/lib/validation/auth'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

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
  const [state, formAction] = useFormState(loginAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

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
      setClientErrors(prev => ({ ...prev, [name]: error.errors[0].message }))
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
    email: state.fieldErrors?.email?.[0] || clientErrors.email,
    password: state.fieldErrors?.password?.[0] || clientErrors.password,
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

      <SubmitButton />

      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}

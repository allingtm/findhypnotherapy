'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { registerSchema } from '@/lib/validation/auth'
import { registerAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { parseFieldErrors } from '@/lib/utils/errorParsing'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending} className="w-full">
      Create Account
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  // Diagnostic logging in development
  if (process.env.NODE_ENV === 'development' && state.fieldErrors) {
    console.log('[RegisterForm] Received fieldErrors:', state.fieldErrors)
  }

  // Client-side validation on blur
  const validateField = (name: string, value: string, formData?: FormData) => {
    try {
      if (name === 'invitationCode') {
        if (value !== 'LetMeIn') {
          throw new Error('Invalid invitation code')
        }
      } else if (name === 'name') {
        registerSchema.shape.name.parse(value)
      } else if (name === 'email') {
        registerSchema.shape.email.parse(value)
      } else if (name === 'password') {
        registerSchema.shape.password.parse(value)
      } else if (name === 'confirmPassword' && formData) {
        const password = formData.get('password')
        if (value !== password) {
          throw new Error("Passwords don't match")
        }
      }
      setClientErrors(prev => ({ ...prev, [name]: '' }))
    } catch (error: any) {
      // Extract message from Zod error
      let message = 'Invalid input'

      // Check if error.message is stringified JSON (Zod behavior)
      if (typeof error.message === 'string' && error.message.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(error.message)
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
            message = parsed[0].message
          }
        } catch {
          // If JSON parsing fails, treat as regular error message
          message = error.message
        }
      } else if (error instanceof Error) {
        // Standard Error (like our custom "Passwords don't match")
        message = error.message
      }

      setClientErrors(prev => ({ ...prev, [name]: message }))
    }
  }


  // Merge server and client errors, preferring server errors
  const errors = {
    invitationCode: clientErrors.invitationCode, // No server error for this field
    name: parseFieldErrors(state.fieldErrors, 'name', clientErrors.name),
    email: parseFieldErrors(state.fieldErrors, 'email', clientErrors.email),
    password: parseFieldErrors(state.fieldErrors, 'password', clientErrors.password),
    confirmPassword: parseFieldErrors(state.fieldErrors, 'confirmPassword', clientErrors.confirmPassword),
  }

  if (state.success) {
    return (
      <div>
        <Alert
          type="success"
          message="Registration successful! Please check your email to confirm your account."
        />
        <p className="text-center text-sm text-gray-600 mt-4">
          Already confirmed?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
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
        label="Invitation Code"
        type="text"
        name="invitationCode"
        placeholder="Enter your invitation code"
        required
        error={errors.invitationCode}
        onBlur={(e) => validateField('invitationCode', e.target.value)}
      />

      <Input
        label="Full Name"
        type="text"
        name="name"
        placeholder="John Doe"
        required
        error={errors.name}
        onBlur={(e) => validateField('name', e.target.value)}
      />

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
        placeholder="At least 8 characters"
        required
        error={errors.password}
        onBlur={(e) => validateField('password', e.target.value)}
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Confirm your password"
        required
        error={errors.confirmPassword}
        onBlur={(e) => {
          const form = e.target.form
          if (form) {
            validateField('confirmPassword', e.target.value, new FormData(form))
          }
        }}
      />

      <SubmitButton />

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

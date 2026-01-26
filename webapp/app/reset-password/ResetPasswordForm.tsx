'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { resetPasswordSchema } from '@/lib/validation/auth'
import { resetPasswordAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { parseFieldErrors } from '@/lib/utils/errorParsing'
import { PasswordStrengthBar } from '@/components/ui/PasswordStrengthBar'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" loading={pending} className="w-full">
      Update Password
    </Button>
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(resetPasswordAction, { success: false })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [password, setPassword] = useState('')

  // Redirect to login after successful password reset
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000) // 2 second delay to show success message
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  const validateField = (name: string, value: string, formData?: FormData) => {
    try {
      if (name === 'password') {
        resetPasswordSchema.shape.password.parse(value)
      } else if (name === 'confirmPassword' && formData) {
        const password = formData.get('password')
        if (value !== password) {
          throw new Error("Passwords don't match")
        }
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

  const errors = {
    password: parseFieldErrors(state.fieldErrors, 'password', clientErrors.password),
    confirmPassword: parseFieldErrors(state.fieldErrors, 'confirmPassword', clientErrors.confirmPassword),
  }

  if (state.success) {
    return (
      <div>
        <Alert
          type="success"
          message="Your password has been updated successfully. Redirecting to login..."
        />
        <div className="mt-6">
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Sign In Now
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction}>
      {state.error && <Alert type="error" message={state.error} />}

      <Input
        label="New Password"
        type="password"
        name="password"
        placeholder="At least 8 characters"
        required
        error={errors.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={(e) => validateField('password', e.target.value)}
      />
      <PasswordStrengthBar password={password} />

      <Input
        label="Confirm New Password"
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
    </form>
  )
}

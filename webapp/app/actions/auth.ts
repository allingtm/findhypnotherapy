'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validation/auth'

// Response type for form actions
type ActionResponse = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

// Login action
export async function loginAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  // Parse and validate form data
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validation = loginSchema.safeParse(rawData)

  if (!validation.success) {
    // Best practice: Extract only message strings from Zod errors
    const fieldErrors: Record<string, string[]> = {}

    // Iterate through issues to build clean error messages
    validation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString()
      if (fieldName) {
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        // Only push the message string, nothing else
        fieldErrors[fieldName].push(issue.message)
      }
    })

    // Diagnostic logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login Action] Validation failed:', {
        action: 'login',
        fieldErrors,
        serializedCheck: JSON.stringify(fieldErrors)
      })
    }

    return {
      success: false,
      fieldErrors,
    }
  }

  const { email, password } = validation.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please confirm your email address before logging in',
        }
      }
      if (error.message.includes('Invalid')) {
        return {
          success: false,
          error: 'Invalid email or password',
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Register action
export async function registerAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  // Validate invitation code first (if required)
  const requiredCode = process.env.INVITATION_CODE
  if (requiredCode) {
    const invitationCode = formData.get('invitationCode')
    if (invitationCode !== requiredCode) {
      return {
        success: false,
        error: 'Invalid invitation code',
      }
    }
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const validation = registerSchema.safeParse(rawData)

  if (!validation.success) {
    // Best practice: Extract only message strings from Zod errors
    const fieldErrors: Record<string, string[]> = {}

    // Iterate through issues to build clean error messages
    validation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString()
      if (fieldName) {
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        // Only push the message string, nothing else
        fieldErrors[fieldName].push(issue.message)
      }
    })

    // Diagnostic logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Register Action] Validation failed:', {
        action: 'register',
        fieldErrors,
        serializedCheck: JSON.stringify(fieldErrors)
      })
    }

    return {
      success: false,
      fieldErrors,
    }
  }

  const { name, email, password } = validation.data

  // Input sanitization (prevent XSS)
  const sanitizedName = name.replace(/[<>]/g, '')

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: sanitizedName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

// Forgot password action - sends reset email
export async function forgotPasswordAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email'),
  }

  const validation = forgotPasswordSchema.safeParse(rawData)

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}

    validation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString()
      if (fieldName) {
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        fieldErrors[fieldName].push(issue.message)
      }
    })

    return {
      success: false,
      fieldErrors,
    }
  }

  const { email } = validation.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback/reset-password`,
    })

    if (error) {
      // Don't reveal if email exists or not (security best practice)
      console.error('Password reset error:', error)
    }

    // Always return success to prevent email enumeration attacks
    return { success: true }
  } catch (err) {
    console.error('Forgot password error:', err)
    // Still return success for security
    return { success: true }
  }
}

// Reset password action - updates password after clicking reset link
export async function resetPasswordAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  const rawData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const validation = resetPasswordSchema.safeParse(rawData)

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}

    validation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString()
      if (fieldName) {
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        fieldErrors[fieldName].push(issue.message)
      }
    })

    return {
      success: false,
      fieldErrors,
    }
  }

  const { password } = validation.data

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired reset link. Please request a new password reset.',
      }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return {
        success: false,
        error: 'Failed to update password. Please try again.',
      }
    }

    // Sign out the user after password reset so they can log in fresh
    await supabase.auth.signOut()

    return { success: true }
  } catch (err) {
    console.error('Reset password error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

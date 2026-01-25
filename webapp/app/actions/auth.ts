'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validation/auth'

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

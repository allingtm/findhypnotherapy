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
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
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
  // Parse and validate form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const validation = registerSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
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

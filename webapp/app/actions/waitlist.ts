'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sendgrid'
import { getWaitlistConfirmationEmail } from '@/lib/email/templates'

// Validation schema for waitlist signup
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
    .string()
    .refine((val) => val === 'true', {
      message: 'You must confirm that you are a fully qualified hypnotherapist',
    }),
  acceptedTerms: z
    .string()
    .refine((val) => val === 'true', {
      message: 'You must accept the Privacy Policy and Terms & Conditions',
    }),
  earlyAdopter: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
})

// Response type for form action
type ActionResponse = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function joinWaitlistAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  // Parse and validate form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    isQualified: formData.get('isQualified'),
    acceptedTerms: formData.get('acceptedTerms'),
    earlyAdopter: formData.get('earlyAdopter'),
  }

  const validation = waitlistSchema.safeParse(rawData)

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

  const { name, email, earlyAdopter } = validation.data

  // Sanitize name (prevent XSS)
  const sanitizedName = name.replace(/[<>]/g, '')

  try {
    const supabase = createAdminClient()

    // Insert into waiting list (use upsert to handle duplicates gracefully)
    const { error } = await supabase
      .from('waiting_list')
      .insert({
        name: sanitizedName,
        email: email.toLowerCase(),
        early_adopter: earlyAdopter,
        is_qualified: true, // Always true since form validation requires it
        accepted_terms_at: new Date().toISOString(), // Record when terms were accepted
      })

    // If duplicate email, still return success (prevent enumeration)
    if (error && error.code === '23505') {
      // Duplicate key - email already exists, but we don't reveal this
      return { success: true }
    }

    if (error) {
      console.error('Waitlist signup error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      }
    }

    // Send confirmation email
    try {
      const emailContent = getWaitlistConfirmationEmail({ recipientName: sanitizedName })
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      })
    } catch (emailError) {
      // Log but don't fail the signup if email fails
      console.error('Failed to send waitlist confirmation email:', emailError)
    }

    return { success: true }
  } catch (err) {
    console.error('Waitlist signup error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

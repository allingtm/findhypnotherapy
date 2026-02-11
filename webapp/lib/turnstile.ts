/**
 * Server-side Turnstile token verification
 */

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

interface VerifyResult {
  success: boolean
  error?: string
}

export async function verifyTurnstileToken(token: string | null): Promise<VerifyResult> {
  // Skip verification in development if no secret key configured
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.warn('Turnstile secret key not configured - skipping verification')
    return { success: true }
  }

  if (!token) {
    return { success: false, error: 'Please complete the security check' }
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data: TurnstileVerifyResponse = await response.json()

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes'])
      return { success: false, error: 'Security check failed. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Turnstile verification error:', error)
    // Don't block users if Turnstile service is unavailable
    return { success: true }
  }
}

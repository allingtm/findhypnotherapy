import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null

  // Create the redirect response first
  const redirectUrl = new URL('/reset-password', request.url)
  const response = NextResponse.redirect(redirectUrl)

  if (token_hash && type) {
    const cookieStore = await cookies()

    // Create a Supabase client that writes cookies to BOTH the cookie store AND the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set on the cookie store (for server components)
              cookieStore.set(name, value, options)
              // Also set on the response (critical for redirect)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Use verifyOtp instead of exchangeCodeForSession - doesn't require PKCE code verifier
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (error) {
      // Redirect to forgot-password with error if token is invalid/expired
      const errorUrl = new URL('/forgot-password', request.url)
      errorUrl.searchParams.set('error', 'expired')
      return NextResponse.redirect(errorUrl)
    }
  }

  // Return the response with cookies attached
  return response
}

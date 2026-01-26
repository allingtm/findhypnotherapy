import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Create the redirect response first
  const redirectUrl = new URL('/reset-password', request.url)
  const response = NextResponse.redirect(redirectUrl)

  if (code) {
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

    await supabase.auth.exchangeCodeForSession(code)
  }

  // Return the response with cookies attached
  return response
}

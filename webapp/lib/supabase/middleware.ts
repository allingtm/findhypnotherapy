import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - this is important
  const { data: { user } } = await supabase.auth.getUser()

  // Check if the user's account has been deleted
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('deleted_at')
      .eq('id', user.id)
      .single()

    // If account is deleted, sign out and redirect to home
    if (profile?.deleted_at) {
      await supabase.auth.signOut()

      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('account_deleted', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

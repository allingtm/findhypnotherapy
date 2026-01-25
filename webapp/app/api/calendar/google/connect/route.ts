import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/calendar/google';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?redirect=/dashboard/availability', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Generate a state parameter for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in a cookie for verification in callback
    const response = NextResponse.redirect(getGoogleAuthUrl(state));
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Also store the user ID for the callback
    response.cookies.set('oauth_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth connect error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/availability?error=oauth_failed', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}

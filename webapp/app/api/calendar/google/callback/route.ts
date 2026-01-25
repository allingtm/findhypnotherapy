import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, saveGoogleTokens } from '@/lib/calendar/google';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Check for OAuth errors
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/availability?error=oauth_denied&message=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  // Verify state parameter
  const storedState = request.cookies.get('google_oauth_state')?.value;
  const userId = request.cookies.get('oauth_user_id')?.value;

  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch');
    return NextResponse.redirect(
      new URL('/dashboard/availability?error=invalid_state', baseUrl)
    );
  }

  if (!userId) {
    console.error('No user ID in OAuth callback');
    return NextResponse.redirect(
      new URL('/dashboard/availability?error=no_user', baseUrl)
    );
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(
      new URL('/dashboard/availability?error=no_code', baseUrl)
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save tokens to database
    await saveGoogleTokens(userId, tokens);

    // Clear OAuth cookies and redirect to success
    const response = NextResponse.redirect(
      new URL('/dashboard/availability?calendar=google&connected=true', baseUrl)
    );

    response.cookies.delete('google_oauth_state');
    response.cookies.delete('oauth_user_id');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/availability?error=token_exchange_failed', baseUrl)
    );
  }
}

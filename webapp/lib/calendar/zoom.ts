import { encrypt, decrypt } from './encryption';
import { createClient } from '@/lib/supabase/server';

const ZOOM_AUTH_URL = 'https://zoom.us/oauth/authorize';
const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
const ZOOM_API_URL = 'https://api.zoom.us/v2';

// Scopes for Zoom API access
const SCOPES = ['meeting:write:meeting'].join(' ');

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  password?: string;
}

export function getZoomAuthUrl(state: string): string {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/zoom/callback`;

  if (!clientId) {
    throw new Error('ZOOM_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  return `${ZOOM_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/zoom/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Zoom OAuth credentials not configured');
  }

  // Zoom requires Basic Auth with client_id:client_secret
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(ZOOM_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Zoom token exchange error:', error);
    throw new Error('Failed to exchange code for tokens');
  }

  return response.json();
}

export async function saveZoomTokens(userId: string, tokens: TokenResponse): Promise<void> {
  const supabase = await createClient();

  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Check if tokens already exist for this user
  const { data: existing } = await supabase
    .from('calendar_oauth_tokens')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'zoom')
    .single();

  if (existing) {
    // Update existing tokens
    await supabase
      .from('calendar_oauth_tokens')
      .update({
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scope: tokens.scope,
        is_active: true,
      })
      .eq('id', existing.id);
  } else {
    // Insert new tokens
    await supabase.from('calendar_oauth_tokens').insert({
      user_id: userId,
      provider: 'zoom',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: expiresAt,
      scope: tokens.scope,
      is_active: true,
    });
  }

  // Update therapist_booking_settings to mark zoom as connected
  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profile) {
    await supabase
      .from('therapist_booking_settings')
      .update({ zoom_connected: true })
      .eq('therapist_profile_id', profile.id);
  }
}

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(ZOOM_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh Zoom token');
      return null;
    }

    const tokens: TokenResponse = await response.json();
    await saveZoomTokens(userId, tokens);
    return tokens.access_token;
  } catch (error) {
    console.error('Error refreshing Zoom token:', error);
    return null;
  }
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: tokenData } = await supabase
    .from('calendar_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'zoom')
    .eq('is_active', true)
    .single();

  if (!tokenData) {
    return null;
  }

  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  // If token expires within 5 minutes, refresh it
  if (expiresAt <= fiveMinutesFromNow && tokenData.refresh_token) {
    const decryptedRefreshToken = decrypt(tokenData.refresh_token);
    const newAccessToken = await refreshAccessToken(userId, decryptedRefreshToken);
    return newAccessToken;
  }

  return decrypt(tokenData.access_token);
}

export async function createZoomMeeting(
  userId: string,
  meeting: {
    topic: string;
    startTime: Date;
    duration: number; // minutes
    timezone: string;
    attendeeEmail?: string;
  }
): Promise<{ success: boolean; meetingId?: string; joinUrl?: string; error?: string }> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return { success: false, error: 'No valid Zoom access token' };
  }

  try {
    const response = await fetch(`${ZOOM_API_URL}/users/me/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: meeting.topic,
        type: 2, // Scheduled meeting
        start_time: meeting.startTime.toISOString(),
        duration: meeting.duration,
        timezone: meeting.timezone,
        settings: {
          join_before_host: true,
          waiting_room: false,
          meeting_authentication: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Zoom meeting creation error:', error);
      return { success: false, error: 'Failed to create Zoom meeting' };
    }

    const data: ZoomMeetingResponse = await response.json();
    return {
      success: true,
      meetingId: data.id.toString(),
      joinUrl: data.join_url,
    };
  } catch (error) {
    console.error('Failed to create Zoom meeting:', error);
    return { success: false, error: 'Failed to create Zoom meeting' };
  }
}

export async function disconnectZoom(userId: string): Promise<void> {
  const supabase = await createClient();

  // Mark tokens as inactive
  await supabase
    .from('calendar_oauth_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('provider', 'zoom');

  // Update booking settings
  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profile) {
    await supabase
      .from('therapist_booking_settings')
      .update({ zoom_connected: false })
      .eq('therapist_profile_id', profile.id);
  }
}

export async function isZoomConnected(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('calendar_oauth_tokens')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'zoom')
    .eq('is_active', true)
    .single();

  return !!data;
}

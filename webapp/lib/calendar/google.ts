import { encrypt, decrypt } from './encryption';
import { createClient } from '@/lib/supabase/server';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// Scopes for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
].join(' ');

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface FreeBusyResponse {
  calendars: {
    [email: string]: {
      busy: Array<{ start: string; end: string }>;
    };
  };
}

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: Array<{ email: string; displayName?: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent', // Force consent to always get refresh token
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return response.json();
}

export async function saveGoogleTokens(
  userId: string,
  tokens: TokenResponse
): Promise<void> {
  const supabase = await createClient();

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  // Encrypt the tokens before storing
  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = tokens.refresh_token
    ? encrypt(tokens.refresh_token)
    : null;

  const { error } = await supabase
    .from('calendar_oauth_tokens')
    .upsert({
      user_id: userId,
      provider: 'google',
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      token_expires_at: expiresAt.toISOString(),
      scope: tokens.scope,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,provider',
    });

  if (error) {
    throw new Error(`Failed to save tokens: ${error.message}`);
  }

  // Update booking settings to reflect connected calendar
  await supabase
    .from('therapist_booking_settings')
    .update({ google_calendar_connected: true })
    .eq('therapist_profile_id', (
      await supabase
        .from('therapist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
    ).data?.id);
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: tokenData, error } = await supabase
    .from('calendar_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .eq('is_active', true)
    .single();

  if (error || !tokenData) {
    return null;
  }

  const expiresAt = new Date(tokenData.token_expires_at);
  const now = new Date();

  // If token is expired or will expire in the next 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    if (!tokenData.refresh_token_encrypted) {
      // No refresh token, need to re-authenticate
      await supabase
        .from('calendar_oauth_tokens')
        .update({ is_active: false, sync_error: 'Token expired, re-authentication required' })
        .eq('id', tokenData.id);
      return null;
    }

    try {
      const refreshToken = decrypt(tokenData.refresh_token_encrypted);
      const newTokens = await refreshAccessToken(refreshToken);

      // Save new tokens
      const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
      const encryptedAccessToken = encrypt(newTokens.access_token);

      await supabase
        .from('calendar_oauth_tokens')
        .update({
          access_token_encrypted: encryptedAccessToken,
          token_expires_at: newExpiresAt.toISOString(),
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenData.id);

      return newTokens.access_token;
    } catch (error) {
      console.error('Failed to refresh Google token:', error);
      await supabase
        .from('calendar_oauth_tokens')
        .update({
          is_active: false,
          sync_error: error instanceof Error ? error.message : 'Token refresh failed'
        })
        .eq('id', tokenData.id);
      return null;
    }
  }

  // Token is still valid, decrypt and return
  return decrypt(tokenData.access_token_encrypted);
}

/**
 * Get free/busy information from Google Calendar
 */
export async function getGoogleFreeBusy(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/freeBusy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: 'primary' }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google FreeBusy API error:', error);
      return [];
    }

    const data: FreeBusyResponse = await response.json();
    const primaryCalendar = data.calendars?.primary;

    if (!primaryCalendar?.busy) {
      return [];
    }

    return primaryCalendar.busy.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));
  } catch (error) {
    console.error('Failed to get Google free/busy:', error);
    return [];
  }
}

/**
 * Create a calendar event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  userId: string,
  event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    attendeeEmail?: string;
    attendeeName?: string;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return { success: false, error: 'No valid access token' };
  }

  const calendarEvent: CalendarEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: event.timezone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: event.timezone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 hours before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
  };

  // Add attendee if provided
  if (event.attendeeEmail) {
    calendarEvent.attendees = [
      {
        email: event.attendeeEmail,
        displayName: event.attendeeName,
      },
    ];
  }

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Calendar event creation error:', error);
      return { success: false, error: 'Failed to create calendar event' };
    }

    const data = await response.json();
    return { success: true, eventId: data.id };
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error);
    return { success: false, error: 'Failed to create calendar event' };
  }
}

/**
 * Disconnect Google Calendar
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  const supabase = await createClient();

  // Mark tokens as inactive
  await supabase
    .from('calendar_oauth_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('provider', 'google');

  // Update booking settings
  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profile) {
    await supabase
      .from('therapist_booking_settings')
      .update({ google_calendar_connected: false })
      .eq('therapist_profile_id', profile.id);
  }
}

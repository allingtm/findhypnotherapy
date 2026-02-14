import { encrypt, decrypt } from './encryption';
import { createClient } from '@/lib/supabase/server';

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0';

// Scopes for calendar access - read-only
const SCOPES = [
  'User.Read',
  'Calendars.Read',
  'offline_access', // For refresh tokens
].join(' ');

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface ScheduleItem {
  scheduleId: string;
  availabilityView: string;
  scheduleItems: Array<{
    status: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
  }>;
}

export function getMicrosoftAuthUrl(state: string): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/microsoft/callback`;

  if (!clientId) {
    throw new Error('MICROSOFT_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    response_mode: 'query',
    state,
  });

  return `${MICROSOFT_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/microsoft/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured');
  }

  const response = await fetch(MICROSOFT_TOKEN_URL, {
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
      scope: SCOPES,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured');
  }

  const response = await fetch(MICROSOFT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return response.json();
}

export async function saveMicrosoftTokens(
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
      provider: 'microsoft',
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
    .update({ microsoft_calendar_connected: true })
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
    .eq('provider', 'microsoft')
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
      const encryptedRefreshToken = newTokens.refresh_token
        ? encrypt(newTokens.refresh_token)
        : tokenData.refresh_token_encrypted;

      await supabase
        .from('calendar_oauth_tokens')
        .update({
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          token_expires_at: newExpiresAt.toISOString(),
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenData.id);

      return newTokens.access_token;
    } catch (error) {
      console.error('Failed to refresh Microsoft token:', error);
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
 * Get free/busy information from Microsoft Calendar
 */
export async function getMicrosoftFreeBusy(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return [];
  }

  try {
    // First get the user's email/UPN
    const meResponse = await fetch(`${MICROSOFT_GRAPH_API}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!meResponse.ok) {
      console.error('Failed to get Microsoft user info');
      return [];
    }

    const meData = await meResponse.json();
    const userEmail = meData.mail || meData.userPrincipalName;

    // Get schedule/free-busy info
    const response = await fetch(`${MICROSOFT_GRAPH_API}/me/calendar/getSchedule`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schedules: [userEmail],
        startTime: {
          dateTime: timeMin.toISOString(),
          timeZone: 'UTC',
        },
        endTime: {
          dateTime: timeMax.toISOString(),
          timeZone: 'UTC',
        },
        availabilityViewInterval: 30, // 30-minute intervals
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Microsoft getSchedule API error:', error);
      return [];
    }

    const data = await response.json();
    const busySlots: Array<{ start: Date; end: Date }> = [];

    if (data.value) {
      for (const schedule of data.value as ScheduleItem[]) {
        if (schedule.scheduleItems) {
          for (const item of schedule.scheduleItems) {
            // Include busy, oof (out of office), and tentative
            if (['busy', 'oof', 'tentative'].includes(item.status.toLowerCase())) {
              busySlots.push({
                start: new Date(item.start.dateTime + 'Z'),
                end: new Date(item.end.dateTime + 'Z'),
              });
            }
          }
        }
      }
    }

    return busySlots;
  } catch (error) {
    console.error('Failed to get Microsoft free/busy:', error);
    return [];
  }
}

/**
 * Disconnect Microsoft Calendar
 */
export async function disconnectMicrosoftCalendar(userId: string): Promise<void> {
  const supabase = await createClient();

  // Mark tokens as inactive
  await supabase
    .from('calendar_oauth_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('provider', 'microsoft');

  // Update booking settings
  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profile) {
    await supabase
      .from('therapist_booking_settings')
      .update({ microsoft_calendar_connected: false })
      .eq('therapist_profile_id', profile.id);
  }
}

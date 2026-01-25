'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getGoogleFreeBusy } from '@/lib/calendar/google'
import { getMicrosoftFreeBusy } from '@/lib/calendar/microsoft'

// Response type for form actions
type ActionResponse = {
  success: boolean
  error?: string
  data?: unknown
}

// Booking settings schema
const bookingSettingsSchema = z.object({
  slot_duration_minutes: z.coerce.number().int().min(15).max(240),
  buffer_minutes: z.coerce.number().int().min(0).max(60),
  min_booking_notice_hours: z.coerce.number().int().min(0).max(168),
  max_booking_days_ahead: z.coerce.number().int().min(1).max(365),
  timezone: z.string().min(1).max(100),
  requires_approval: z.coerce.boolean(),
  accepts_online_booking: z.coerce.boolean(),
})

// Weekly availability slot schema
const availabilitySlotSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format'),
})

// Date override schema
const dateOverrideSchema = z.object({
  override_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  is_available: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  reason: z.string().max(255).optional().nullable(),
})

// Helper to get therapist profile ID for current user
async function getTherapistProfileId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { profileId: null, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return { profileId: null, error: 'Profile not found' }
  }

  return { profileId: profile.id, error: null }
}

// Get or create booking settings for current user
export async function getOrCreateBookingSettings() {
  const supabase = await createClient()
  const { profileId, error: profileError } = await getTherapistProfileId()

  if (!profileId) {
    return { settings: null, error: profileError }
  }

  // Try to get existing settings
  const { data: settings, error: fetchError } = await supabase
    .from('therapist_booking_settings')
    .select('*')
    .eq('therapist_profile_id', profileId)
    .single()

  if (settings) {
    return { settings, error: null }
  }

  // Create new settings if doesn't exist
  if (fetchError?.code === 'PGRST116') {
    const { data: newSettings, error: createError } = await supabase
      .from('therapist_booking_settings')
      .insert({ therapist_profile_id: profileId })
      .select()
      .single()

    if (createError) {
      console.error('Error creating booking settings:', createError)
      return { settings: null, error: 'Failed to create booking settings' }
    }

    return { settings: newSettings, error: null }
  }

  return { settings: null, error: fetchError?.message || 'Failed to fetch booking settings' }
}

// Update booking settings
export async function updateBookingSettingsAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { profileId, error: profileError } = await getTherapistProfileId()

    if (!profileId) {
      return { success: false, error: profileError || 'Profile not found' }
    }

    // Parse form data
    const rawData = {
      slot_duration_minutes: formData.get('slot_duration_minutes'),
      buffer_minutes: formData.get('buffer_minutes'),
      min_booking_notice_hours: formData.get('min_booking_notice_hours'),
      max_booking_days_ahead: formData.get('max_booking_days_ahead'),
      timezone: formData.get('timezone') || 'Europe/London',
      requires_approval: formData.get('requires_approval') === 'true',
      accepts_online_booking: formData.get('accepts_online_booking') !== 'false',
    }

    const validation = bookingSettingsSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data

    // Update settings
    const { error: updateError } = await supabase
      .from('therapist_booking_settings')
      .update({
        slot_duration_minutes: data.slot_duration_minutes,
        buffer_minutes: data.buffer_minutes,
        min_booking_notice_hours: data.min_booking_notice_hours,
        max_booking_days_ahead: data.max_booking_days_ahead,
        timezone: data.timezone,
        requires_approval: data.requires_approval,
        accepts_online_booking: data.accepts_online_booking,
      })
      .eq('therapist_profile_id', profileId)

    if (updateError) {
      console.error('Error updating booking settings:', updateError)
      return { success: false, error: 'Failed to update booking settings' }
    }

    revalidatePath('/dashboard/availability')
    return { success: true }
  } catch (err) {
    console.error('Booking settings update error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get weekly availability for current user
export async function getWeeklyAvailability() {
  const supabase = await createClient()
  const { profileId, error: profileError } = await getTherapistProfileId()

  if (!profileId) {
    return { availability: [], error: profileError }
  }

  const { data: availability, error } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_profile_id', profileId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')

  if (error) {
    console.error('Error fetching availability:', error)
    return { availability: [], error: 'Failed to fetch availability' }
  }

  return { availability: availability || [], error: null }
}

// Save weekly availability (replaces all existing slots)
export async function saveWeeklyAvailabilityAction(
  schedule: Array<{
    day_of_week: number
    slots: Array<{ start_time: string; end_time: string }>
  }>
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { profileId, error: profileError } = await getTherapistProfileId()

    if (!profileId) {
      return { success: false, error: profileError || 'Profile not found' }
    }

    // Validate all slots
    for (const day of schedule) {
      for (const slot of day.slots) {
        const validation = availabilitySlotSchema.safeParse({
          day_of_week: day.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
        })

        if (!validation.success) {
          return {
            success: false,
            error: `Invalid slot on day ${day.day_of_week}: ${validation.error.issues[0]?.message}`,
          }
        }

        // Validate start_time < end_time
        if (slot.start_time >= slot.end_time) {
          return {
            success: false,
            error: `Invalid time range on day ${day.day_of_week}: start time must be before end time`,
          }
        }
      }
    }

    // Delete existing availability
    const { error: deleteError } = await supabase
      .from('therapist_availability')
      .delete()
      .eq('therapist_profile_id', profileId)

    if (deleteError) {
      console.error('Error deleting existing availability:', deleteError)
      return { success: false, error: 'Failed to update availability' }
    }

    // Flatten and prepare slots for insertion
    const slotsToInsert = schedule.flatMap(day =>
      day.slots.map(slot => ({
        therapist_profile_id: profileId,
        day_of_week: day.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_active: true,
      }))
    )

    // Insert new slots
    if (slotsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('therapist_availability')
        .insert(slotsToInsert)

      if (insertError) {
        console.error('Error inserting availability:', insertError)
        return { success: false, error: 'Failed to save availability' }
      }
    }

    revalidatePath('/dashboard/availability')
    return { success: true }
  } catch (err) {
    console.error('Availability save error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get date overrides for current user
export async function getDateOverrides(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  const { profileId, error: profileError } = await getTherapistProfileId()

  if (!profileId) {
    return { overrides: [], error: profileError }
  }

  let query = supabase
    .from('therapist_availability_overrides')
    .select('*')
    .eq('therapist_profile_id', profileId)
    .order('override_date')

  if (startDate) {
    query = query.gte('override_date', startDate)
  }
  if (endDate) {
    query = query.lte('override_date', endDate)
  }

  const { data: overrides, error } = await query

  if (error) {
    console.error('Error fetching date overrides:', error)
    return { overrides: [], error: 'Failed to fetch date overrides' }
  }

  return { overrides: overrides || [], error: null }
}

// Add or update a date override
export async function upsertDateOverrideAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { profileId, error: profileError } = await getTherapistProfileId()

    if (!profileId) {
      return { success: false, error: profileError || 'Profile not found' }
    }

    const rawData = {
      override_date: formData.get('override_date'),
      is_available: formData.get('is_available') === 'true',
      start_time: formData.get('start_time') || null,
      end_time: formData.get('end_time') || null,
      reason: formData.get('reason') || null,
    }

    const validation = dateOverrideSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data

    // If marking as available, require times
    if (data.is_available && (!data.start_time || !data.end_time)) {
      return {
        success: false,
        error: 'Start and end times are required when marking a date as available',
      }
    }

    // Validate time range if available
    if (data.is_available && data.start_time && data.end_time && data.start_time >= data.end_time) {
      return {
        success: false,
        error: 'Start time must be before end time',
      }
    }

    // Upsert the override
    const { error: upsertError } = await supabase
      .from('therapist_availability_overrides')
      .upsert(
        {
          therapist_profile_id: profileId,
          override_date: data.override_date,
          is_available: data.is_available,
          start_time: data.is_available ? data.start_time : null,
          end_time: data.is_available ? data.end_time : null,
          reason: data.reason,
        },
        {
          onConflict: 'therapist_profile_id,override_date',
        }
      )

    if (upsertError) {
      console.error('Error upserting date override:', upsertError)
      return { success: false, error: 'Failed to save date override' }
    }

    revalidatePath('/dashboard/availability')
    return { success: true }
  } catch (err) {
    console.error('Date override error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete a date override
export async function deleteDateOverrideAction(overrideId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { profileId, error: profileError } = await getTherapistProfileId()

    if (!profileId) {
      return { success: false, error: profileError || 'Profile not found' }
    }

    const { error: deleteError } = await supabase
      .from('therapist_availability_overrides')
      .delete()
      .eq('id', overrideId)
      .eq('therapist_profile_id', profileId)

    if (deleteError) {
      console.error('Error deleting date override:', deleteError)
      return { success: false, error: 'Failed to delete date override' }
    }

    revalidatePath('/dashboard/availability')
    return { success: true }
  } catch (err) {
    console.error('Date override delete error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get calendar connection status
export async function getCalendarConnectionStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { connections: [], error: 'Not authenticated' }
  }

  const { data: tokens, error } = await supabase
    .from('calendar_oauth_tokens')
    .select('provider, is_active, last_sync_at, sync_error')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching calendar connections:', error)
    return { connections: [], error: 'Failed to fetch calendar connections' }
  }

  return { connections: tokens || [], error: null }
}

// Disconnect a calendar
export async function disconnectCalendarAction(provider: 'google' | 'microsoft'): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Delete OAuth token
    const { error: deleteTokenError } = await supabase
      .from('calendar_oauth_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    if (deleteTokenError) {
      console.error('Error deleting OAuth token:', deleteTokenError)
      return { success: false, error: 'Failed to disconnect calendar' }
    }

    // Delete cached busy times
    await supabase
      .from('calendar_busy_times')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    // Update booking settings
    const { profileId } = await getTherapistProfileId()
    if (profileId) {
      const updateField = provider === 'google'
        ? { google_calendar_connected: false }
        : { microsoft_calendar_connected: false }

      await supabase
        .from('therapist_booking_settings')
        .update(updateField)
        .eq('therapist_profile_id', profileId)
    }

    revalidatePath('/dashboard/availability')
    return { success: true }
  } catch (err) {
    console.error('Calendar disconnect error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Sync calendar busy times
export async function syncCalendarBusyTimesAction(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get connected calendars
    const { data: tokens } = await supabase
      .from('calendar_oauth_tokens')
      .select('provider, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) {
      return { success: false, error: 'No calendars connected' }
    }

    // Calculate time range: now to 30 days from now
    const now = new Date()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const allBusyTimes: Array<{ provider: string; start: Date; end: Date }> = []

    // Fetch busy times from each connected calendar
    for (const token of tokens) {
      if (!token.is_active) continue

      let busyTimes: Array<{ start: Date; end: Date }> = []

      if (token.provider === 'google') {
        busyTimes = await getGoogleFreeBusy(user.id, now, thirtyDaysLater)
      } else if (token.provider === 'microsoft') {
        busyTimes = await getMicrosoftFreeBusy(user.id, now, thirtyDaysLater)
      }

      for (const bt of busyTimes) {
        allBusyTimes.push({
          provider: token.provider,
          start: bt.start,
          end: bt.end,
        })
      }

      // Update last_sync_at for this provider
      await supabase
        .from('calendar_oauth_tokens')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('user_id', user.id)
        .eq('provider', token.provider)
    }

    // Clear old busy times for this user
    await supabase
      .from('calendar_busy_times')
      .delete()
      .eq('user_id', user.id)

    // Insert new busy times
    if (allBusyTimes.length > 0) {
      const busyTimesToInsert = allBusyTimes.map((bt) => ({
        user_id: user.id,
        provider: bt.provider,
        start_time: bt.start.toISOString(),
        end_time: bt.end.toISOString(),
        fetched_at: new Date().toISOString(),
      }))

      await supabase.from('calendar_busy_times').insert(busyTimesToInsert)
    }

    revalidatePath('/dashboard/availability')
    return { success: true, data: { syncedCount: allBusyTimes.length } }
  } catch (err) {
    console.error('Calendar sync error:', err)
    return { success: false, error: 'Failed to sync calendar' }
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { bookingFormSchema } from "@/lib/validation/booking";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  getBookingVerificationEmail,
  getNewBookingNotificationEmail,
  getBookingConfirmedEmail,
  getBookingCancelledEmail,
} from "@/lib/email/templates";
import crypto from "crypto";
import { createGoogleCalendarEvent } from "@/lib/calendar/google";
import { createMicrosoftCalendarEvent } from "@/lib/calendar/microsoft";

type ActionResponse = {
  success: boolean;
  error?: string;
  data?: unknown;
};

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Helper to get therapist profile ID for current user
async function getTherapistProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profileId: null, userId: null, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("therapist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { profileId: null, userId: user.id, error: "Profile not found" };
  }

  return { profileId: profile.id, userId: user.id, error: null };
}

// Get therapist profile by slug (for public booking page)
export async function getTherapistBySlug(slug: string) {
  const adminClient = createAdminClient();

  const { data: profile, error } = await adminClient
    .from("therapist_profiles")
    .select(
      `
      id,
      slug,
      professional_title,
      user_id,
      users!inner (
        id,
        name,
        email
      ),
      therapist_booking_settings (
        id,
        slot_duration_minutes,
        buffer_minutes,
        min_booking_notice_hours,
        max_booking_days_ahead,
        timezone,
        requires_approval,
        accepts_online_booking
      )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !profile) {
    return { profile: null, error: "Therapist not found" };
  }

  // Check if they accept online booking
  const settings = profile.therapist_booking_settings as unknown as {
    accepts_online_booking: boolean | null;
  } | null;

  if (!settings?.accepts_online_booking) {
    return { profile: null, error: "Online booking not available" };
  }

  return { profile, error: null };
}

// Get available time slots for a specific date
export async function getAvailableSlots(
  therapistProfileId: string,
  dateStr: string
) {
  const adminClient = createAdminClient();

  // Parse the date
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Get therapist's booking settings
  const { data: settings, error: settingsError } = await adminClient
    .from("therapist_booking_settings")
    .select("*")
    .eq("therapist_profile_id", therapistProfileId)
    .single();

  if (settingsError || !settings) {
    return { slots: [], error: "Booking settings not found" };
  }

  // Check if date is within allowed range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const minNoticeDate = new Date(
    today.getTime() +
      (settings.min_booking_notice_hours || 0) * 60 * 60 * 1000
  );
  const maxDate = new Date(
    today.getTime() +
      (settings.max_booking_days_ahead || 30) * 24 * 60 * 60 * 1000
  );

  if (targetDate < today) {
    return { slots: [], error: "Cannot book past dates" };
  }

  if (targetDate > maxDate) {
    return { slots: [], error: "Date is too far in the future" };
  }

  // Check for date override first
  const { data: override } = await adminClient
    .from("therapist_availability_overrides")
    .select("*")
    .eq("therapist_profile_id", therapistProfileId)
    .eq("override_date", dateStr)
    .single();

  // If there's an override that marks the day as unavailable, return empty
  if (override && !override.is_available) {
    return { slots: [], error: null };
  }

  // Get weekly availability for this day of week
  const { data: availability, error: availabilityError } = await adminClient
    .from("therapist_availability")
    .select("*")
    .eq("therapist_profile_id", therapistProfileId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time");

  if (availabilityError) {
    return { slots: [], error: "Failed to fetch availability" };
  }

  // If override has specific times, use those instead
  let timeRanges: { start_time: string; end_time: string }[] = [];

  if (override && override.is_available && override.start_time && override.end_time) {
    timeRanges = [
      { start_time: override.start_time, end_time: override.end_time },
    ];
  } else if (availability && availability.length > 0) {
    timeRanges = availability.map((a) => ({
      start_time: a.start_time,
      end_time: a.end_time,
    }));
  }

  if (timeRanges.length === 0) {
    return { slots: [], error: null };
  }

  // Get existing bookings for this date
  const { data: existingBookings } = await adminClient
    .from("bookings")
    .select("start_time, end_time")
    .eq("therapist_profile_id", therapistProfileId)
    .eq("booking_date", dateStr)
    .in("status", ["pending", "confirmed"]);

  // Get calendar busy times in real-time (if calendar is connected)
  const { data: therapistProfile } = await adminClient
    .from("therapist_profiles")
    .select("user_id")
    .eq("id", therapistProfileId)
    .single();

  let calendarBusyTimes: { start_time: string; end_time: string }[] = [];

  if (therapistProfile?.user_id) {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch busy times directly from calendar APIs (real-time)
    let busySlots: Array<{ start: Date; end: Date }> = [];

    if (settings.google_calendar_connected) {
      const { getGoogleFreeBusy } = await import("@/lib/calendar/google");
      busySlots = await getGoogleFreeBusy(
        therapistProfile.user_id,
        startOfDay,
        endOfDay
      );
    } else if (settings.microsoft_calendar_connected) {
      const { getMicrosoftFreeBusy } = await import("@/lib/calendar/microsoft");
      busySlots = await getMicrosoftFreeBusy(
        therapistProfile.user_id,
        startOfDay,
        endOfDay
      );
    }

    // Convert to time strings in therapist's timezone for comparison
    const therapistTimezone = settings.timezone || "Europe/London";
    calendarBusyTimes = busySlots.map((bt) => ({
      start_time: bt.start.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: therapistTimezone,
      }),
      end_time: bt.end.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: therapistTimezone,
      }),
    }));
  }

  // Generate time slots based on availability
  const slotDuration = settings.slot_duration_minutes || 30;
  const bufferMinutes = settings.buffer_minutes || 0;
  const slots: { start_time: string; end_time: string }[] = [];

  for (const range of timeRanges) {
    const [startHour, startMin] = range.start_time.split(":").map(Number);
    const [endHour, endMin] = range.end_time.split(":").map(Number);

    const rangeStartMins = startHour * 60 + startMin;
    const rangeEndMins = endHour * 60 + endMin;

    let currentMins = rangeStartMins;

    while (currentMins + slotDuration <= rangeEndMins) {
      const slotStart = `${String(Math.floor(currentMins / 60)).padStart(2, "0")}:${String(currentMins % 60).padStart(2, "0")}`;
      const slotEndMins = currentMins + slotDuration;
      const slotEnd = `${String(Math.floor(slotEndMins / 60)).padStart(2, "0")}:${String(slotEndMins % 60).padStart(2, "0")}`;

      // Check if this slot is available
      let isAvailable = true;

      // Check against existing bookings
      for (const booking of existingBookings || []) {
        const bookingStart = booking.start_time.slice(0, 5);
        const bookingEnd = booking.end_time.slice(0, 5);

        if (slotStart < bookingEnd && slotEnd > bookingStart) {
          isAvailable = false;
          break;
        }
      }

      // Check against calendar busy times
      if (isAvailable) {
        for (const busy of calendarBusyTimes) {
          if (slotStart < busy.end_time && slotEnd > busy.start_time) {
            isAvailable = false;
            break;
          }
        }
      }

      // Check if slot is past minimum notice period (for today)
      if (isAvailable && targetDate.toDateString() === today.toDateString()) {
        const now = new Date();
        const slotDateTime = new Date(dateStr);
        slotDateTime.setHours(Math.floor(currentMins / 60), currentMins % 60, 0, 0);

        if (slotDateTime < minNoticeDate) {
          isAvailable = false;
        }
      }

      if (isAvailable) {
        slots.push({ start_time: slotStart, end_time: slotEnd });
      }

      currentMins += slotDuration + bufferMinutes;
    }
  }

  return { slots, error: null };
}

// Get dates with availability in a given month
export async function getAvailableDates(
  therapistProfileId: string,
  year: number,
  month: number
) {
  const adminClient = createAdminClient();

  // Get booking settings
  const { data: settings } = await adminClient
    .from("therapist_booking_settings")
    .select("max_booking_days_ahead, min_booking_notice_hours")
    .eq("therapist_profile_id", therapistProfileId)
    .single();

  // Get all weekly availability
  const { data: weeklyAvailability } = await adminClient
    .from("therapist_availability")
    .select("day_of_week")
    .eq("therapist_profile_id", therapistProfileId)
    .eq("is_active", true);

  const availableDaysOfWeek = new Set(
    weeklyAvailability?.map((a) => a.day_of_week) || []
  );

  // Get all overrides for this month
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month).padStart(2, "0")}-31`;

  const { data: overrides } = await adminClient
    .from("therapist_availability_overrides")
    .select("override_date, is_available")
    .eq("therapist_profile_id", therapistProfileId)
    .gte("override_date", startOfMonth)
    .lte("override_date", endOfMonth);

  const overrideMap = new Map<string, boolean>();
  overrides?.forEach((o) => overrideMap.set(o.override_date, o.is_available));

  // Calculate available dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDaysAhead = settings?.max_booking_days_ahead || 30;
  const maxDate = new Date(
    today.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000
  );

  const availableDates: string[] = [];

  // Iterate through each day of the month
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Skip past dates
    if (date < today) continue;

    // Skip dates beyond max booking window
    if (date > maxDate) continue;

    // Check override first
    if (overrideMap.has(dateStr)) {
      if (overrideMap.get(dateStr)) {
        availableDates.push(dateStr);
      }
      continue;
    }

    // Check weekly availability
    if (availableDaysOfWeek.has(date.getDay())) {
      availableDates.push(dateStr);
    }
  }

  return { dates: availableDates, error: null };
}

// Submit a booking (visitor action)
export async function submitBookingAction(
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    therapistProfileId: formData.get("therapistProfileId"),
    serviceId: formData.get("serviceId") || null,
    bookingDate: formData.get("bookingDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    sessionFormat: formData.get("sessionFormat") || null,
    visitorName: formData.get("visitorName"),
    visitorEmail: formData.get("visitorEmail"),
    visitorPhone: formData.get("visitorPhone") || null,
    visitorNotes: formData.get("visitorNotes") || null,
    honeypot: formData.get("website") || "", // honeypot field
  };

  const validation = bookingFormSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const data = validation.data;

  try {
    const adminClient = createAdminClient();

    // Verify the slot is still available
    const { slots, error: slotsError } = await getAvailableSlots(
      data.therapistProfileId,
      data.bookingDate
    );

    if (slotsError) {
      return { success: false, error: slotsError };
    }

    const slotExists = slots.some(
      (s) => s.start_time === data.startTime && s.end_time === data.endTime
    );

    if (!slotExists) {
      return {
        success: false,
        error: "This time slot is no longer available. Please select another.",
      };
    }

    // Check if email is already verified (returning visitor)
    const { data: verifiedEmail } = await adminClient
      .from("verified_visitor_emails")
      .select("id")
      .eq("email", data.visitorEmail.toLowerCase())
      .single();

    const isPreVerified = !!verifiedEmail;

    // Get therapist info for the email
    const { data: therapist, error: therapistError } = await adminClient
      .from("therapist_profiles")
      .select(
        `
        id,
        users!inner (
          id,
          name,
          email
        ),
        therapist_booking_settings (
          slot_duration_minutes
        )
      `
      )
      .eq("id", data.therapistProfileId)
      .single();

    if (therapistError || !therapist) {
      return { success: false, error: "Therapist not found" };
    }

    const settings = therapist.therapist_booking_settings as unknown as {
      slot_duration_minutes: number;
    } | null;

    const therapistUser = therapist.users as unknown as { name?: string; email?: string };
    const therapistName = therapistUser?.name || "the therapist";
    const therapistEmail = therapistUser?.email;

    // Generate visitor token (always needed for booking access)
    const visitorToken = generateToken();

    // Only generate verification token if email is not pre-verified
    const verificationToken = isPreVerified ? null : generateToken();
    const verificationExpiresAt = isPreVerified
      ? null
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Create the booking
    const { data: booking, error: bookingError } = await adminClient
      .from("bookings")
      .insert({
        therapist_profile_id: data.therapistProfileId,
        service_id: data.serviceId || null,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: data.endTime,
        duration_minutes: settings?.slot_duration_minutes || 30,
        session_format: data.sessionFormat || null,
        visitor_name: data.visitorName,
        visitor_email: data.visitorEmail,
        visitor_phone: data.visitorPhone || null,
        visitor_notes: data.visitorNotes || null,
        visitor_token: visitorToken,
        verification_token: verificationToken,
        verification_expires_at: verificationExpiresAt,
        status: "pending",
        is_verified: isPreVerified, // Auto-verify if email is already trusted
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Failed to create booking:", bookingError);
      return { success: false, error: "Failed to create booking" };
    }

    if (isPreVerified) {
      // Email already verified - notify therapist immediately
      if (therapistEmail) {
        const emailContent = getNewBookingNotificationEmail({
          recipientName: therapistName,
          visitorName: data.visitorName,
          visitorEmail: data.visitorEmail,
          bookingDate: data.bookingDate,
          startTime: data.startTime,
          bookingId: booking.id,
        });

        const emailSent = await sendEmail({
          to: therapistEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        if (!emailSent) {
          console.warn("Failed to send booking notification to therapist:", therapistEmail);
        }
      }

      return {
        success: true,
        data: { bookingId: booking.id, visitorToken, preVerified: true },
      };
    } else {
      // Send verification email to visitor
      const emailContent = getBookingVerificationEmail({
        recipientName: data.visitorName,
        verificationToken: verificationToken!,
        therapistName,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
      });

      const emailSent = await sendEmail({
        to: data.visitorEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      if (!emailSent) {
        console.warn("Failed to send verification email to visitor:", data.visitorEmail);
      }

      return { success: true, data: { bookingId: booking.id } };
    }
  } catch (error) {
    console.error("Submit booking error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Verify a booking (called from email link)
export async function verifyBookingAction(
  token: string
): Promise<ActionResponse> {
  try {
    const adminClient = createAdminClient();

    // Find the booking by verification token
    const { data: booking, error: bookingError } = await adminClient
      .from("bookings")
      .select(
        `
        id,
        therapist_profile_id,
        visitor_name,
        visitor_email,
        booking_date,
        start_time,
        verification_expires_at,
        is_verified,
        visitor_token,
        therapist_profiles!inner (
          users!inner (
            id,
            name,
            email
          )
        )
      `
      )
      .eq("verification_token", token)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Invalid verification token" };
    }

    // Check if already verified
    if (booking.is_verified) {
      return {
        success: true,
        data: { alreadyVerified: true, visitorToken: booking.visitor_token },
      };
    }

    // Check if token has expired
    if (
      booking.verification_expires_at &&
      new Date(booking.verification_expires_at) < new Date()
    ) {
      return { success: false, error: "Verification token has expired" };
    }

    // Mark as verified
    await adminClient
      .from("bookings")
      .update({
        is_verified: true,
        verification_token: null,
        verification_expires_at: null,
      })
      .eq("id", booking.id);

    // Add email to verified_visitor_emails (for future bookings)
    // Use upsert to handle case where email might already exist from a message verification
    await adminClient
      .from("verified_visitor_emails")
      .upsert(
        {
          email: booking.visitor_email.toLowerCase(),
          verified_via: "booking",
        },
        { onConflict: "email", ignoreDuplicates: true }
      );

    // Send notification email to therapist
    const therapistProfile = booking.therapist_profiles as unknown as {
      users: { name?: string; email?: string };
    };

    const therapistEmail = therapistProfile.users?.email;
    const therapistName = therapistProfile.users?.name || "there";

    if (therapistEmail) {
      const emailContent = getNewBookingNotificationEmail({
        recipientName: therapistName,
        visitorName: booking.visitor_name,
        visitorEmail: booking.visitor_email,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        bookingId: booking.id,
      });

      const emailSent = await sendEmail({
        to: therapistEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      if (!emailSent) {
        console.warn("Failed to send booking notification to therapist:", therapistEmail);
      }
    }

    return {
      success: true,
      data: { visitorToken: booking.visitor_token },
    };
  } catch (error) {
    console.error("Verify booking error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Confirm a booking (member action)
export async function confirmBookingAction(
  bookingId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { profileId, userId, error: profileError } = await getTherapistProfileId();

    if (!profileId || !userId) {
      return { success: false, error: profileError || "Not authenticated" };
    }

    // Get the booking with duration info (RLS will ensure ownership)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, visitor_name, visitor_email, booking_date, start_time, end_time, duration_minutes, status, is_verified")
      .eq("id", bookingId)
      .eq("therapist_profile_id", profileId)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Booking not found" };
    }

    if (!booking.is_verified) {
      return { success: false, error: "Booking has not been verified by visitor" };
    }

    if (booking.status !== "pending") {
      return { success: false, error: "Booking cannot be confirmed" };
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      return { success: false, error: "Failed to confirm booking" };
    }

    // Get therapist info for email and calendar event
    const { data: therapist } = await supabase
      .from("therapist_profiles")
      .select(`
        users!inner(name),
        therapist_booking_settings(
          timezone,
          google_calendar_connected,
          microsoft_calendar_connected
        )
      `)
      .eq("id", profileId)
      .single();

    const therapistUser = therapist?.users as unknown as { name?: string };
    const therapistName = therapistUser?.name || "the therapist";

    const bookingSettings = therapist?.therapist_booking_settings as unknown as {
      timezone?: string;
      google_calendar_connected?: boolean;
      microsoft_calendar_connected?: boolean;
    } | null;

    // Create calendar event if calendar is connected
    const timezone = bookingSettings?.timezone || "Europe/London";

    // Parse booking date and times to create Date objects
    const [year, month, day] = booking.booking_date.split("-").map(Number);
    const [startHour, startMin] = booking.start_time.split(":").map(Number);
    const [endHour, endMin] = booking.end_time.split(":").map(Number);

    const startTime = new Date(year, month - 1, day, startHour, startMin, 0);
    const endTime = new Date(year, month - 1, day, endHour, endMin, 0);

    const calendarEventDetails = {
      title: `Consultation with ${booking.visitor_name}`,
      description: `Hypnotherapy consultation booked through Find Hypnotherapy.\n\nClient: ${booking.visitor_name}\nEmail: ${booking.visitor_email}`,
      startTime,
      endTime,
      timezone,
      attendeeEmail: booking.visitor_email,
      attendeeName: booking.visitor_name,
    };

    // Try Google Calendar first, then Microsoft
    if (bookingSettings?.google_calendar_connected) {
      const calendarResult = await createGoogleCalendarEvent(
        userId,
        calendarEventDetails
      );
      if (!calendarResult.success) {
        console.warn("Failed to create Google Calendar event:", calendarResult.error);
      }
    } else if (bookingSettings?.microsoft_calendar_connected) {
      const calendarResult = await createMicrosoftCalendarEvent(
        userId,
        calendarEventDetails
      );
      if (!calendarResult.success) {
        console.warn("Failed to create Microsoft Calendar event:", calendarResult.error);
      }
    }

    // Send confirmation email to visitor
    const emailContent = getBookingConfirmedEmail({
      recipientName: booking.visitor_name,
      therapistName,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
    });

    const emailSent = await sendEmail({
      to: booking.visitor_email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    if (!emailSent) {
      console.warn("Failed to send confirmation email to visitor:", booking.visitor_email);
    }

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Confirm booking error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Cancel a booking (member action)
export async function cancelBookingAction(
  bookingId: string,
  reason?: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { profileId, error: profileError } = await getTherapistProfileId();

    if (!profileId) {
      return { success: false, error: profileError || "Not authenticated" };
    }

    // Get the booking with therapist info (RLS will ensure ownership)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        visitor_name,
        visitor_email,
        booking_date,
        start_time,
        status,
        therapist_profiles!inner (
          users!inner (
            name
          )
        )
      `)
      .eq("id", bookingId)
      .eq("therapist_profile_id", profileId)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return { success: false, error: "Booking cannot be cancelled" };
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: "member",
        cancellation_reason: reason || null,
      })
      .eq("id", bookingId);

    if (updateError) {
      return { success: false, error: "Failed to cancel booking" };
    }

    // Send cancellation email to visitor
    const therapistProfile = booking.therapist_profiles as unknown as {
      users: { name?: string };
    };
    const therapistName = therapistProfile.users?.name || "the therapist";

    const emailContent = getBookingCancelledEmail({
      recipientName: booking.visitor_name,
      therapistName,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      reason: reason || undefined,
    });

    const emailSent = await sendEmail({
      to: booking.visitor_email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    if (!emailSent) {
      console.warn("Failed to send cancellation email to visitor:", booking.visitor_email);
    }

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get bookings for the current member
export async function getBookingsForMember(
  filter: "pending" | "upcoming" | "past" | "all" = "all"
) {
  try {
    const supabase = await createClient();
    const { profileId, error: profileError } = await getTherapistProfileId();

    if (!profileId) {
      return { bookings: [], error: profileError || "Not authenticated" };
    }

    let query = supabase
      .from("bookings")
      .select("*")
      .eq("therapist_profile_id", profileId)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    const today = new Date().toISOString().split("T")[0];

    switch (filter) {
      case "pending":
        query = query
          .eq("status", "pending")
          .eq("is_verified", true)
          .gte("booking_date", today);
        break;
      case "upcoming":
        query = query
          .in("status", ["pending", "confirmed"])
          .gte("booking_date", today);
        break;
      case "past":
        query = query.lt("booking_date", today);
        break;
      case "all":
      default:
        // No additional filters
        break;
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Failed to fetch bookings:", error);
      return { bookings: [], error: "Failed to fetch bookings" };
    }

    return { bookings: bookings || [], error: null };
  } catch (error) {
    console.error("Get bookings error:", error);
    return { bookings: [], error: "An unexpected error occurred" };
  }
}

// Get a single booking by visitor token (for visitor view)
export async function getBookingByVisitorToken(token: string) {
  try {
    const adminClient = createAdminClient();

    const { data: booking, error } = await adminClient
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        end_time,
        duration_minutes,
        session_format,
        visitor_name,
        visitor_email,
        visitor_phone,
        visitor_notes,
        status,
        is_verified,
        created_at,
        confirmed_at,
        cancelled_at,
        cancellation_reason,
        cancelled_by,
        therapist_profiles!inner (
          id,
          slug,
          users!inner (
            name
          )
        )
      `
      )
      .eq("visitor_token", token)
      .single();

    if (error || !booking) {
      return { booking: null, error: "Booking not found" };
    }

    return { booking, error: null };
  } catch (error) {
    console.error("Get booking by token error:", error);
    return { booking: null, error: "An unexpected error occurred" };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  getBookingReminderEmail,
  getTherapistBookingReminderEmail,
} from "@/lib/email/templates";

// Verify API key for security
function verifyApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.REMINDER_API_KEY;

  if (!expectedKey) {
    console.error("REMINDER_API_KEY not configured");
    return false;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const providedKey = authHeader.slice(7);
  return providedKey === expectedKey;
}

export async function POST(request: NextRequest) {
  // Verify API key
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const now = new Date();
  const results = {
    reminders_24h_sent: 0,
    reminders_1h_sent: 0,
    errors: [] as string[],
  };

  try {
    // Calculate time windows for reminders
    // 24h reminder: bookings between 23.5 and 24.5 hours from now
    const min24h = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const max24h = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    // 1h reminder: bookings between 0.5 and 1.5 hours from now
    const min1h = new Date(now.getTime() + 0.5 * 60 * 60 * 1000);
    const max1h = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);

    // Get confirmed bookings that need reminders
    const { data: bookings, error: bookingsError } = await adminClient
      .from("bookings")
      .select(`
        id,
        booking_date,
        start_time,
        visitor_name,
        visitor_email,
        reminder_24h_sent_at,
        reminder_1h_sent_at,
        therapist_profiles!inner (
          id,
          user_id,
          users!inner (
            id,
            name,
            email
          ),
          therapist_booking_settings (
            timezone,
            send_visitor_reminders,
            send_therapist_reminders
          )
        )
      `)
      .eq("status", "confirmed")
      .gte("booking_date", now.toISOString().split("T")[0]);

    if (bookingsError) {
      console.error("Failed to fetch bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    for (const booking of bookings || []) {
      const therapistProfile = booking.therapist_profiles as unknown as {
        id: string;
        user_id: string;
        users: { id: string; name: string; email: string };
        therapist_booking_settings: {
          timezone: string;
          send_visitor_reminders: boolean;
          send_therapist_reminders: boolean;
        } | null;
      };

      const settings = therapistProfile.therapist_booking_settings;
      const timezone = settings?.timezone || "Europe/London";

      // Parse booking datetime in therapist's timezone
      const [hours, minutes] = booking.start_time.split(":").map(Number);
      const bookingDateTime = new Date(booking.booking_date);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      // Adjust for timezone (simplified - assumes server is in UTC)
      // For UK therapists, this handles BST automatically
      const bookingDateTimeStr = `${booking.booking_date}T${booking.start_time}:00`;
      const bookingDateTimeInTz = new Date(
        new Date(bookingDateTimeStr).toLocaleString("en-US", { timeZone: timezone })
      );

      // Check if 24h reminder is needed
      if (
        !booking.reminder_24h_sent_at &&
        bookingDateTimeInTz >= min24h &&
        bookingDateTimeInTz <= max24h
      ) {
        try {
          // Send visitor reminder if enabled
          if (settings?.send_visitor_reminders !== false) {
            const visitorEmail = getBookingReminderEmail({
              recipientName: booking.visitor_name,
              therapistName: therapistProfile.users.name,
              bookingDate: booking.booking_date,
              startTime: booking.start_time,
              reminderType: "24h",
            });

            const visitorSent = await sendEmail({
              to: booking.visitor_email,
              subject: visitorEmail.subject,
              html: visitorEmail.html,
            });

            if (!visitorSent.success) {
              results.errors.push(`Failed to send 24h visitor reminder for booking ${booking.id}`);
            }
          }

          // Send therapist reminder if enabled
          if (settings?.send_therapist_reminders !== false) {
            const therapistEmail = getTherapistBookingReminderEmail({
              recipientName: therapistProfile.users.name,
              visitorName: booking.visitor_name,
              visitorEmail: booking.visitor_email,
              bookingDate: booking.booking_date,
              startTime: booking.start_time,
              reminderType: "24h",
            });

            const therapistSent = await sendEmail({
              to: therapistProfile.users.email,
              subject: therapistEmail.subject,
              html: therapistEmail.html,
            });

            if (!therapistSent.success) {
              results.errors.push(`Failed to send 24h therapist reminder for booking ${booking.id}`);
            }
          }

          // Mark 24h reminder as sent
          await adminClient
            .from("bookings")
            .update({ reminder_24h_sent_at: now.toISOString() })
            .eq("id", booking.id);

          results.reminders_24h_sent++;
        } catch (error) {
          console.error(`Error sending 24h reminder for booking ${booking.id}:`, error);
          results.errors.push(`Error processing 24h reminder for booking ${booking.id}`);
        }
      }

      // Check if 1h reminder is needed
      if (
        !booking.reminder_1h_sent_at &&
        bookingDateTimeInTz >= min1h &&
        bookingDateTimeInTz <= max1h
      ) {
        try {
          // Send visitor reminder if enabled
          if (settings?.send_visitor_reminders !== false) {
            const visitorEmail = getBookingReminderEmail({
              recipientName: booking.visitor_name,
              therapistName: therapistProfile.users.name,
              bookingDate: booking.booking_date,
              startTime: booking.start_time,
              reminderType: "1h",
            });

            const visitorSent = await sendEmail({
              to: booking.visitor_email,
              subject: visitorEmail.subject,
              html: visitorEmail.html,
            });

            if (!visitorSent.success) {
              results.errors.push(`Failed to send 1h visitor reminder for booking ${booking.id}`);
            }
          }

          // Send therapist reminder if enabled
          if (settings?.send_therapist_reminders !== false) {
            const therapistEmail = getTherapistBookingReminderEmail({
              recipientName: therapistProfile.users.name,
              visitorName: booking.visitor_name,
              visitorEmail: booking.visitor_email,
              bookingDate: booking.booking_date,
              startTime: booking.start_time,
              reminderType: "1h",
            });

            const therapistSent = await sendEmail({
              to: therapistProfile.users.email,
              subject: therapistEmail.subject,
              html: therapistEmail.html,
            });

            if (!therapistSent.success) {
              results.errors.push(`Failed to send 1h therapist reminder for booking ${booking.id}`);
            }
          }

          // Mark 1h reminder as sent
          await adminClient
            .from("bookings")
            .update({ reminder_1h_sent_at: now.toISOString() })
            .eq("id", booking.id);

          results.reminders_1h_sent++;
        } catch (error) {
          console.error(`Error sending 1h reminder for booking ${booking.id}:`, error);
          results.errors.push(`Error processing 1h reminder for booking ${booking.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      processed_at: now.toISOString(),
    });
  } catch (error) {
    console.error("Reminder processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing (but still requires API key)
export async function GET(request: NextRequest) {
  return POST(request);
}

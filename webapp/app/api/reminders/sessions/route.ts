import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  getSessionRsvpReminderEmail,
  getClientSessionReminderEmail,
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.co.uk";

  const results = {
    rsvp_reminders_sent: 0,
    session_reminders_24h_sent: 0,
    session_reminders_1h_sent: 0,
    errors: [] as string[],
  };

  try {
    // =====================
    // PROCESS RSVP REMINDERS
    // =====================

    // Get sessions that need RSVP reminders
    const { data: pendingRsvpSessions, error: rsvpError } = await adminClient
      .from("client_sessions")
      .select(`
        id,
        title,
        session_date,
        start_time,
        end_time,
        rsvp_status,
        rsvp_token,
        rsvp_reminder_1_sent_at,
        rsvp_reminder_2_sent_at,
        created_at,
        clients!inner (
          id,
          email,
          first_name,
          last_name
        ),
        therapist_profiles!inner (
          id,
          user_id,
          users!inner (
            name
          ),
          therapist_booking_settings (
            send_rsvp_reminders,
            rsvp_first_reminder_hours,
            rsvp_second_reminder_hours
          )
        )
      `)
      .eq("status", "scheduled")
      .eq("rsvp_status", "pending")
      .not("rsvp_token", "is", null)
      .gte("session_date", now.toISOString().split("T")[0]);

    if (rsvpError) {
      console.error("Failed to fetch RSVP sessions:", rsvpError);
      results.errors.push("Failed to fetch RSVP sessions");
    } else {
      for (const session of pendingRsvpSessions || []) {
        const therapistProfile = session.therapist_profiles as unknown as {
          id: string;
          user_id: string;
          users: { name: string };
          therapist_booking_settings: {
            send_rsvp_reminders: boolean;
            rsvp_first_reminder_hours: number;
            rsvp_second_reminder_hours: number;
          } | null;
        };

        const settings = therapistProfile.therapist_booking_settings;

        // Skip if RSVP reminders are disabled
        if (settings?.send_rsvp_reminders === false) continue;

        const client = session.clients as unknown as {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
        };

        const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
        const therapistName = therapistProfile.users.name;

        const sessionCreatedAt = new Date(session.created_at);
        const hoursElapsed = (now.getTime() - sessionCreatedAt.getTime()) / (1000 * 60 * 60);

        // Parse session datetime to ensure reminder doesn't go out too close to session
        const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`);
        const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Don't send reminders if session is less than 12 hours away
        if (hoursUntilSession < 12) continue;

        const firstReminderHours = settings?.rsvp_first_reminder_hours ?? 24;
        const secondReminderHours = settings?.rsvp_second_reminder_hours ?? 48;

        // Check if first reminder is needed
        if (
          !session.rsvp_reminder_1_sent_at &&
          hoursElapsed >= firstReminderHours &&
          hoursElapsed < secondReminderHours
        ) {
          try {
            const email = getSessionRsvpReminderEmail({
              clientName,
              therapistName,
              sessionTitle: session.title,
              sessionDate: session.session_date,
              startTime: session.start_time,
              endTime: session.end_time,
              acceptUrl: `${baseUrl}/session-rsvp?token=${session.rsvp_token}&action=accept`,
              declineUrl: `${baseUrl}/session-rsvp?token=${session.rsvp_token}&action=decline`,
              rescheduleUrl: `${baseUrl}/session-rsvp/propose?token=${session.rsvp_token}`,
              reminderNumber: 1,
            });

            const sent = await sendEmail({
              to: client.email,
              subject: email.subject,
              html: email.html,
            });

            if (sent.success) {
              await adminClient
                .from("client_sessions")
                .update({ rsvp_reminder_1_sent_at: now.toISOString() })
                .eq("id", session.id);

              results.rsvp_reminders_sent++;
            } else {
              results.errors.push(`Failed to send RSVP reminder 1 for session ${session.id}`);
            }
          } catch (error) {
            console.error(`Error sending RSVP reminder 1 for session ${session.id}:`, error);
            results.errors.push(`Error processing RSVP reminder 1 for session ${session.id}`);
          }
        }

        // Check if second reminder is needed
        if (
          session.rsvp_reminder_1_sent_at &&
          !session.rsvp_reminder_2_sent_at &&
          hoursElapsed >= secondReminderHours
        ) {
          try {
            const email = getSessionRsvpReminderEmail({
              clientName,
              therapistName,
              sessionTitle: session.title,
              sessionDate: session.session_date,
              startTime: session.start_time,
              endTime: session.end_time,
              acceptUrl: `${baseUrl}/session-rsvp?token=${session.rsvp_token}&action=accept`,
              declineUrl: `${baseUrl}/session-rsvp?token=${session.rsvp_token}&action=decline`,
              rescheduleUrl: `${baseUrl}/session-rsvp/propose?token=${session.rsvp_token}`,
              reminderNumber: 2,
            });

            const sent = await sendEmail({
              to: client.email,
              subject: email.subject,
              html: email.html,
            });

            if (sent.success) {
              await adminClient
                .from("client_sessions")
                .update({ rsvp_reminder_2_sent_at: now.toISOString() })
                .eq("id", session.id);

              results.rsvp_reminders_sent++;
            } else {
              results.errors.push(`Failed to send RSVP reminder 2 for session ${session.id}`);
            }
          } catch (error) {
            console.error(`Error sending RSVP reminder 2 for session ${session.id}:`, error);
            results.errors.push(`Error processing RSVP reminder 2 for session ${session.id}`);
          }
        }
      }
    }

    // =====================
    // PROCESS SESSION REMINDERS
    // =====================

    // Calculate time windows for reminders
    const min24h = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const max24h = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);
    const min1h = new Date(now.getTime() + 0.5 * 60 * 60 * 1000);
    const max1h = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);

    // Get sessions that need session reminders (only accepted RSVP or no RSVP required)
    const { data: upcomingSessions, error: sessionsError } = await adminClient
      .from("client_sessions")
      .select(`
        id,
        title,
        session_date,
        start_time,
        end_time,
        session_format,
        location,
        meeting_url,
        rsvp_status,
        reminder_24h_sent_at,
        reminder_1h_sent_at,
        clients!inner (
          id,
          email,
          first_name,
          last_name
        ),
        therapist_profiles!inner (
          id,
          user_id,
          users!inner (
            name
          ),
          therapist_booking_settings (
            send_client_session_reminders,
            client_session_reminder_24h,
            client_session_reminder_1h
          )
        )
      `)
      .eq("status", "scheduled")
      .gte("session_date", now.toISOString().split("T")[0]);

    if (sessionsError) {
      console.error("Failed to fetch upcoming sessions:", sessionsError);
      results.errors.push("Failed to fetch upcoming sessions");
    } else {
      for (const session of upcomingSessions || []) {
        // Only send reminders for accepted RSVP or sessions without RSVP
        if (session.rsvp_status && session.rsvp_status !== "accepted") continue;

        const therapistProfile = session.therapist_profiles as unknown as {
          id: string;
          user_id: string;
          users: { name: string };
          therapist_booking_settings: {
            send_client_session_reminders: boolean;
            client_session_reminder_24h: boolean;
            client_session_reminder_1h: boolean;
          } | null;
        };

        const settings = therapistProfile.therapist_booking_settings;

        // Skip if session reminders are disabled
        if (settings?.send_client_session_reminders === false) continue;

        const client = session.clients as unknown as {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
        };

        const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
        const therapistName = therapistProfile.users.name;

        // Parse session datetime
        const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`);

        // Check if 24h reminder is needed
        if (
          settings?.client_session_reminder_24h !== false &&
          !session.reminder_24h_sent_at &&
          sessionDateTime >= min24h &&
          sessionDateTime <= max24h
        ) {
          try {
            const email = getClientSessionReminderEmail({
              clientName,
              therapistName,
              sessionTitle: session.title,
              sessionDate: session.session_date,
              startTime: session.start_time,
              endTime: session.end_time,
              sessionFormat: session.session_format || undefined,
              location: session.location || undefined,
              meetingUrl: session.meeting_url || undefined,
              reminderType: "24h",
            });

            const sent = await sendEmail({
              to: client.email,
              subject: email.subject,
              html: email.html,
            });

            if (sent.success) {
              await adminClient
                .from("client_sessions")
                .update({ reminder_24h_sent_at: now.toISOString() })
                .eq("id", session.id);

              results.session_reminders_24h_sent++;
            } else {
              results.errors.push(`Failed to send 24h reminder for session ${session.id}`);
            }
          } catch (error) {
            console.error(`Error sending 24h reminder for session ${session.id}:`, error);
            results.errors.push(`Error processing 24h reminder for session ${session.id}`);
          }
        }

        // Check if 1h reminder is needed
        if (
          settings?.client_session_reminder_1h !== false &&
          !session.reminder_1h_sent_at &&
          sessionDateTime >= min1h &&
          sessionDateTime <= max1h
        ) {
          try {
            const email = getClientSessionReminderEmail({
              clientName,
              therapistName,
              sessionTitle: session.title,
              sessionDate: session.session_date,
              startTime: session.start_time,
              endTime: session.end_time,
              sessionFormat: session.session_format || undefined,
              location: session.location || undefined,
              meetingUrl: session.meeting_url || undefined,
              reminderType: "1h",
            });

            const sent = await sendEmail({
              to: client.email,
              subject: email.subject,
              html: email.html,
            });

            if (sent.success) {
              await adminClient
                .from("client_sessions")
                .update({ reminder_1h_sent_at: now.toISOString() })
                .eq("id", session.id);

              results.session_reminders_1h_sent++;
            } else {
              results.errors.push(`Failed to send 1h reminder for session ${session.id}`);
            }
          } catch (error) {
            console.error(`Error sending 1h reminder for session ${session.id}:`, error);
            results.errors.push(`Error processing 1h reminder for session ${session.id}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      processed_at: now.toISOString(),
    });
  } catch (error) {
    console.error("Session reminder processing error:", error);
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

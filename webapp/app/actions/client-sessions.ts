"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  clientSessionSchema,
  clientSessionUpdateSchema,
  cancelSessionSchema,
  type ClientSessionData,
  type ClientSessionUpdateData,
  type CancelSessionData,
} from "@/lib/validation/clients";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  getSessionCreatedEmail,
  getSessionUpdatedEmail,
  getSessionCancelledEmail,
  getSessionRsvpRequestEmail,
} from "@/lib/email/templates";
import { generateICS, ICSEventData } from "@/lib/calendar/ics";

// Generate a secure RSVP token
function generateRsvpToken(): string {
  return randomBytes(32).toString("hex");
}

type ActionResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: Record<string, unknown>;
};

function extractFieldErrors(
  issues: { path: PropertyKey[]; message: string }[]
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  issues.forEach((issue) => {
    const fieldName = issue.path[0]?.toString();
    if (fieldName) {
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = [];
      }
      fieldErrors[fieldName].push(issue.message);
    }
  });
  return fieldErrors;
}

// =====================
// CREATE SESSION
// =====================

export async function createClientSessionAction(
  data: ClientSessionData
): Promise<ActionResponse> {
  const validation = clientSessionSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const {
    clientId,
    serviceId,
    title,
    description,
    sessionDate,
    startTime,
    endTime,
    durationMinutes,
    sessionFormat,
    location,
    meetingUrl,
    therapistNotes,
    sendNotification,
  } = validation.data;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile with user name and booking settings
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id, user_id, users(name), therapist_booking_settings(*)")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Get booking settings (with defaults)
    const bookingSettings = profile.therapist_booking_settings as {
      require_session_rsvp?: boolean;
    } | null;
    const requireRsvp = bookingSettings?.require_session_rsvp ?? true;

    // Verify client ownership and get client info
    const { data: client } = await supabase
      .from("clients")
      .select("id, email, first_name, last_name, status")
      .eq("id", clientId)
      .eq("therapist_profile_id", profile.id)
      .single();

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    if (client.status !== "active") {
      return { success: false, error: "Cannot create sessions for inactive clients" };
    }

    // Generate RSVP token if RSVP is required and notification will be sent
    const rsvpToken = (requireRsvp && sendNotification) ? generateRsvpToken() : null;
    const rsvpTokenExpiresAt = rsvpToken
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      : null;

    // Create session
    const { data: session, error } = await supabase
      .from("client_sessions")
      .insert({
        client_id: clientId,
        therapist_profile_id: profile.id,
        service_id: serviceId || null,
        title,
        description: description || null,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        session_format: sessionFormat || null,
        location: location || null,
        meeting_url: meetingUrl || null,
        therapist_notes: therapistNotes || null,
        status: "scheduled",
        rsvp_status: rsvpToken ? "pending" : null,
        rsvp_token: rsvpToken,
        rsvp_token_expires_at: rsvpTokenExpiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create session:", error);
      return { success: false, error: "Failed to create session" };
    }

    // Send notification email with ICS attachment
    if (sendNotification) {
      try {
        const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
        const therapistName = (profile.users as unknown as { name: string } | null)?.name ?? "Therapist";

        // Generate ICS file
        const icsData: ICSEventData = {
          uid: session.id,
          title,
          description: description || undefined,
          startDate: sessionDate,
          startTime,
          endTime,
          location: location || undefined,
          meetingUrl: meetingUrl || undefined,
          organizerName: therapistName,
          organizerEmail: user.email || "",
          attendeeName: clientName,
          attendeeEmail: client.email,
          method: "REQUEST",
          sequence: 0,
        };
        const icsContent = generateICS(icsData);

        // Build RSVP URLs if RSVP is required
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.co.uk";
        const rsvpUrls = rsvpToken
          ? {
              acceptUrl: `${baseUrl}/session-rsvp?token=${rsvpToken}&action=accept`,
              declineUrl: `${baseUrl}/session-rsvp?token=${rsvpToken}&action=decline`,
              rescheduleUrl: `${baseUrl}/session-rsvp/propose?token=${rsvpToken}`,
              portalUrl: `${baseUrl}/portal`,
            }
          : null;

        // Use RSVP email template if RSVP is required, otherwise use standard template
        const email = rsvpUrls
          ? getSessionRsvpRequestEmail({
              clientName,
              therapistName,
              sessionTitle: title,
              sessionDate,
              startTime,
              endTime,
              sessionFormat: sessionFormat || undefined,
              location: location || undefined,
              meetingUrl: meetingUrl || undefined,
              acceptUrl: rsvpUrls.acceptUrl,
              declineUrl: rsvpUrls.declineUrl,
              rescheduleUrl: rsvpUrls.rescheduleUrl,
              portalUrl: rsvpUrls.portalUrl,
            })
          : getSessionCreatedEmail({
              clientName,
              therapistName,
              sessionTitle: title,
              sessionDate,
              startTime,
              endTime,
              sessionFormat: sessionFormat || undefined,
              location: location || undefined,
              meetingUrl: meetingUrl || undefined,
            });

        await sendEmail({
          to: client.email,
          subject: email.subject,
          html: email.html,
          attachments: [
            {
              content: Buffer.from(icsContent).toString("base64"),
              filename: "session.ics",
              type: "text/calendar",
              disposition: "attachment",
            },
          ],
        });
      } catch (emailError) {
        console.error("Failed to send session notification:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/calendar");
    return { success: true, data: session };
  } catch (error) {
    console.error("Error creating session:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// UPDATE SESSION
// =====================

export async function updateClientSessionAction(
  data: ClientSessionUpdateData
): Promise<ActionResponse> {
  const validation = clientSessionUpdateSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const {
    sessionId,
    serviceId,
    title,
    description,
    sessionDate,
    startTime,
    endTime,
    durationMinutes,
    sessionFormat,
    location,
    meetingUrl,
    therapistNotes,
    sendNotification,
  } = validation.data;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile with user name and booking settings
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id, users(name), therapist_booking_settings(*)")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Get booking settings (with defaults)
    const bookingSettings = profile.therapist_booking_settings as {
      require_session_rsvp?: boolean;
    } | null;
    const requireRsvp = bookingSettings?.require_session_rsvp ?? true;

    // Get existing session with client info
    const { data: existingSession } = await supabase
      .from("client_sessions")
      .select(`
        *,
        clients(id, email, first_name, last_name)
      `)
      .eq("id", sessionId)
      .eq("therapist_profile_id", profile.id)
      .single();

    if (!existingSession) {
      return { success: false, error: "Session not found" };
    }

    if (existingSession.status === "cancelled") {
      return { success: false, error: "Cannot update a cancelled session" };
    }

    // Check if date/time has changed - requires RSVP reset
    const dateTimeChanged =
      (sessionDate && sessionDate !== existingSession.session_date) ||
      (startTime && startTime !== existingSession.start_time);

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (serviceId !== undefined) updateData.service_id = serviceId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (sessionDate !== undefined) updateData.session_date = sessionDate;
    if (startTime !== undefined) updateData.start_time = startTime;
    if (endTime !== undefined) updateData.end_time = endTime;
    if (durationMinutes !== undefined) updateData.duration_minutes = durationMinutes;
    if (sessionFormat !== undefined) updateData.session_format = sessionFormat;
    if (location !== undefined) updateData.location = location;
    if (meetingUrl !== undefined) updateData.meeting_url = meetingUrl;
    if (therapistNotes !== undefined) updateData.therapist_notes = therapistNotes;

    // Reset RSVP if date/time changed and RSVP is required
    let newRsvpToken: string | null = null;
    if (dateTimeChanged && requireRsvp && sendNotification) {
      newRsvpToken = generateRsvpToken();
      updateData.rsvp_status = "pending";
      updateData.rsvp_token = newRsvpToken;
      updateData.rsvp_token_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      updateData.rsvp_responded_at = null;
      updateData.rsvp_message = null;
      updateData.proposed_date = null;
      updateData.proposed_start_time = null;
      updateData.proposed_end_time = null;
      updateData.rsvp_reminder_1_sent_at = null;
      updateData.rsvp_reminder_2_sent_at = null;
    }

    // Update session
    const { data: updatedSession, error } = await supabase
      .from("client_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update session:", error);
      return { success: false, error: "Failed to update session" };
    }

    // Send update notification
    if (sendNotification && existingSession.clients) {
      try {
        const client = existingSession.clients as { email: string; first_name: string | null; last_name: string | null };
        const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
        const therapistName = (profile.users as unknown as { name: string } | null)?.name ?? "Therapist";

        // Generate updated ICS
        const icsData: ICSEventData = {
          uid: sessionId,
          title: title || existingSession.title,
          description: description || existingSession.description || undefined,
          startDate: sessionDate || existingSession.session_date,
          startTime: startTime || existingSession.start_time,
          endTime: endTime || existingSession.end_time,
          location: location !== undefined ? location || undefined : existingSession.location || undefined,
          meetingUrl: meetingUrl !== undefined ? meetingUrl || undefined : existingSession.meeting_url || undefined,
          organizerName: therapistName,
          organizerEmail: user.email || "",
          attendeeName: clientName,
          attendeeEmail: client.email,
          method: "REQUEST",
          sequence: 1, // Increment sequence for updates
        };
        const icsContent = generateICS(icsData);

        // Build changes description
        const changes: string[] = [];
        if (sessionDate && sessionDate !== existingSession.session_date) changes.push("Date changed");
        if (startTime && startTime !== existingSession.start_time) changes.push("Time changed");
        if (location !== undefined && location !== existingSession.location) changes.push("Location updated");
        if (meetingUrl !== undefined && meetingUrl !== existingSession.meeting_url) changes.push("Meeting link updated");
        const changesDescription = changes.length > 0 ? changes.join(", ") : "Session details updated";

        const email = getSessionUpdatedEmail({
          clientName,
          therapistName,
          sessionTitle: title || existingSession.title,
          sessionDate: sessionDate || existingSession.session_date,
          startTime: startTime || existingSession.start_time,
          endTime: endTime || existingSession.end_time,
          changesDescription,
          sessionFormat: (sessionFormat || existingSession.session_format) as "online" | "in-person" | "phone" | undefined,
          location: location !== undefined ? location || undefined : existingSession.location || undefined,
          meetingUrl: meetingUrl !== undefined ? meetingUrl || undefined : existingSession.meeting_url || undefined,
        });

        await sendEmail({
          to: client.email,
          subject: email.subject,
          html: email.html,
          attachments: [
            {
              content: Buffer.from(icsContent).toString("base64"),
              filename: "session-update.ics",
              type: "text/calendar",
              disposition: "attachment",
            },
          ],
        });
      } catch (emailError) {
        console.error("Failed to send update notification:", emailError);
      }
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/calendar");
    return { success: true, data: updatedSession };
  } catch (error) {
    console.error("Error updating session:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// CANCEL SESSION
// =====================

export async function cancelClientSessionAction(
  data: CancelSessionData
): Promise<ActionResponse> {
  const validation = cancelSessionSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { sessionId, reason, sendNotification } = validation.data;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile with user name
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id, users(name)")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Get session with client info
    const { data: session } = await supabase
      .from("client_sessions")
      .select(`
        *,
        clients(id, email, first_name, last_name)
      `)
      .eq("id", sessionId)
      .eq("therapist_profile_id", profile.id)
      .single();

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (session.status === "cancelled") {
      return { success: false, error: "Session is already cancelled" };
    }

    // Cancel session and clear RSVP fields
    const { error } = await supabase
      .from("client_sessions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        // Clear RSVP fields
        rsvp_token: null,
        rsvp_token_expires_at: null,
        rsvp_reminder_1_sent_at: null,
        rsvp_reminder_2_sent_at: null,
        reminder_24h_sent_at: null,
        reminder_1h_sent_at: null,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to cancel session:", error);
      return { success: false, error: "Failed to cancel session" };
    }

    // Send cancellation notification
    if (sendNotification && session.clients) {
      try {
        const client = session.clients as { email: string; first_name: string | null; last_name: string | null };
        const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
        const therapistName = (profile.users as unknown as { name: string } | null)?.name ?? "Therapist";

        // Generate cancellation ICS
        const icsData: ICSEventData = {
          uid: sessionId,
          title: session.title,
          startDate: session.session_date,
          startTime: session.start_time,
          endTime: session.end_time,
          organizerName: therapistName,
          organizerEmail: user.email || "",
          attendeeName: clientName,
          attendeeEmail: client.email,
          method: "CANCEL",
          sequence: 2,
        };
        const icsContent = generateICS(icsData);

        const email = getSessionCancelledEmail({
          clientName,
          therapistName,
          sessionTitle: session.title,
          sessionDate: session.session_date,
          startTime: session.start_time,
          reason: reason || undefined,
        });

        await sendEmail({
          to: client.email,
          subject: email.subject,
          html: email.html,
          attachments: [
            {
              content: Buffer.from(icsContent).toString("base64"),
              filename: "session-cancelled.ics",
              type: "text/calendar",
              disposition: "attachment",
            },
          ],
        });
      } catch (emailError) {
        console.error("Failed to send cancellation notification:", emailError);
      }
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling session:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// MARK SESSION COMPLETE
// =====================

export async function markSessionCompleteAction(
  sessionId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Update session status
    const { error } = await supabase
      .from("client_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId)
      .eq("therapist_profile_id", profile.id)
      .eq("status", "scheduled");

    if (error) {
      console.error("Failed to mark session complete:", error);
      return { success: false, error: "Failed to update session" };
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error marking session complete:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// MARK SESSION NO-SHOW
// =====================

export async function markSessionNoShowAction(
  sessionId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Update session status
    const { error } = await supabase
      .from("client_sessions")
      .update({ status: "no_show" })
      .eq("id", sessionId)
      .eq("therapist_profile_id", profile.id)
      .eq("status", "scheduled");

    if (error) {
      console.error("Failed to mark session no-show:", error);
      return { success: false, error: "Failed to update session" };
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error marking session no-show:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET SESSIONS FOR CALENDAR
// =====================

export async function getSessionsForCalendarAction(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown>[] }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Get sessions within date range
    const { data: sessions, error } = await supabase
      .from("client_sessions")
      .select(`
        *,
        clients(id, slug, first_name, last_name, email)
      `)
      .eq("therapist_profile_id", profile.id)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Failed to get sessions:", error);
      return { success: false, error: "Failed to load sessions" };
    }

    return { success: true, data: sessions || [] };
  } catch (error) {
    console.error("Error getting sessions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

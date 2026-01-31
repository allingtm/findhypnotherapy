"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rsvpResponseSchema,
  rsvpProposeRescheduleSchema,
  therapistRescheduleResponseSchema,
  type RsvpResponseData,
  type RsvpProposeRescheduleData,
  type TherapistRescheduleResponseData,
} from "@/lib/validation/clients";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  getSessionRsvpConfirmationEmail,
  getSessionRsvpDeclinedNotificationEmail,
  getSessionRescheduleProposalEmail,
  getSessionRescheduleResponseEmail,
  getSessionRsvpRequestEmail,
} from "@/lib/email/templates";
import { generateICS, ICSEventData } from "@/lib/calendar/ics";

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
// RESPOND TO RSVP VIA TOKEN
// =====================

export async function respondToSessionRsvpAction(
  data: RsvpResponseData
): Promise<ActionResponse> {
  const validation = rsvpResponseSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { token, response } = validation.data;

  try {
    // Use admin client to bypass RLS since this is a public action
    const supabase = createAdminClient();

    // Find session by token
    const { data: session, error: sessionError } = await supabase
      .from("client_sessions")
      .select(`
        *,
        clients(id, email, first_name, last_name, slug),
        therapist_profiles(id, user_id, users(name, email))
      `)
      .eq("rsvp_token", token)
      .single();

    if (sessionError || !session) {
      return { success: false, error: "Invalid or expired RSVP link" };
    }

    // Check token expiry
    if (session.rsvp_token_expires_at && new Date(session.rsvp_token_expires_at) < new Date()) {
      return { success: false, error: "This RSVP link has expired. Please contact your therapist directly." };
    }

    // Check session isn't cancelled
    if (session.status === "cancelled") {
      return { success: false, error: "This session has been cancelled" };
    }

    // Update RSVP status
    const { error: updateError } = await supabase
      .from("client_sessions")
      .update({
        rsvp_status: response,
        rsvp_responded_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (updateError) {
      console.error("Failed to update RSVP status:", updateError);
      return { success: false, error: "Failed to record your response" };
    }

    // Get names for emails
    const client = session.clients as { email: string; first_name: string | null; last_name: string | null; slug: string };
    const therapistProfile = session.therapist_profiles as { id: string; user_id: string; users: { name: string; email: string } | null };
    const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
    const therapistName = therapistProfile.users?.name ?? "Therapist";
    const therapistEmail = therapistProfile.users?.email ?? "";

    // Send confirmation to client
    try {
      const confirmationEmail = getSessionRsvpConfirmationEmail({
        clientName,
        therapistName,
        sessionTitle: session.title,
        sessionDate: session.session_date,
        startTime: session.start_time,
        endTime: session.end_time,
        response,
        sessionFormat: session.session_format || undefined,
        location: session.location || undefined,
        meetingUrl: session.meeting_url || undefined,
      });

      await sendEmail({
        to: client.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      });
    } catch (emailError) {
      console.error("Failed to send RSVP confirmation to client:", emailError);
    }

    // If declined, notify therapist
    if (response === "declined") {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.co.uk";
        const notificationEmail = getSessionRsvpDeclinedNotificationEmail({
          therapistName,
          clientName,
          clientEmail: client.email,
          sessionTitle: session.title,
          sessionDate: session.session_date,
          startTime: session.start_time,
          clientDetailUrl: `${baseUrl}/dashboard/clients/${client.slug}`,
        });

        await sendEmail({
          to: therapistEmail,
          subject: notificationEmail.subject,
          html: notificationEmail.html,
        });
      } catch (emailError) {
        console.error("Failed to send decline notification to therapist:", emailError);
      }
    }

    return { success: true, data: { response } };
  } catch (error) {
    console.error("Error processing RSVP response:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// PROPOSE RESCHEDULE VIA TOKEN
// =====================

export async function proposeSessionRescheduleAction(
  data: RsvpProposeRescheduleData
): Promise<ActionResponse> {
  const validation = rsvpProposeRescheduleSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { token, proposedDate, proposedStartTime, proposedEndTime, message } = validation.data;

  try {
    const supabase = createAdminClient();

    // Find session by token
    const { data: session, error: sessionError } = await supabase
      .from("client_sessions")
      .select(`
        *,
        clients(id, email, first_name, last_name, slug),
        therapist_profiles(id, user_id, users(name, email))
      `)
      .eq("rsvp_token", token)
      .single();

    if (sessionError || !session) {
      return { success: false, error: "Invalid or expired RSVP link" };
    }

    // Check token expiry
    if (session.rsvp_token_expires_at && new Date(session.rsvp_token_expires_at) < new Date()) {
      return { success: false, error: "This RSVP link has expired. Please contact your therapist directly." };
    }

    // Check session isn't cancelled
    if (session.status === "cancelled") {
      return { success: false, error: "This session has been cancelled" };
    }

    // Update session with reschedule proposal
    const { error: updateError } = await supabase
      .from("client_sessions")
      .update({
        rsvp_status: "reschedule_requested",
        rsvp_responded_at: new Date().toISOString(),
        rsvp_message: message || null,
        proposed_date: proposedDate,
        proposed_start_time: proposedStartTime,
        proposed_end_time: proposedEndTime,
      })
      .eq("id", session.id);

    if (updateError) {
      console.error("Failed to submit reschedule proposal:", updateError);
      return { success: false, error: "Failed to submit your request" };
    }

    // Get names for emails
    const client = session.clients as { email: string; first_name: string | null; last_name: string | null; slug: string };
    const therapistProfile = session.therapist_profiles as { id: string; user_id: string; users: { name: string; email: string } | null };
    const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
    const therapistName = therapistProfile.users?.name ?? "Therapist";
    const therapistEmail = therapistProfile.users?.email ?? "";

    // Notify therapist of reschedule request
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.co.uk";
      const proposalEmail = getSessionRescheduleProposalEmail({
        therapistName,
        clientName,
        clientEmail: client.email,
        sessionTitle: session.title,
        originalDate: session.session_date,
        originalStartTime: session.start_time,
        proposedDate,
        proposedStartTime,
        proposedEndTime,
        message: message || undefined,
        clientDetailUrl: `${baseUrl}/dashboard/clients/${client.slug}`,
      });

      await sendEmail({
        to: therapistEmail,
        subject: proposalEmail.subject,
        html: proposalEmail.html,
      });
    } catch (emailError) {
      console.error("Failed to send reschedule proposal to therapist:", emailError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error processing reschedule proposal:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// THERAPIST RESPONDS TO RESCHEDULE PROPOSAL
// =====================

export async function respondToRescheduleProposalAction(
  data: TherapistRescheduleResponseData
): Promise<ActionResponse> {
  const validation = therapistRescheduleResponseSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { sessionId, accept, message } = validation.data;

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
      .select("id, users(name, email)")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Get session with proposal
    const { data: session } = await supabase
      .from("client_sessions")
      .select(`
        *,
        clients(id, email, first_name, last_name, slug)
      `)
      .eq("id", sessionId)
      .eq("therapist_profile_id", profile.id)
      .eq("rsvp_status", "reschedule_requested")
      .single();

    if (!session) {
      return { success: false, error: "Session not found or no pending reschedule request" };
    }

    const client = session.clients as { email: string; first_name: string | null; last_name: string | null; slug: string };
    const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
    const users = profile.users as unknown as { name: string; email: string } | null;
    const therapistName = users?.name ?? "Therapist";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.co.uk";

    if (accept) {
      // Accept: Update session to proposed time and reset RSVP for new confirmation
      const newToken = randomBytes(32).toString("hex");

      const { error: updateError } = await supabase
        .from("client_sessions")
        .update({
          session_date: session.proposed_date,
          start_time: session.proposed_start_time,
          end_time: session.proposed_end_time,
          rsvp_status: "pending",
          rsvp_token: newToken,
          rsvp_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          rsvp_responded_at: null,
          rsvp_message: null,
          proposed_date: null,
          proposed_start_time: null,
          proposed_end_time: null,
          rsvp_reminder_1_sent_at: null,
          rsvp_reminder_2_sent_at: null,
        })
        .eq("id", sessionId);

      if (updateError) {
        console.error("Failed to accept reschedule:", updateError);
        return { success: false, error: "Failed to accept reschedule" };
      }

      // Send notification to client with new RSVP links
      try {
        const rsvpEmail = getSessionRsvpRequestEmail({
          clientName,
          therapistName,
          sessionTitle: session.title,
          sessionDate: session.proposed_date!,
          startTime: session.proposed_start_time!,
          endTime: session.proposed_end_time!,
          sessionFormat: session.session_format || undefined,
          location: session.location || undefined,
          meetingUrl: session.meeting_url || undefined,
          acceptUrl: `${baseUrl}/session-rsvp?token=${newToken}&action=accept`,
          declineUrl: `${baseUrl}/session-rsvp?token=${newToken}&action=decline`,
          rescheduleUrl: `${baseUrl}/session-rsvp/propose?token=${newToken}`,
          portalUrl: `${baseUrl}/portal`,
        });

        // Generate ICS for updated session
        const icsData: ICSEventData = {
          uid: session.id,
          title: session.title,
          description: session.description || undefined,
          startDate: session.proposed_date!,
          startTime: session.proposed_start_time!,
          endTime: session.proposed_end_time!,
          location: session.location || undefined,
          meetingUrl: session.meeting_url || undefined,
          organizerName: therapistName,
          organizerEmail: user.email || "",
          attendeeName: clientName,
          attendeeEmail: client.email,
          method: "REQUEST",
          sequence: 1,
        };
        const icsContent = generateICS(icsData);

        await sendEmail({
          to: client.email,
          subject: rsvpEmail.subject,
          html: rsvpEmail.html,
          attachments: [
            {
              content: Buffer.from(icsContent).toString("base64"),
              filename: "session-rescheduled.ics",
              type: "text/calendar",
              disposition: "attachment",
            },
          ],
        });
      } catch (emailError) {
        console.error("Failed to send reschedule confirmation to client:", emailError);
      }
    } else {
      // Decline: Clear proposal fields, keep original session
      const { error: updateError } = await supabase
        .from("client_sessions")
        .update({
          rsvp_status: "pending", // Reset to pending so they can respond again
          proposed_date: null,
          proposed_start_time: null,
          proposed_end_time: null,
          rsvp_message: null,
        })
        .eq("id", sessionId);

      if (updateError) {
        console.error("Failed to decline reschedule:", updateError);
        return { success: false, error: "Failed to decline reschedule" };
      }

      // Notify client that reschedule was declined
      try {
        const responseEmail = getSessionRescheduleResponseEmail({
          clientName,
          therapistName,
          sessionTitle: session.title,
          accepted: false,
          message: message || undefined,
          portalUrl: `${baseUrl}/portal`,
        });

        await sendEmail({
          to: client.email,
          subject: responseEmail.subject,
          html: responseEmail.html,
        });
      } catch (emailError) {
        console.error("Failed to send reschedule decline to client:", emailError);
      }
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error responding to reschedule proposal:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET SESSION BY RSVP TOKEN (for public pages)
// =====================

export async function getSessionByRsvpTokenAction(
  token: string
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  if (!token || token.length !== 64) {
    return { success: false, error: "Invalid token" };
  }

  try {
    const supabase = createAdminClient();

    const { data: session, error } = await supabase
      .from("client_sessions")
      .select(`
        id,
        title,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        session_format,
        location,
        meeting_url,
        status,
        rsvp_status,
        rsvp_token_expires_at,
        clients(first_name, last_name),
        therapist_profiles(users(name))
      `)
      .eq("rsvp_token", token)
      .single();

    if (error || !session) {
      return { success: false, error: "Invalid or expired RSVP link" };
    }

    // Check token expiry
    if (session.rsvp_token_expires_at && new Date(session.rsvp_token_expires_at) < new Date()) {
      return { success: false, error: "This RSVP link has expired" };
    }

    // Check session isn't cancelled
    if (session.status === "cancelled") {
      return { success: false, error: "This session has been cancelled" };
    }

    const client = session.clients as unknown as { first_name: string | null; last_name: string | null };
    const therapistProfile = session.therapist_profiles as unknown as { users: { name: string } | null };

    return {
      success: true,
      data: {
        id: session.id,
        title: session.title,
        sessionDate: session.session_date,
        startTime: session.start_time,
        endTime: session.end_time,
        durationMinutes: session.duration_minutes,
        sessionFormat: session.session_format,
        location: session.location,
        meetingUrl: session.meeting_url,
        rsvpStatus: session.rsvp_status,
        clientName: `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client",
        therapistName: therapistProfile.users?.name ?? "Therapist",
      },
    };
  } catch (error) {
    console.error("Error fetching session by token:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

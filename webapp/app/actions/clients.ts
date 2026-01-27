"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendgrid";
import { getClientInvitationEmail, getClientOnboardingCompleteEmail } from "@/lib/email/templates";
import {
  clientInvitationSchema,
  clientOnboardingSchema,
  clientUpdateSchema,
  type ClientInvitationData,
  type ClientOnboardingData,
  type ClientUpdateData,
} from "@/lib/validation/clients";
import crypto from "crypto";

type ActionResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: Record<string, unknown>;
};

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateSlug(email: string): string {
  // Create a URL-safe slug from email prefix + random suffix
  const emailPrefix = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `${emailPrefix}-${randomSuffix}`.slice(0, 100);
}

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
// SEND CLIENT INVITATION
// =====================

export async function sendClientInvitationAction(
  data: ClientInvitationData
): Promise<ActionResponse> {
  const validation = clientInvitationSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { email, firstName, lastName, personalMessage } = validation.data;

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get current user and their therapist profile
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in to invite clients" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("therapist_profiles")
      .select("id, users!inner(name, email)")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    const therapistName = (profile.users as { name?: string })?.name || "Your therapist";
    const therapistEmail = (profile.users as { email?: string })?.email;

    // Check if therapist has active terms
    const { data: activeTerms, error: termsError } = await supabase
      .from("therapist_terms")
      .select("id")
      .eq("therapist_profile_id", profile.id)
      .eq("is_active", true)
      .single();

    if (termsError || !activeTerms) {
      return {
        success: false,
        error: "You must create Terms & Conditions before inviting clients. Go to Settings to add your terms.",
      };
    }

    // Check if client already exists for this therapist
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id, status")
      .eq("therapist_profile_id", profile.id)
      .eq("email", email)
      .single();

    if (existingClient) {
      if (existingClient.status === "active") {
        return { success: false, error: "This client already exists and is active" };
      }
      if (existingClient.status === "invited") {
        return { success: false, error: "An invitation has already been sent to this email" };
      }
      if (existingClient.status === "archived") {
        // Reactivate archived client by sending new invitation
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        // Update client status back to invited
        await adminClient
          .from("clients")
          .update({ status: "invited", archived_at: null })
          .eq("id", existingClient.id);

        // Create new invitation
        await adminClient.from("client_invitations").insert({
          client_id: existingClient.id,
          token,
          expires_at: expiresAt,
          sent_at: new Date().toISOString(),
        });

        // Send email
        const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client-onboard/${token}`;
        const emailContent = getClientInvitationEmail({
          therapistName,
          clientName: firstName || "",
          personalMessage,
          invitationUrl,
        });

        await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        revalidatePath("/dashboard/clients");
        return { success: true, data: { clientId: existingClient.id } };
      }
    }

    // Create new client
    const slug = generateSlug(email);
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        therapist_profile_id: profile.id,
        email,
        slug,
        first_name: firstName || null,
        last_name: lastName || null,
        status: "invited",
      })
      .select()
      .single();

    if (clientError || !newClient) {
      console.error("Failed to create client:", clientError);
      return { success: false, error: "Failed to create client invitation" };
    }

    // Create invitation
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { error: invitationError } = await adminClient.from("client_invitations").insert({
      client_id: newClient.id,
      token,
      expires_at: expiresAt,
      sent_at: new Date().toISOString(),
    });

    if (invitationError) {
      console.error("Failed to create invitation:", invitationError);
      // Clean up the client record
      await adminClient.from("clients").delete().eq("id", newClient.id);
      return { success: false, error: "Failed to create invitation" };
    }

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client-onboard/${token}`;
    const emailContent = getClientInvitationEmail({
      therapistName,
      clientName: firstName || "",
      personalMessage,
      invitationUrl,
    });

    const emailSent = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!emailSent) {
      console.error("Failed to send invitation email");
      // Don't fail the action - the invitation was created, they can resend
    }

    // Link any existing conversations with this email to the new client
    const { data: existingConversation } = await adminClient
      .from("conversations")
      .select("id")
      .eq("member_id", user.id)
      .eq("visitor_email", email.toLowerCase())
      .is("client_id", null)
      .single();

    if (existingConversation) {
      await adminClient
        .from("conversations")
        .update({ client_id: newClient.id })
        .eq("id", existingConversation.id);
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/messages");
    return { success: true, data: { clientId: newClient.id } };
  } catch (error) {
    console.error("Error sending client invitation:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// RESEND CLIENT INVITATION
// =====================

export async function resendClientInvitationAction(
  clientId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get client and verify ownership
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select(`
        *,
        therapist_profiles!inner(user_id, users!inner(name))
      `)
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      return { success: false, error: "Client not found" };
    }

    if (client.status !== "invited") {
      return { success: false, error: "Can only resend invitations for invited clients" };
    }

    const therapistName = (client.therapist_profiles as { users?: { name?: string } })?.users?.name || "Your therapist";

    // Create new invitation token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Insert new invitation (don't delete old ones for audit trail)
    await adminClient.from("client_invitations").insert({
      client_id: clientId,
      token,
      expires_at: expiresAt,
      sent_at: new Date().toISOString(),
    });

    // Send email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client-onboard/${token}`;
    const emailContent = getClientInvitationEmail({
      therapistName,
      clientName: client.first_name || "",
      invitationUrl,
    });

    await sendEmail({
      to: client.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error resending invitation:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET INVITATION BY TOKEN (Public - for onboarding page)
// =====================

export async function getInvitationByTokenAction(
  token: string
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  try {
    const adminClient = createAdminClient();

    // Get invitation with client and therapist info
    const { data: invitation, error } = await adminClient
      .from("client_invitations")
      .select(`
        *,
        clients!inner(
          id,
          email,
          first_name,
          last_name,
          status,
          therapist_profile_id,
          therapist_profiles!inner(
            id,
            users!inner(name, email),
            therapist_terms!inner(id, title, content, is_active)
          )
        )
      `)
      .eq("token", token)
      .is("completed_at", null)
      .single();

    if (error || !invitation) {
      return { success: false, error: "Invalid or expired invitation link" };
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: "This invitation has expired. Please contact your therapist for a new link." };
    }

    // Check client status
    if (invitation.clients.status === "active") {
      return { success: false, error: "You have already completed onboarding" };
    }

    // Get active terms
    const therapistProfile = invitation.clients.therapist_profiles as {
      id: string;
      users: { name: string; email: string };
      therapist_terms: Array<{ id: string; title: string; content: string; is_active: boolean }>;
    };

    const activeTerms = therapistProfile.therapist_terms?.find((t) => t.is_active);
    if (!activeTerms) {
      return { success: false, error: "Terms and conditions not available. Please contact your therapist." };
    }

    // Mark invitation as opened (for tracking)
    if (!invitation.opened_at) {
      await adminClient
        .from("client_invitations")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", invitation.id);
    }

    return {
      success: true,
      data: {
        invitationId: invitation.id,
        clientId: invitation.clients.id,
        email: invitation.clients.email,
        firstName: invitation.clients.first_name,
        lastName: invitation.clients.last_name,
        therapistName: therapistProfile.users.name,
        terms: {
          id: activeTerms.id,
          title: activeTerms.title,
          content: activeTerms.content,
        },
      },
    };
  } catch (error) {
    console.error("Error getting invitation:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// COMPLETE CLIENT ONBOARDING (Public)
// =====================

export async function completeClientOnboardingAction(
  data: ClientOnboardingData,
  ipAddress?: string,
  userAgent?: string
): Promise<ActionResponse> {
  const validation = clientOnboardingSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const validatedData = validation.data;

  try {
    const adminClient = createAdminClient();

    // Get invitation
    const { data: invitation, error: invError } = await adminClient
      .from("client_invitations")
      .select(`
        *,
        clients!inner(
          id,
          therapist_profile_id,
          therapist_profiles!inner(
            id,
            users!inner(name, email),
            therapist_terms!inner(id, is_active)
          )
        )
      `)
      .eq("token", validatedData.token)
      .is("completed_at", null)
      .single();

    if (invError || !invitation) {
      return { success: false, error: "Invalid or expired invitation" };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: "This invitation has expired" };
    }

    const client = invitation.clients;
    const therapistProfile = client.therapist_profiles as {
      id: string;
      users: { name: string; email: string };
      therapist_terms: Array<{ id: string; is_active: boolean }>;
    };

    const activeTerms = therapistProfile.therapist_terms?.find((t) => t.is_active);
    if (!activeTerms) {
      return { success: false, error: "Terms and conditions not found" };
    }

    // Update client with onboarding data
    const { error: updateError } = await adminClient
      .from("clients")
      .update({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        phone: validatedData.phone || null,
        address_line1: validatedData.addressLine1 || null,
        address_line2: validatedData.addressLine2 || null,
        city: validatedData.city || null,
        postal_code: validatedData.postalCode || null,
        country: validatedData.country || "United Kingdom",
        emergency_contact_name: validatedData.emergencyContactName,
        emergency_contact_phone: validatedData.emergencyContactPhone,
        emergency_contact_relationship: validatedData.emergencyContactRelationship || null,
        health_conditions: validatedData.healthConditions || null,
        medications: validatedData.medications || null,
        allergies: validatedData.allergies || null,
        gp_name: validatedData.gpName || null,
        gp_practice: validatedData.gpPractice || null,
        status: "active",
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", client.id);

    if (updateError) {
      console.error("Failed to update client:", updateError);
      return { success: false, error: "Failed to complete onboarding" };
    }

    // Record terms acceptance
    await adminClient.from("client_terms_acceptance").insert({
      client_id: client.id,
      terms_id: activeTerms.id,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });

    // Mark invitation as completed
    await adminClient
      .from("client_invitations")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", invitation.id);

    // Send notification to therapist
    const therapistEmail = therapistProfile.users.email;
    if (therapistEmail) {
      const emailContent = getClientOnboardingCompleteEmail({
        therapistName: therapistProfile.users.name,
        clientName: `${validatedData.firstName} ${validatedData.lastName}`,
        clientEmail: client.email,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients`,
      });

      await sendEmail({
        to: therapistEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET CLIENTS FOR MEMBER
// =====================

export type ClientFilter = {
  status?: "invited" | "active" | "archived" | "all";
  search?: string;
};

export async function getClientsForMemberAction(
  filter?: ClientFilter
): Promise<{ success: boolean; error?: string; data?: { clients: Record<string, unknown>[]; counts: { total: number; invited: number; active: number; archived: number } } }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
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

    // Get counts for all statuses
    const [
      { count: totalCount },
      { count: invitedCount },
      { count: activeCount },
      { count: archivedCount },
    ] = await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("therapist_profile_id", profile.id),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("therapist_profile_id", profile.id).eq("status", "invited"),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("therapist_profile_id", profile.id).eq("status", "active"),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("therapist_profile_id", profile.id).eq("status", "archived"),
    ]);

    // Build query for filtered clients
    let query = supabase
      .from("clients")
      .select(`
        *,
        client_sessions(count),
        conversations(id)
      `)
      .eq("therapist_profile_id", profile.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }

    if (filter?.search) {
      const searchTerm = `%${filter.search}%`;
      query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    const { data: clients, error } = await query;

    if (error) {
      console.error("Failed to get clients:", error);
      return { success: false, error: "Failed to load clients" };
    }

    return {
      success: true,
      data: {
        clients: clients || [],
        counts: {
          total: totalCount || 0,
          invited: invitedCount || 0,
          active: activeCount || 0,
          archived: archivedCount || 0,
        },
      },
    };
  } catch (error) {
    console.error("Error getting clients:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET CLIENT BY SLUG
// =====================

export async function getClientBySlugAction(
  slug: string
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    const { data: client, error } = await supabase
      .from("clients")
      .select(`
        *,
        client_sessions(
          id,
          title,
          session_date,
          start_time,
          end_time,
          status,
          session_format
        ),
        client_notes(
          id,
          note_type,
          content,
          created_at
        ),
        conversations(
          id,
          visitor_token
        ),
        client_terms_acceptance(
          id,
          accepted_at,
          therapist_terms(title, version)
        )
      `)
      .eq("therapist_profile_id", profile.id)
      .eq("slug", slug)
      .single();

    if (error || !client) {
      return { success: false, error: "Client not found" };
    }

    return { success: true, data: client };
  } catch (error) {
    console.error("Error getting client:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// UPDATE CLIENT
// =====================

export async function updateClientAction(
  data: ClientUpdateData
): Promise<ActionResponse> {
  const validation = clientUpdateSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { clientId, ...updateData } = validation.data;

  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Convert camelCase to snake_case for database
    const dbData: Record<string, unknown> = {};
    if (updateData.firstName !== undefined) dbData.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) dbData.last_name = updateData.lastName;
    if (updateData.phone !== undefined) dbData.phone = updateData.phone;
    if (updateData.email !== undefined) dbData.email = updateData.email;
    if (updateData.addressLine1 !== undefined) dbData.address_line1 = updateData.addressLine1;
    if (updateData.addressLine2 !== undefined) dbData.address_line2 = updateData.addressLine2;
    if (updateData.city !== undefined) dbData.city = updateData.city;
    if (updateData.postalCode !== undefined) dbData.postal_code = updateData.postalCode;
    if (updateData.country !== undefined) dbData.country = updateData.country;
    if (updateData.emergencyContactName !== undefined) dbData.emergency_contact_name = updateData.emergencyContactName;
    if (updateData.emergencyContactPhone !== undefined) dbData.emergency_contact_phone = updateData.emergencyContactPhone;
    if (updateData.emergencyContactRelationship !== undefined) dbData.emergency_contact_relationship = updateData.emergencyContactRelationship;
    if (updateData.healthConditions !== undefined) dbData.health_conditions = updateData.healthConditions;
    if (updateData.medications !== undefined) dbData.medications = updateData.medications;
    if (updateData.allergies !== undefined) dbData.allergies = updateData.allergies;
    if (updateData.gpName !== undefined) dbData.gp_name = updateData.gpName;
    if (updateData.gpPractice !== undefined) dbData.gp_practice = updateData.gpPractice;

    const { error } = await supabase
      .from("clients")
      .update(dbData)
      .eq("id", clientId);

    if (error) {
      console.error("Failed to update client:", error);
      return { success: false, error: "Failed to update client" };
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error updating client:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// ARCHIVE CLIENT
// =====================

export async function archiveClientAction(
  clientId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { error } = await supabase
      .from("clients")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (error) {
      console.error("Failed to archive client:", error);
      return { success: false, error: "Failed to archive client" };
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error archiving client:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// RESTORE CLIENT
// =====================

export async function restoreClientAction(
  clientId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { error } = await supabase
      .from("clients")
      .update({
        status: "active",
        archived_at: null,
      })
      .eq("id", clientId);

    if (error) {
      console.error("Failed to restore client:", error);
      return { success: false, error: "Failed to restore client" };
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error restoring client:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// CONVERT VISITOR TO CLIENT
// =====================

export async function convertVisitorToClientAction(
  visitorEmail: string,
  visitorName?: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get therapist profile
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id, users!inner(name)")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Check if client already exists
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id, status")
      .eq("therapist_profile_id", profile.id)
      .eq("email", visitorEmail.toLowerCase())
      .single();

    if (existingClient) {
      return {
        success: false,
        error: existingClient.status === "active"
          ? "This visitor is already a client"
          : "A client record already exists for this email",
      };
    }

    // Parse name into first/last
    const nameParts = (visitorName || "").trim().split(" ");
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(" ") || null;

    // Use the invitation action to create and send invitation
    const result = await sendClientInvitationAction({
      email: visitorEmail.toLowerCase(),
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    if (!result.success) {
      return result;
    }

    // Link existing conversation to new client
    const adminClient = createAdminClient();
    const { data: conversation } = await adminClient
      .from("conversations")
      .select("id")
      .eq("member_id", user.id)
      .eq("visitor_email", visitorEmail.toLowerCase())
      .single();

    if (conversation && result.data?.clientId) {
      await adminClient
        .from("conversations")
        .update({ client_id: result.data.clientId as string })
        .eq("id", conversation.id);
    }

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/bookings");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error converting visitor:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

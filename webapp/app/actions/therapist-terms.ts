"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  therapistTermsSchema,
  therapistTermsUpdateSchema,
  type TherapistTermsData,
  type TherapistTermsUpdateData,
} from "@/lib/validation/clients";

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

function generateVersion(): string {
  const now = new Date();
  return `v${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
}

// =====================
// GET ACTIVE TERMS
// =====================

export async function getActiveTermsAction(): Promise<{
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}> {
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

    const { data: terms, error } = await supabase
      .from("therapist_terms")
      .select("*")
      .eq("therapist_profile_id", profile.id)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows found"
      console.error("Failed to get terms:", error);
      return { success: false, error: "Failed to load terms" };
    }

    return { success: true, data: terms || null };
  } catch (error) {
    console.error("Error getting terms:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET ALL TERMS (including inactive, for history)
// =====================

export async function getAllTermsAction(): Promise<{
  success: boolean;
  error?: string;
  data?: Record<string, unknown>[];
}> {
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

    const { data: terms, error } = await supabase
      .from("therapist_terms")
      .select("*")
      .eq("therapist_profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get terms:", error);
      return { success: false, error: "Failed to load terms" };
    }

    return { success: true, data: terms || [] };
  } catch (error) {
    console.error("Error getting terms:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// CREATE TERMS (or create new version)
// =====================

export async function createTermsAction(
  data: TherapistTermsData
): Promise<ActionResponse> {
  const validation = therapistTermsSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { title, content } = validation.data;

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

    // Deactivate any existing active terms
    await supabase
      .from("therapist_terms")
      .update({ is_active: false })
      .eq("therapist_profile_id", profile.id)
      .eq("is_active", true);

    // Create new terms version
    const version = generateVersion();
    const { data: newTerms, error } = await supabase
      .from("therapist_terms")
      .insert({
        therapist_profile_id: profile.id,
        version,
        title,
        content,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create terms:", error);
      return { success: false, error: "Failed to create terms" };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/clients");
    return { success: true, data: newTerms };
  } catch (error) {
    console.error("Error creating terms:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// UPDATE TERMS (creates new version if content changes)
// =====================

export async function updateTermsAction(
  data: TherapistTermsUpdateData
): Promise<ActionResponse> {
  const validation = therapistTermsUpdateSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { termsId, title, content, isActive } = validation.data;

  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Verify ownership
    const { data: existingTerms, error: fetchError } = await supabase
      .from("therapist_terms")
      .select("*, therapist_profiles!inner(user_id)")
      .eq("id", termsId)
      .single();

    if (fetchError || !existingTerms) {
      return { success: false, error: "Terms not found" };
    }

    // If content is being changed, we need to create a new version
    if (content && content !== existingTerms.content) {
      // Check if any clients have accepted this version
      const { count: acceptanceCount } = await supabase
        .from("client_terms_acceptance")
        .select("id", { count: "exact", head: true })
        .eq("terms_id", termsId);

      if (acceptanceCount && acceptanceCount > 0) {
        // Create new version instead of updating
        return createTermsAction({ title: title || existingTerms.title, content });
      }
    }

    // Update existing terms
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isActive !== undefined) {
      updateData.is_active = isActive;

      // If activating this version, deactivate others
      if (isActive) {
        const { data: profile } = await supabase
          .from("therapist_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          await supabase
            .from("therapist_terms")
            .update({ is_active: false })
            .eq("therapist_profile_id", profile.id)
            .neq("id", termsId);
        }
      }
    }

    const { error: updateError } = await supabase
      .from("therapist_terms")
      .update(updateData)
      .eq("id", termsId);

    if (updateError) {
      console.error("Failed to update terms:", updateError);
      return { success: false, error: "Failed to update terms" };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error updating terms:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// DELETE TERMS (only if no acceptances)
// =====================

export async function deleteTermsAction(termsId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    // Check for acceptances
    const { count: acceptanceCount } = await supabase
      .from("client_terms_acceptance")
      .select("id", { count: "exact", head: true })
      .eq("terms_id", termsId);

    if (acceptanceCount && acceptanceCount > 0) {
      return {
        success: false,
        error: "Cannot delete terms that have been accepted by clients. You can deactivate them instead.",
      };
    }

    const { error } = await supabase
      .from("therapist_terms")
      .delete()
      .eq("id", termsId);

    if (error) {
      console.error("Failed to delete terms:", error);
      return { success: false, error: "Failed to delete terms" };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting terms:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET TERMS ACCEPTANCE STATS
// =====================

export async function getTermsAcceptanceStatsAction(termsId: string): Promise<{
  success: boolean;
  error?: string;
  data?: { acceptanceCount: number; clients: Array<{ name: string; email: string; acceptedAt: string }> };
}> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data: acceptances, error, count } = await supabase
      .from("client_terms_acceptance")
      .select(`
        accepted_at,
        clients!inner(first_name, last_name, email)
      `, { count: "exact" })
      .eq("terms_id", termsId)
      .order("accepted_at", { ascending: false });

    if (error) {
      console.error("Failed to get acceptances:", error);
      return { success: false, error: "Failed to load acceptance data" };
    }

    const clients = (acceptances || []).map((a) => {
      // Supabase returns nested relations as objects (not arrays) when using !inner
      const client = a.clients as unknown as { first_name: string | null; last_name: string | null; email: string };
      return {
        name: `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown",
        email: client.email,
        acceptedAt: a.accepted_at,
      };
    });

    return {
      success: true,
      data: {
        acceptanceCount: count || 0,
        clients,
      },
    };
  } catch (error) {
    console.error("Error getting acceptance stats:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

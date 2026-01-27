"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  clientNoteSchema,
  clientNoteUpdateSchema,
  type ClientNoteData,
  type ClientNoteUpdateData,
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

// =====================
// CREATE NOTE
// =====================

export async function createClientNoteAction(
  data: ClientNoteData
): Promise<ActionResponse> {
  const validation = clientNoteSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { clientId, sessionId, noteType, content, isPrivate } = validation.data;

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

    // Verify client ownership
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("therapist_profile_id", profile.id)
      .single();

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Create note
    const { data: note, error } = await supabase
      .from("client_notes")
      .insert({
        client_id: clientId,
        session_id: sessionId || null,
        therapist_profile_id: profile.id,
        note_type: noteType,
        content,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create note:", error);
      return { success: false, error: "Failed to create note" };
    }

    revalidatePath("/dashboard/clients");
    return { success: true, data: note };
  } catch (error) {
    console.error("Error creating note:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// UPDATE NOTE
// =====================

export async function updateClientNoteAction(
  data: ClientNoteUpdateData
): Promise<ActionResponse> {
  const validation = clientNoteUpdateSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { noteId, content, isPrivate } = validation.data;

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

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (isPrivate !== undefined) updateData.is_private = isPrivate;

    // Update note (RLS will verify ownership)
    const { error } = await supabase
      .from("client_notes")
      .update(updateData)
      .eq("id", noteId)
      .eq("therapist_profile_id", profile.id);

    if (error) {
      console.error("Failed to update note:", error);
      return { success: false, error: "Failed to update note" };
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error updating note:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// DELETE NOTE
// =====================

export async function deleteClientNoteAction(noteId: string): Promise<ActionResponse> {
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

    // Delete note (RLS will verify ownership)
    const { error } = await supabase
      .from("client_notes")
      .delete()
      .eq("id", noteId)
      .eq("therapist_profile_id", profile.id);

    if (error) {
      console.error("Failed to delete note:", error);
      return { success: false, error: "Failed to delete note" };
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================
// GET NOTES FOR CLIENT
// =====================

export async function getNotesForClientAction(
  clientId: string
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

    const { data: notes, error } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", clientId)
      .eq("therapist_profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get notes:", error);
      return { success: false, error: "Failed to load notes" };
    }

    return { success: true, data: notes || [] };
  } catch (error) {
    console.error("Error getting notes:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

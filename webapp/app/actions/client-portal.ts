"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// ============================================================================
// Types
// ============================================================================

interface ActionResponse<T = void> {
  success: boolean
  error?: string
  data?: T
}

interface ClientProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelationship: string | null
}

interface ClientSession {
  id: string
  title: string
  sessionDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: string
  sessionFormat: string | null
  meetingUrl: string | null
  location: string | null
  therapistName: string
  therapistPhotoUrl: string | null
  serviceName: string | null
}

interface ClientTherapist {
  id: string
  name: string
  photoUrl: string | null
  professionalTitle: string | null
  city: string | null
  country: string | null
  relationshipStatus: string
  startedAt: string
}

interface ClientConversation {
  id: string
  therapistName: string
  therapistPhotoUrl: string | null
  lastMessageContent: string
  lastMessageAt: string
  unreadCount: number
}

// ============================================================================
// Authentication Actions
// ============================================================================

export async function requestMagicLinkAction(
  email: string
): Promise<ActionResponse> {
  try {
    const adminClient = createAdminClient()

    // Check if this email has a client account
    // Query from clients table since the FK goes clients.client_account_id → client_accounts.id
    const { data: client } = await adminClient
      .from("clients")
      .select(`
        id,
        email,
        client_account_id,
        client_accounts!inner (
          id,
          user_id
        )
      `)
      .eq("email", email.toLowerCase())
      .not("client_account_id", "is", null)
      .limit(1)
      .single()

    // Only send magic link if client account exists
    // Always return success to prevent account enumeration
    if (client) {
      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/auth/callback`,
          shouldCreateUser: false,
        },
      })

      if (error) {
        console.error("Magic link error:", error)
        // Still return success to prevent enumeration
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Request magic link error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ============================================================================
// Profile Actions
// ============================================================================

export async function getClientProfileAction(): Promise<
  ActionResponse<ClientProfile[]>
> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get all client records for this user
    const { data: clients, error } = await supabase
      .from("clients")
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        address_line1,
        address_line2,
        city,
        postal_code,
        country,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        client_account_id
      `)
      .eq("client_account_id", await getClientAccountIdForUser(supabase, user.id))

    if (error) {
      console.error("Get profile error:", error)
      return { success: false, error: "Failed to load profile" }
    }

    const profiles: ClientProfile[] = (clients || []).map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.first_name,
      lastName: c.last_name,
      phone: c.phone,
      addressLine1: c.address_line1,
      addressLine2: c.address_line2,
      city: c.city,
      postalCode: c.postal_code,
      country: c.country,
      emergencyContactName: c.emergency_contact_name,
      emergencyContactPhone: c.emergency_contact_phone,
      emergencyContactRelationship: c.emergency_contact_relationship,
    }))

    return { success: true, data: profiles }
  } catch (error) {
    console.error("Get profile error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateClientProfileAction(
  clientId: string,
  data: {
    phone?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    postalCode?: string
    country?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelationship?: string
  }
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update client record (RLS will enforce ownership)
    const { error } = await supabase
      .from("clients")
      .update({
        phone: data.phone,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        postal_code: data.postalCode,
        country: data.country,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        emergency_contact_relationship: data.emergencyContactRelationship,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)

    if (error) {
      console.error("Update profile error:", error)
      return { success: false, error: "Failed to update profile" }
    }

    revalidatePath("/portal/profile")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ============================================================================
// Sessions Actions
// ============================================================================

export async function getClientSessionsAction(
  filter: "upcoming" | "past" | "all" = "all"
): Promise<ActionResponse<ClientSession[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const today = new Date().toISOString().split("T")[0]

    let query = supabase
      .from("client_sessions")
      .select(`
        id,
        title,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        status,
        session_format,
        meeting_url,
        location,
        therapist_profiles!inner (
          users!inner (
            name,
            photo_url
          )
        ),
        therapist_services (
          name
        )
      `)

    if (filter === "upcoming") {
      query = query.gte("session_date", today).in("status", ["scheduled"])
    } else if (filter === "past") {
      query = query.or(`session_date.lt.${today},status.eq.completed,status.eq.cancelled`)
    }

    query = query.order("session_date", { ascending: filter === "upcoming" })

    const { data: sessions, error } = await query

    if (error) {
      console.error("Get sessions error:", error)
      return { success: false, error: "Failed to load sessions" }
    }

    const formattedSessions: ClientSession[] = (sessions || []).map((s) => {
      const therapistProfile = s.therapist_profiles as unknown as {
        users: { name: string; photo_url: string | null }
      }
      const service = s.therapist_services as unknown as { name: string } | null

      return {
        id: s.id,
        title: s.title,
        sessionDate: s.session_date,
        startTime: s.start_time,
        endTime: s.end_time,
        durationMinutes: s.duration_minutes,
        status: s.status,
        sessionFormat: s.session_format,
        meetingUrl: s.meeting_url,
        location: s.location,
        therapistName: therapistProfile?.users?.name || "Unknown",
        therapistPhotoUrl: therapistProfile?.users?.photo_url || null,
        serviceName: service?.name || null,
      }
    })

    return { success: true, data: formattedSessions }
  } catch (error) {
    console.error("Get sessions error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ============================================================================
// Therapists Actions
// ============================================================================

export async function getClientTherapistsAction(): Promise<
  ActionResponse<ClientTherapist[]>
> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: relationships, error } = await supabase
      .from("client_therapist_relationships")
      .select(`
        id,
        status,
        started_at,
        therapist_profiles!inner (
          id,
          professional_title,
          city,
          country,
          users!inner (
            name,
            photo_url
          )
        )
      `)

    if (error) {
      console.error("Get therapists error:", error)
      return { success: false, error: "Failed to load therapists" }
    }

    const therapists: ClientTherapist[] = (relationships || []).map((r) => {
      const profile = r.therapist_profiles as unknown as {
        id: string
        professional_title: string | null
        city: string | null
        country: string | null
        users: { name: string; photo_url: string | null }
      }

      return {
        id: profile?.id || "",
        name: profile?.users?.name || "Unknown",
        photoUrl: profile?.users?.photo_url || null,
        professionalTitle: profile?.professional_title || null,
        city: profile?.city || null,
        country: profile?.country || null,
        relationshipStatus: r.status || "active",
        startedAt: r.started_at || "",
      }
    })

    return { success: true, data: therapists }
  } catch (error) {
    console.error("Get therapists error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ============================================================================
// Messages Actions
// ============================================================================

export async function getClientConversationsAction(): Promise<
  ActionResponse<ClientConversation[]>
> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        updated_at,
        users!conversations_public_users_fkey (
          name,
          photo_url
        ),
        messages (
          content,
          created_at,
          is_read,
          sender_type
        )
      `)
      .eq("is_verified", true)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Get conversations error:", error)
      return { success: false, error: "Failed to load messages" }
    }

    const formattedConversations: ClientConversation[] = (conversations || []).map(
      (c) => {
        const therapist = c.users as unknown as { name: string; photo_url: string | null }
        const messages = c.messages as unknown as Array<{
          content: string
          created_at: string
          is_read: boolean
          sender_type: string
        }>

        // Sort messages by date descending
        const sortedMessages = [...(messages || [])].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        const lastMessage = sortedMessages[0]
        const unreadCount = (messages || []).filter(
          (m) => !m.is_read && m.sender_type === "member"
        ).length

        return {
          id: c.id,
          therapistName: therapist?.name || "Unknown",
          therapistPhotoUrl: therapist?.photo_url || null,
          lastMessageContent: lastMessage?.content || "",
          lastMessageAt: lastMessage?.created_at || c.updated_at || "",
          unreadCount,
        }
      }
    )

    return { success: true, data: formattedConversations }
  } catch (error) {
    console.error("Get conversations error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getClientConversationAction(
  conversationId: string
): Promise<
  ActionResponse<{
    id: string
    therapistName: string
    messages: Array<{
      id: string
      content: string
      senderType: string
      createdAt: string
      isRead: boolean
    }>
  }>
> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .select(`
        id,
        users!conversations_public_users_fkey (
          name
        ),
        messages (
          id,
          content,
          sender_type,
          created_at,
          is_read
        )
      `)
      .eq("id", conversationId)
      .single()

    if (error || !conversation) {
      return { success: false, error: "Conversation not found" }
    }

    const therapist = conversation.users as unknown as { name: string }
    const messages = conversation.messages as unknown as Array<{
      id: string
      content: string
      sender_type: string
      created_at: string
      is_read: boolean
    }>

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("sender_type", "member")
      .eq("is_read", false)

    return {
      success: true,
      data: {
        id: conversation.id,
        therapistName: therapist?.name || "Unknown",
        messages: (messages || [])
          .map((m) => ({
            id: m.id,
            content: m.content,
            senderType: m.sender_type,
            createdAt: m.created_at,
            isRead: m.is_read,
          }))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
      },
    }
  } catch (error) {
    console.error("Get conversation error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function clientSendMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Insert message (RLS will enforce ownership)
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content,
      sender_type: "client",
      is_read: false,
    })

    if (error) {
      console.error("Send message error:", error)
      return { success: false, error: "Failed to send message" }
    }

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    revalidatePath(`/portal/messages/${conversationId}`)
    return { success: true }
  } catch (error) {
    console.error("Send message error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getClientAccountIdForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("client_accounts")
    .select("id")
    .eq("user_id", userId)
    .single()

  return data?.id || null
}

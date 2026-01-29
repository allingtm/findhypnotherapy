"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  getVerificationEmail,
  getNewMessageEmail,
  getReplyEmail,
  getVisitorReplyEmail,
} from "@/lib/email/templates";
import {
  contactFormSchema,
  memberReplySchema,
  visitorReplySchema,
  blockVisitorSchema,
  reportConversationSchema,
} from "@/lib/validation/messages";
import crypto from "crypto";

type ActionResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  preVerified?: boolean;
};

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
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

// Submit contact form - creates conversation and sends verification email
export async function submitContactFormAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    memberProfileId: formData.get("memberProfileId"),
    visitorName: formData.get("visitorName"),
    visitorEmail: formData.get("visitorEmail"),
    message: formData.get("message"),
    honeypot: formData.get("website") || "", // honeypot field
  };

  const validation = contactFormSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { memberProfileId, visitorName, visitorEmail, message } = validation.data;

  try {
    const adminClient = createAdminClient();

    // Get the member's user_id and name from therapist_profiles
    const { data: profile, error: profileError } = await adminClient
      .from("therapist_profiles")
      .select("user_id, users!inner(id, email, name)")
      .eq("id", memberProfileId)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "Therapist not found",
      };
    }

    const memberId = profile.user_id;
    const memberName = (profile.users as { name?: string })?.name || "the therapist";
    const memberEmail = (profile.users as { email?: string })?.email;

    // Check if visitor is blocked by this member
    const { data: blocked } = await adminClient
      .from("blocked_visitors")
      .select("id")
      .eq("member_id", memberId)
      .eq("visitor_email", visitorEmail)
      .single();

    if (blocked) {
      // Don't reveal they're blocked - just show generic success
      return { success: true };
    }

    // Check rate limiting: max 5 messages per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await adminClient
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("visitor_email", visitorEmail)
      .gte("created_at", oneHourAgo);

    if (count && count >= 5) {
      return {
        success: false,
        error: "Too many messages sent. Please try again later.",
      };
    }

    // Check if email is already verified (returning visitor)
    const { data: verifiedEmail } = await adminClient
      .from("verified_visitor_emails")
      .select("id")
      .eq("email", visitorEmail.toLowerCase())
      .single();

    const isPreVerified = !!verifiedEmail;

    // Generate tokens
    const visitorToken = generateToken();
    const verificationToken = isPreVerified ? null : generateToken();

    // Create conversation
    const { data: conversation, error: conversationError } = await adminClient
      .from("conversations")
      .insert({
        member_id: memberId,
        visitor_email: visitorEmail,
        visitor_name: visitorName,
        visitor_token: visitorToken,
        is_verified: isPreVerified, // Auto-verify if email is already trusted
      })
      .select()
      .single();

    if (conversationError || !conversation) {
      console.error("Failed to create conversation:", conversationError);
      return {
        success: false,
        error: "Failed to send message. Please try again.",
      };
    }

    // Create the initial message
    const { error: messageError } = await adminClient.from("messages").insert({
      conversation_id: conversation.id,
      sender_type: "visitor",
      content: message,
    });

    if (messageError) {
      console.error("Failed to create message:", messageError);
      // Clean up conversation
      await adminClient.from("conversations").delete().eq("id", conversation.id);
      return {
        success: false,
        error: "Failed to send message. Please try again.",
      };
    }

    if (isPreVerified) {
      // Email already verified - notify therapist immediately
      if (memberEmail) {
        const emailContent = getNewMessageEmail({
          recipientName: memberName,
          visitorName,
          visitorEmail,
          messagePreview: message.slice(0, 100),
          conversationId: conversation.id,
        });

        const emailSent = await sendEmail({
          to: memberEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        if (!emailSent.success) {
          console.warn("Failed to send new message notification to member:", memberEmail);
        }
      }

      return { success: true, preVerified: true };
    } else {
      // Create email verification record
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      const { error: verificationError } = await adminClient
        .from("email_verifications")
        .insert({
          conversation_id: conversation.id,
          token: verificationToken,
          expires_at: expiresAt,
        });

      if (verificationError) {
        console.error("Failed to create verification:", verificationError);
      }

      // Send verification email
      const emailContent = getVerificationEmail({
        recipientName: visitorName,
        verificationToken: verificationToken!,
        therapistName: memberName,
        messagePreview: message.slice(0, 100),
      });

      const emailSent = await sendEmail({
        to: visitorEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      if (!emailSent.success) {
        console.warn("Failed to send verification email to visitor:", visitorEmail);
      }

      return { success: true };
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// Member replies to a conversation
export async function memberReplyAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    conversationId: formData.get("conversationId"),
    message: formData.get("message"),
  };

  const validation = memberReplySchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { conversationId, message } = validation.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to reply",
      };
    }

    // Get the conversation (RLS will ensure they own it)
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, visitor_email, visitor_name, visitor_token, is_blocked")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    if (conversation.is_blocked) {
      return {
        success: false,
        error: "This conversation has been blocked",
      };
    }

    // Insert the reply and get the message ID for tracking
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_type: "member",
        content: message,
      })
      .select("id")
      .single();

    if (messageError || !newMessage) {
      console.error("Failed to insert message:", messageError);
      return {
        success: false,
        error: "Failed to send reply. Please try again.",
      };
    }

    // Update conversation timestamp
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
    if (updateError) {
      console.error("Failed to update conversation timestamp:", updateError);
    }

    // Get member's name for the email
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    const memberName = userData?.name || "A therapist";

    // Send email to visitor with message ID for tracking
    const emailContent = getReplyEmail({
      recipientName: conversation.visitor_name,
      memberName,
      replyContent: message,
      conversationToken: conversation.visitor_token,
    });

    const emailSent = await sendEmail({
      to: conversation.visitor_email,
      subject: emailContent.subject,
      html: emailContent.html,
      messageId: newMessage.id, // For webhook tracking
    });

    // Store SendGrid message ID for delivery tracking
    if (emailSent.success && emailSent.sgMessageId) {
      await supabase
        .from("messages")
        .update({ sg_message_id: emailSent.sgMessageId })
        .eq("id", newMessage.id);
    }

    if (!emailSent.success) {
      console.warn("Failed to send reply notification to visitor:", conversation.visitor_email);
    }

    // Revalidate the conversation page to show the new message
    revalidatePath(`/dashboard/messages/${conversationId}`);

    return { success: true };
  } catch (error) {
    console.error("Member reply error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// Visitor replies via token
export async function visitorReplyAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    conversationToken: formData.get("conversationToken"),
    message: formData.get("message"),
  };

  const validation = visitorReplySchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { conversationToken, message } = validation.data;

  try {
    const adminClient = createAdminClient();

    // Get conversation by visitor token
    const { data: conversation, error: conversationError } = await adminClient
      .from("conversations")
      .select(
        `
        id,
        member_id,
        visitor_name,
        visitor_email,
        is_blocked,
        is_verified,
        users!inner(id, email, name)
      `
      )
      .eq("visitor_token", conversationToken)
      .single();

    if (conversationError || !conversation) {
      return {
        success: false,
        error: "Conversation not found or has expired",
      };
    }

    if (conversation.is_blocked) {
      return {
        success: false,
        error: "This conversation is no longer available",
      };
    }

    if (!conversation.is_verified) {
      return {
        success: false,
        error: "Please verify your email before sending messages",
      };
    }

    // Insert the reply
    const { error: messageError } = await adminClient.from("messages").insert({
      conversation_id: conversation.id,
      sender_type: "visitor",
      content: message,
    });

    if (messageError) {
      console.error("Failed to insert visitor message:", messageError);
      return {
        success: false,
        error: "Failed to send reply. Please try again.",
      };
    }

    // Update conversation timestamp
    const { error: updateError } = await adminClient
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);
    if (updateError) {
      console.error("Failed to update conversation timestamp:", updateError);
    }

    // Send email to member
    const memberEmail = (conversation.users as { email?: string })?.email;
    const memberName = (conversation.users as { name?: string })?.name || "there";

    if (memberEmail) {
      const emailContent = getVisitorReplyEmail({
        recipientName: memberName,
        visitorName: conversation.visitor_name,
        replyContent: message,
        conversationId: conversation.id,
      });

      const emailSent = await sendEmail({
        to: memberEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      if (!emailSent.success) {
        console.warn("Failed to send reply notification to member:", memberEmail);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Visitor reply error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// Block a visitor
export async function blockVisitorAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    conversationId: formData.get("conversationId"),
  };

  const validation = blockVisitorSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { conversationId } = validation.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // Get conversation to get visitor email
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, visitor_email")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    // Add to blocked visitors
    await supabase.from("blocked_visitors").upsert(
      {
        member_id: user.id,
        visitor_email: conversation.visitor_email,
      },
      { onConflict: "member_id,visitor_email" }
    );

    // Mark conversation as blocked
    await supabase
      .from("conversations")
      .update({ is_blocked: true })
      .eq("id", conversationId);

    return { success: true };
  } catch (error) {
    console.error("Block visitor error:", error);
    return {
      success: false,
      error: "Failed to block visitor. Please try again.",
    };
  }
}

// Report a conversation
export async function reportConversationAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    conversationId: formData.get("conversationId"),
    reason: formData.get("reason") || "",
  };

  const validation = reportConversationSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: extractFieldErrors(validation.error.issues),
    };
  }

  const { conversationId } = validation.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // Mark conversation as reported
    const { error } = await supabase
      .from("conversations")
      .update({ is_reported: true })
      .eq("id", conversationId);

    if (error) {
      return {
        success: false,
        error: "Failed to report conversation. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Report conversation error:", error);
    return {
      success: false,
      error: "Failed to report conversation. Please try again.",
    };
  }
}

// Get conversations for the current member (for dashboard)
export async function getConversationsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated", conversations: [] };
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        visitor_name,
        visitor_email,
        is_verified,
        is_blocked,
        is_reported,
        created_at,
        updated_at,
        messages (
          id,
          content,
          sender_type,
          is_read,
          created_at,
          email_events (
            event_type
          )
        )
      `
      )
      .eq("is_blocked", false)
      .eq("is_verified", true)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch conversations:", error);
      return { success: false, error: "Failed to load messages", conversations: [] };
    }

    // Calculate stats for each conversation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const conversationsWithMeta = conversations?.map((conv) => {
      const messages = conv.messages || [];
      const unreadCount = messages.filter(
        (m) => m.sender_type === "visitor" && !m.is_read
      ).length;
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastMessage = sortedMessages[0];

      // Compute stats
      const totalMessages = messages.length;
      const messagesLast30Days = messages.filter(
        (m) => new Date(m.created_at) >= thirtyDaysAgo
      ).length;
      const needsAttention = lastMessage?.sender_type === "visitor";

      // Compute delivery status for last message if it's from a member
      const lastMessageDeliveryStatus =
        lastMessage?.sender_type === "member"
          ? computeDeliveryStatus(
              (lastMessage as { email_events?: Array<{ event_type: string }> }).email_events
            )
          : undefined;

      return {
        ...conv,
        unreadCount,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderType: lastMessage.sender_type,
              createdAt: lastMessage.created_at,
            }
          : null,
        lastMessageDeliveryStatus,
        totalMessages,
        messagesLast30Days,
        needsAttention,
      };
    });

    return { success: true, conversations: conversationsWithMeta || [] };
  } catch (error) {
    console.error("Get conversations error:", error);
    return { success: false, error: "Failed to load messages", conversations: [] };
  }
}

// Get a single conversation with all messages
export async function getConversationAction(conversationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated", conversation: null };
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        visitor_name,
        visitor_email,
        is_verified,
        is_blocked,
        is_reported,
        created_at,
        updated_at,
        messages (
          id,
          content,
          sender_type,
          is_read,
          sg_message_id,
          created_at,
          email_events (
            event_type,
            timestamp
          )
        )
      `
      )
      .eq("id", conversationId)
      .single();

    if (error || !conversation) {
      return { success: false, error: "Conversation not found", conversation: null };
    }

    // Mark all visitor messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("sender_type", "visitor");

    // Sort messages by created_at ascending and compute delivery status
    const sortedMessages = (conversation.messages || [])
      .sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map((msg) => {
        // Compute delivery status from email events
        const events = (msg as { email_events?: Array<{ event_type: string }> }).email_events || [];
        let deliveryStatus: "sent" | "delivered" | "opened" | "failed" = "sent";

        if (events.some((e) => e.event_type === "open")) {
          deliveryStatus = "opened";
        } else if (events.some((e) => e.event_type === "delivered")) {
          deliveryStatus = "delivered";
        } else if (events.some((e) => e.event_type === "bounce" || e.event_type === "dropped")) {
          deliveryStatus = "failed";
        }

        return {
          ...msg,
          deliveryStatus,
        };
      });

    return {
      success: true,
      conversation: {
        ...conversation,
        messages: sortedMessages,
      },
    };
  } catch (error) {
    console.error("Get conversation error:", error);
    return { success: false, error: "Failed to load conversation", conversation: null };
  }
}

// Find or create a conversation from a booking (for member to contact a visitor)
export async function getOrCreateConversationFromBooking(
  visitorEmail: string,
  visitorName: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Security: Verify this therapist has a booking with this visitor email
    const { data: therapistProfile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!therapistProfile) {
      return { success: false, error: "Therapist profile not found" };
    }

    const { data: booking } = await adminClient
      .from("bookings")
      .select("id")
      .eq("therapist_profile_id", therapistProfile.id)
      .eq("visitor_email", visitorEmail)
      .limit(1)
      .single();

    if (!booking) {
      return { success: false, error: "No booking found with this visitor" };
    }

    // Check if a conversation already exists with this visitor
    const { data: existingConversation } = await adminClient
      .from("conversations")
      .select("id")
      .eq("member_id", user.id)
      .eq("visitor_email", visitorEmail)
      .eq("is_blocked", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (existingConversation) {
      return { success: true, conversationId: existingConversation.id };
    }

    // Create a new conversation using admin client to bypass RLS
    const visitorToken = generateToken();
    const { data: newConversation, error: createError } = await adminClient
      .from("conversations")
      .insert({
        member_id: user.id,
        visitor_email: visitorEmail,
        visitor_name: visitorName,
        visitor_token: visitorToken,
        is_verified: true, // Mark as verified since it's from a booking
      })
      .select("id")
      .single();

    if (createError || !newConversation) {
      console.error("Failed to create conversation:", createError);
      return { success: false, error: "Failed to create conversation" };
    }

    return { success: true, conversationId: newConversation.id };
  } catch (error) {
    console.error("Get or create conversation error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Helper to compute delivery status from email events
function computeDeliveryStatus(
  events: Array<{ event_type: string }> | undefined
): "sent" | "delivered" | "opened" | "failed" {
  if (!events || events.length === 0) return "sent";
  if (events.some((e) => e.event_type === "open")) return "opened";
  if (events.some((e) => e.event_type === "delivered")) return "delivered";
  if (events.some((e) => e.event_type === "bounce" || e.event_type === "dropped")) return "failed";
  return "sent";
}

// Get or create conversation for a client (for client detail page)
export async function getOrCreateClientConversationAction(clientId: string): Promise<{
  success: boolean;
  conversation?: {
    id: string;
    visitor_name: string;
    visitor_email: string;
    is_blocked: boolean;
    messages: Array<{
      id: string;
      content: string;
      sender_type: string;
      is_read: boolean;
      created_at: string;
      deliveryStatus?: "sent" | "delivered" | "opened" | "failed";
    }>;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get therapist profile
    const { data: therapistProfile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!therapistProfile) {
      return { success: false, error: "Therapist profile not found" };
    }

    // Verify client belongs to this therapist
    const { data: client, error: clientError } = await adminClient
      .from("clients")
      .select("id, email, first_name, last_name")
      .eq("id", clientId)
      .eq("therapist_profile_id", therapistProfile.id)
      .single();

    if (clientError || !client) {
      return { success: false, error: "Client not found" };
    }

    if (!client.email) {
      return { success: false, error: "Client has no email address" };
    }

    const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";

    // Check for existing conversation linked to this client
    const { data: existingConversation } = await adminClient
      .from("conversations")
      .select(`
        id,
        visitor_name,
        visitor_email,
        is_blocked,
        messages (
          id,
          content,
          sender_type,
          is_read,
          created_at,
          email_events (
            event_type
          )
        )
      `)
      .eq("member_id", user.id)
      .eq("client_id", clientId)
      .eq("is_blocked", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (existingConversation) {
      // Mark visitor messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", existingConversation.id)
        .eq("sender_type", "visitor");

      // Sort messages by created_at ascending and add delivery status
      const sortedMessages = (existingConversation.messages || [])
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((msg) => ({
          ...msg,
          deliveryStatus: computeDeliveryStatus(
            (msg as { email_events?: Array<{ event_type: string }> }).email_events
          ),
        }));

      return {
        success: true,
        conversation: {
          ...existingConversation,
          messages: sortedMessages,
        },
      };
    }

    // No existing conversation - check if there's an unlinked conversation with same email
    const { data: emailConversation } = await adminClient
      .from("conversations")
      .select(`
        id,
        visitor_name,
        visitor_email,
        is_blocked,
        messages (
          id,
          content,
          sender_type,
          is_read,
          created_at,
          email_events (
            event_type
          )
        )
      `)
      .eq("member_id", user.id)
      .eq("visitor_email", client.email)
      .is("client_id", null)
      .eq("is_blocked", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (emailConversation) {
      // Link existing conversation to this client
      await adminClient
        .from("conversations")
        .update({ client_id: clientId })
        .eq("id", emailConversation.id);

      // Mark visitor messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", emailConversation.id)
        .eq("sender_type", "visitor");

      // Sort messages by created_at ascending and add delivery status
      const sortedMessages = (emailConversation.messages || [])
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((msg) => ({
          ...msg,
          deliveryStatus: computeDeliveryStatus(
            (msg as { email_events?: Array<{ event_type: string }> }).email_events
          ),
        }));

      return {
        success: true,
        conversation: {
          ...emailConversation,
          messages: sortedMessages,
        },
      };
    }

    // Create new conversation for this client
    const visitorToken = generateToken();
    const { data: newConversation, error: createError } = await adminClient
      .from("conversations")
      .insert({
        member_id: user.id,
        visitor_email: client.email,
        visitor_name: clientName,
        visitor_token: visitorToken,
        is_verified: true, // Clients are pre-verified
        client_id: clientId,
      })
      .select(`
        id,
        visitor_name,
        visitor_email,
        is_blocked
      `)
      .single();

    if (createError || !newConversation) {
      console.error("Failed to create conversation:", createError);
      return { success: false, error: "Failed to create conversation" };
    }

    return {
      success: true,
      conversation: {
        ...newConversation,
        messages: [],
      },
    };
  } catch (error) {
    console.error("Get or create client conversation error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get conversation by visitor token (for visitor page)
export async function getConversationByTokenAction(token: string) {
  try {
    const adminClient = createAdminClient();

    const { data: conversation, error } = await adminClient
      .from("conversations")
      .select(
        `
        id,
        visitor_name,
        visitor_email,
        visitor_token,
        is_verified,
        is_blocked,
        created_at,
        updated_at,
        users!inner(name),
        messages (
          id,
          content,
          sender_type,
          created_at
        )
      `
      )
      .eq("visitor_token", token)
      .single();

    if (error || !conversation) {
      return { success: false, error: "Conversation not found", conversation: null };
    }

    if (conversation.is_blocked) {
      return {
        success: false,
        error: "This conversation is no longer available",
        conversation: null,
      };
    }

    // Sort messages by created_at ascending
    const sortedMessages = (conversation.messages || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      success: true,
      conversation: {
        id: conversation.id,
        visitorName: conversation.visitor_name,
        visitorEmail: conversation.visitor_email,
        memberName: (conversation.users as { name?: string })?.name || "Therapist",
        isVerified: conversation.is_verified,
        messages: sortedMessages,
        createdAt: conversation.created_at,
      },
    };
  } catch (error) {
    console.error("Get conversation by token error:", error);
    return { success: false, error: "Failed to load conversation", conversation: null };
  }
}

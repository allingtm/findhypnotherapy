import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendgrid";
import { getNewMessageEmail } from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verification-error?reason=missing-token", request.url)
    );
  }

  try {
    const adminClient = createAdminClient();

    // Find the verification record
    const { data: verification, error: verificationError } = await adminClient
      .from("email_verifications")
      .select(
        `
        id,
        conversation_id,
        verified_at,
        expires_at,
        conversations!inner (
          id,
          member_id,
          visitor_name,
          visitor_email,
          visitor_token,
          is_verified,
          users!inner (
            id,
            email,
            name
          ),
          messages (
            content,
            created_at
          )
        )
      `
      )
      .eq("token", token)
      .single();

    if (verificationError || !verification) {
      return NextResponse.redirect(
        new URL("/verification-error?reason=invalid-token", request.url)
      );
    }

    // Check if already verified
    if (verification.verified_at) {
      // Already verified - redirect to conversation
      const conversationData = verification.conversations as unknown as {
        visitor_token: string;
      };
      return NextResponse.redirect(
        new URL(`/conversation/${conversationData.visitor_token}`, request.url)
      );
    }

    // Check if token has expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.redirect(
        new URL("/verification-error?reason=expired", request.url)
      );
    }

    // Mark verification as complete
    await adminClient
      .from("email_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id);

    // Mark conversation as verified
    await adminClient
      .from("conversations")
      .update({ is_verified: true })
      .eq("id", verification.conversation_id);

    // Get conversation details for notification
    const conversation = verification.conversations as unknown as {
      id: string;
      visitor_name: string;
      visitor_email: string;
      visitor_token: string;
      users: { email: string; name: string };
      messages: { content: string; created_at: string }[];
    };

    // Add email to verified_visitor_emails (for future bookings/messages)
    await adminClient
      .from("verified_visitor_emails")
      .upsert(
        {
          email: conversation.visitor_email.toLowerCase(),
          verified_via: "message",
        },
        { onConflict: "email", ignoreDuplicates: true }
      );

    const memberEmail = conversation.users?.email;
    const memberName = conversation.users?.name || "there";

    // Get the first message content
    const firstMessage = conversation.messages?.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];

    // Send notification email to member
    if (memberEmail && firstMessage) {
      const emailContent = getNewMessageEmail({
        recipientName: memberName,
        visitorName: conversation.visitor_name,
        visitorEmail: conversation.visitor_email || "",
        messagePreview: firstMessage.content.slice(0, 100),
        conversationId: conversation.id,
      });

      await sendEmail({
        to: memberEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    // Redirect to success page with conversation token
    return NextResponse.redirect(
      new URL(
        `/verification-success?token=${conversation.visitor_token}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verification-error?reason=server-error", request.url)
    );
  }
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// SendGrid Event Webhook types
interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string; // 'delivered', 'open', 'bounce', 'dropped', 'deferred', etc.
  sg_message_id?: string;
  message_id?: string; // Our custom arg
  // Additional fields for specific events
  reason?: string;
  status?: string;
  response?: string;
  attempt?: string;
  category?: string[];
  url?: string; // For click events
  useragent?: string;
  ip?: string;
}

export async function POST(request: Request) {
  try {
    const events: SendGridEvent[] = await request.json();

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Process each event
    const results = await Promise.allSettled(
      events.map(async (event) => {
        // Only process relevant events
        const relevantEvents = ["delivered", "open", "bounce", "dropped", "deferred"];
        if (!relevantEvents.includes(event.event)) {
          return { skipped: true, event: event.event };
        }

        // Try to find the message by our custom message_id arg
        let messageId: string | null = null;
        let bookingId: string | null = null;

        if (event.message_id) {
          // Custom arg was included
          messageId = event.message_id;
        } else if (event.sg_message_id) {
          // Look up by SendGrid message ID in messages table
          const { data: message } = await adminClient
            .from("messages")
            .select("id")
            .eq("sg_message_id", event.sg_message_id)
            .single();

          if (message) {
            messageId = message.id;
          } else {
            // Check bookings table for verification/notification/confirmation emails
            const { data: booking } = await adminClient
              .from("bookings")
              .select("id")
              .or(
                `verification_email_sg_id.eq.${event.sg_message_id},notification_email_sg_id.eq.${event.sg_message_id},confirmation_email_sg_id.eq.${event.sg_message_id}`
              )
              .single();

            if (booking) {
              bookingId = booking.id;
            }
          }
        }

        // Insert the event
        const { error } = await adminClient.from("email_events").insert({
          message_id: messageId,
          booking_id: bookingId,
          sg_message_id: event.sg_message_id || null,
          event_type: event.event,
          email: event.email,
          timestamp: new Date(event.timestamp * 1000).toISOString(),
          raw_payload: event as unknown as Record<string, unknown>,
        });

        if (error) {
          console.error("Failed to insert email event:", error);
          throw error;
        }

        return { success: true, event: event.event, email: event.email };
      })
    );

    const processed = results.filter(
      (r) => r.status === "fulfilled" && (r.value as { success?: boolean }).success
    ).length;
    const skipped = results.filter(
      (r) => r.status === "fulfilled" && (r.value as { skipped?: boolean }).skipped
    ).length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      processed,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("SendGrid webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// SendGrid may send a GET request to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

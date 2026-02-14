import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const ALLOWED_EVENT_TYPES = [
  "profile_view",
  "search_impression",
  "booking_page_view",
  "contact_form_view",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, therapist_profile_id, metadata } = body;

    // Validate required fields
    if (!event_type || !therapist_profile_id) {
      return new NextResponse(null, { status: 400 });
    }

    // Validate event type
    if (!ALLOWED_EVENT_TYPES.includes(event_type)) {
      return new NextResponse(null, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(therapist_profile_id)) {
      return new NextResponse(null, { status: 400 });
    }

    // Create anonymous visitor hash from IP + User-Agent
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const visitor_hash = crypto
      .createHash("sha256")
      .update(`${ip}:${userAgent}`)
      .digest("hex")
      .slice(0, 16); // Truncate for storage efficiency

    const referrer = request.headers.get("referer") || null;

    const supabase = createAdminClient();

    await supabase.from("profile_events").insert({
      therapist_profile_id,
      event_type,
      visitor_hash,
      referrer,
      metadata: metadata || {},
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

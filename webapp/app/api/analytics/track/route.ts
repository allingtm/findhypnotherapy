import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const ALLOWED_EVENT_TYPES = [
  "profile_view",
  "search_impression",
  "booking_page_view",
  "contact_form_view",
];

// Max metadata JSON size in bytes (2KB)
const MAX_METADATA_SIZE = 2048;

// Rate limit: 60 events per IP per minute
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!rateLimit("analytics-track", ip, RATE_LIMIT, RATE_WINDOW_MS)) {
      return new NextResponse(null, { status: 429 });
    }

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

    // Validate metadata size
    const sanitizedMetadata = metadata && typeof metadata === "object" ? metadata : {};
    const metadataJson = JSON.stringify(sanitizedMetadata);
    if (metadataJson.length > MAX_METADATA_SIZE) {
      return new NextResponse(null, { status: 400 });
    }

    // Create anonymous visitor hash from IP + User-Agent
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
      metadata: sanitizedMetadata,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

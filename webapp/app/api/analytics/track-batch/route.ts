import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const MAX_BATCH_SIZE = 50;

// Rate limit: 20 batch requests per IP per minute
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

interface ImpressionEvent {
  therapist_profile_id: string;
  position?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!rateLimit("analytics-track-batch", ip, RATE_LIMIT, RATE_WINDOW_MS)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await request.json();
    const { events } = body as { events: ImpressionEvent[] };

    if (!Array.isArray(events) || events.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    // Limit batch size
    const batch = events.slice(0, MAX_BATCH_SIZE);

    // Validate all entries
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const event of batch) {
      if (
        !event.therapist_profile_id ||
        !uuidRegex.test(event.therapist_profile_id)
      ) {
        return new NextResponse(null, { status: 400 });
      }
    }

    // Create anonymous visitor hash
    const userAgent = request.headers.get("user-agent") || "unknown";
    const visitor_hash = crypto
      .createHash("sha256")
      .update(`${ip}:${userAgent}`)
      .digest("hex")
      .slice(0, 16);

    const referrer = request.headers.get("referer") || null;

    const supabase = createAdminClient();

    const rows = batch.map((event) => ({
      therapist_profile_id: event.therapist_profile_id,
      event_type: "search_impression" as const,
      visitor_hash,
      referrer,
      metadata: event.position !== undefined ? { position: event.position } : {},
    }));

    await supabase.from("profile_events").insert(rows);

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const MAX_BATCH_SIZE = 50;

interface ImpressionEvent {
  therapist_profile_id: string;
  position?: number;
}

export async function POST(request: NextRequest) {
  try {
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
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
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

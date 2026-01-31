import { NextRequest, NextResponse } from "next/server";
import { respondToSessionRsvpAction } from "@/app/actions/session-rsvp";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.co.uk";

  // Validate parameters
  if (!token || token.length !== 64) {
    return NextResponse.redirect(`${baseUrl}/session-rsvp/error?reason=invalid_token`);
  }

  if (!action || !["accept", "decline"].includes(action)) {
    return NextResponse.redirect(`${baseUrl}/session-rsvp/error?reason=invalid_action`);
  }

  // Process RSVP response
  const result = await respondToSessionRsvpAction({
    token,
    response: action as "accepted" | "declined",
  });

  if (!result.success) {
    const reason = encodeURIComponent(result.error || "unknown");
    return NextResponse.redirect(`${baseUrl}/session-rsvp/error?reason=${reason}`);
  }

  // Redirect to appropriate confirmation page
  if (action === "accept") {
    return NextResponse.redirect(`${baseUrl}/session-rsvp/confirmed?token=${token}`);
  } else {
    return NextResponse.redirect(`${baseUrl}/session-rsvp/declined?token=${token}`);
  }
}

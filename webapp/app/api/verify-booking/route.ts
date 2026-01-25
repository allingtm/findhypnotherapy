import { NextRequest, NextResponse } from "next/server";
import { verifyBookingAction } from "@/app/actions/bookings";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/booking-error?reason=missing-token", request.url)
    );
  }

  try {
    const result = await verifyBookingAction(token);

    if (!result.success) {
      const errorReason = encodeURIComponent(result.error || "verification-failed");
      return NextResponse.redirect(
        new URL(`/booking-error?reason=${errorReason}`, request.url)
      );
    }

    const data = result.data as { visitorToken?: string; alreadyVerified?: boolean };

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/booking-verified?token=${data.visitorToken || ""}${data.alreadyVerified ? "&already=true" : ""}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Booking verification error:", error);
    return NextResponse.redirect(
      new URL("/booking-error?reason=server-error", request.url)
    );
  }
}

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { respondToSessionRsvpAction } from "@/app/actions/session-rsvp";

export const metadata: Metadata = {
  title: "Session RSVP | Find Hypnotherapy",
  description: "Respond to your session invitation",
};

interface PageProps {
  searchParams: Promise<{ token?: string; action?: string }>;
}

export default async function SessionRsvpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;
  const action = params.action;

  // Validate token
  if (!token || token.length !== 64) {
    redirect("/session-rsvp/error?reason=invalid_token");
  }

  // Validate action
  if (!action || !["accept", "decline"].includes(action)) {
    redirect("/session-rsvp/error?reason=invalid_action");
  }

  // Process the RSVP response
  const result = await respondToSessionRsvpAction({
    token,
    response: action as "accepted" | "declined",
  });

  if (!result.success) {
    const reason = encodeURIComponent(result.error || "unknown");
    redirect(`/session-rsvp/error?reason=${reason}`);
  }

  // Redirect to appropriate confirmation page
  if (action === "accept") {
    redirect(`/session-rsvp/confirmed?token=${token}`);
  } else {
    redirect(`/session-rsvp/declined?token=${token}`);
  }
}

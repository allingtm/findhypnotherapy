"use client";

import { useEffect } from "react";

interface TrackEventProps {
  eventType: "profile_view" | "booking_page_view" | "contact_form_view";
  therapistProfileId: string;
  metadata?: Record<string, unknown>;
}

export function TrackEvent({
  eventType,
  therapistProfileId,
  metadata,
}: TrackEventProps) {
  useEffect(() => {
    // Fire-and-forget: don't await, don't show errors
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        therapist_profile_id: therapistProfileId,
        metadata,
      }),
    }).catch(() => {
      // Silently ignore tracking failures
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

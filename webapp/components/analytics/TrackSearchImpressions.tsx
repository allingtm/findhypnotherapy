"use client";

import { useEffect } from "react";

interface TrackSearchImpressionsProps {
  impressions: { therapistProfileId: string; position: number }[];
}

export function TrackSearchImpressions({
  impressions,
}: TrackSearchImpressionsProps) {
  useEffect(() => {
    if (impressions.length === 0) return;

    fetch("/api/analytics/track-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: impressions.map((imp) => ({
          therapist_profile_id: imp.therapistProfileId,
          position: imp.position,
        })),
      }),
    }).catch(() => {
      // Silently ignore tracking failures
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

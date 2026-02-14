"use client";

import { IconMessageReply } from "@tabler/icons-react";

interface ResponseTimeChartProps {
  avgResponseTimeMinutes: number | null;
}

export function ResponseTimeChart({ avgResponseTimeMinutes }: ResponseTimeChartProps) {
  if (avgResponseTimeMinutes === null) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Response Time
        </h3>
        <div className="flex flex-col items-center justify-center h-[120px]">
          <IconMessageReply className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No message data yet
          </p>
        </div>
      </div>
    );
  }

  // Determine quality
  let quality: "fast" | "good" | "slow";
  let color: string;
  let label: string;

  if (avgResponseTimeMinutes <= 60) {
    quality = "fast";
    color = "text-green-600 dark:text-green-400";
    label = "Excellent";
  } else if (avgResponseTimeMinutes <= 240) {
    quality = "good";
    color = "text-blue-600 dark:text-blue-400";
    label = "Good";
  } else {
    quality = "slow";
    color = "text-orange-600 dark:text-orange-400";
    label = "Needs improvement";
  }

  // Format time display
  let timeDisplay: string;
  if (avgResponseTimeMinutes < 60) {
    timeDisplay = `${Math.round(avgResponseTimeMinutes)} min`;
  } else if (avgResponseTimeMinutes < 1440) {
    const hours = Math.floor(avgResponseTimeMinutes / 60);
    const mins = Math.round(avgResponseTimeMinutes % 60);
    timeDisplay = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.round(avgResponseTimeMinutes / 1440);
    timeDisplay = `${days} day${days > 1 ? "s" : ""}`;
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Avg Response Time
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className={`text-4xl font-bold ${color}`}>{timeDisplay}</div>
          <p className={`text-sm ${color} mt-1`}>{label}</p>
        </div>
        <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
          {quality === "fast" && (
            <p>You respond quickly to enquiries. This helps convert visitors into clients.</p>
          )}
          {quality === "good" && (
            <p>Your response time is reasonable. Responding within 1 hour can increase conversion rates.</p>
          )}
          {quality === "slow" && (
            <p>Try to respond within a few hours. Quick responses significantly increase the chance of booking.</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import type { BookingFunnelData } from "@/app/actions/analytics";
import { IconFilter } from "@tabler/icons-react";

interface BookingFunnelProps {
  data: BookingFunnelData;
}

const stages = [
  { key: "pending" as const, label: "Submitted", color: "bg-gray-400 dark:bg-gray-500" },
  { key: "verified" as const, label: "Verified", color: "bg-blue-400 dark:bg-blue-500" },
  { key: "confirmed" as const, label: "Confirmed", color: "bg-green-400 dark:bg-green-500" },
  { key: "completed" as const, label: "Completed", color: "bg-emerald-500 dark:bg-emerald-400" },
];

export function BookingFunnel({ data }: BookingFunnelProps) {
  const total = data.pending + data.verified + data.confirmed + data.completed + data.cancelled + data.noShow;

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Booking Funnel
        </h3>
        <div className="flex flex-col items-center justify-center h-[200px]">
          <IconFilter className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No booking data available</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Data will appear once you receive bookings
          </p>
        </div>
      </div>
    );
  }

  const max = Math.max(
    data.pending + data.verified + data.confirmed + data.completed,
    1
  );

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Booking Funnel
      </h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          // Cumulative: each stage includes all later stages
          let value = 0;
          const idx = stages.findIndex((s) => s.key === stage.key);
          for (let i = idx; i < stages.length; i++) {
            value += data[stages[i].key];
          }
          const pct = Math.round((value / max) * 100);

          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stage.label}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {value}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${stage.color} transition-all`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {data.cancelled}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">No-shows</p>
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {data.noShow}
          </p>
        </div>
      </div>
    </div>
  );
}

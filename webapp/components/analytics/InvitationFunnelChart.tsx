"use client";

import { IconMail } from "@tabler/icons-react";

interface InvitationFunnelChartProps {
  data: {
    sent: number;
    opened: number;
    completed: number;
  };
}

export function InvitationFunnelChart({ data }: InvitationFunnelChartProps) {
  const { sent, opened, completed } = data;

  if (sent === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Invitation Funnel
        </h3>
        <div className="flex flex-col items-center justify-center h-[150px]">
          <IconMail className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No client invitations sent yet
          </p>
        </div>
      </div>
    );
  }

  const stages = [
    { label: "Sent", value: sent, color: "bg-blue-400 dark:bg-blue-500" },
    { label: "Opened", value: opened, color: "bg-indigo-400 dark:bg-indigo-500" },
    { label: "Completed", value: completed, color: "bg-green-400 dark:bg-green-500" },
  ];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Invitation Funnel
      </h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          const pct = sent > 0 ? Math.round((stage.value / sent) * 100) : 0;
          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stage.label}
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{stage.value}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1">
                    ({pct}%)
                  </span>
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
    </div>
  );
}

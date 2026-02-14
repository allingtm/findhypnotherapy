"use client";

import {
  IconTrendingUp,
  IconTrendingDown,
  IconInfoCircle,
  IconBulb,
} from "@tabler/icons-react";
import type { AnalyticsInsight } from "@/app/actions/analytics";

interface InsightsCardsProps {
  insights: AnalyticsInsight[];
}

const typeConfig = {
  positive: {
    icon: IconTrendingUp,
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
  },
  negative: {
    icon: IconTrendingDown,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
  },
  neutral: {
    icon: IconInfoCircle,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  tip: {
    icon: IconBulb,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
};

export function InsightsCards({ insights }: InsightsCardsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {insight.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

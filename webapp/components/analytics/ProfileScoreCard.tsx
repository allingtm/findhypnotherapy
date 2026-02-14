"use client";

import Link from "next/link";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { ProfileCompletionScore } from "@/app/actions/analytics";

interface ProfileScoreCardProps {
  data: ProfileCompletionScore;
}

export function ProfileScoreCard({ data }: ProfileScoreCardProps) {
  const { score, items } = data;
  const incomplete = items.filter((i) => !i.completed);

  // Color based on score
  let ringColor: string;
  let textColor: string;
  if (score >= 80) {
    ringColor = "text-green-500";
    textColor = "text-green-600 dark:text-green-400";
  } else if (score >= 50) {
    ringColor = "text-blue-500";
    textColor = "text-blue-600 dark:text-blue-400";
  } else {
    ringColor = "text-orange-500";
    textColor = "text-orange-600 dark:text-orange-400";
  }

  // SVG circle calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Profile Completion
      </h3>

      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-neutral-700"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={ringColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${textColor}`}>{score}%</span>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm"
              >
                {item.completed ? (
                  <IconCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <IconX className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                )}
                <span
                  className={
                    item.completed
                      ? "text-gray-500 dark:text-gray-400 line-through"
                      : "text-gray-700 dark:text-gray-300"
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next steps */}
      {incomplete.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Next step to improve your profile:
          </p>
          <Link
            href={incomplete[0].actionHref}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {incomplete[0].actionLabel} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  IconCalendarCheck,
  IconCalendarX,
  IconCalendarPlus,
  IconMessage,
  IconUserCheck,
  IconActivity,
  IconHistory,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { DASHBOARD_HELP } from "./helpContent";

interface ActivityItem {
  id: string;
  type:
    | "booking_created"
    | "booking_confirmed"
    | "booking_cancelled"
    | "message_received"
    | "client_onboarded";
  title: string;
  description: string;
  timestamp: string;
  linkHref?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function getIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "booking_created":
      return <IconCalendarPlus className="w-4 h-4" />;
    case "booking_confirmed":
      return <IconCalendarCheck className="w-4 h-4" />;
    case "booking_cancelled":
      return <IconCalendarX className="w-4 h-4" />;
    case "message_received":
      return <IconMessage className="w-4 h-4" />;
    case "client_onboarded":
      return <IconUserCheck className="w-4 h-4" />;
    default:
      return <IconActivity className="w-4 h-4" />;
  }
}

function getIconStyles(type: ActivityItem["type"]) {
  switch (type) {
    case "booking_created":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "booking_confirmed":
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "booking_cancelled":
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    case "message_received":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    case "client_onboarded":
      return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  }
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-5">
        <SectionHeader
          title="Recent Activity"
          helpTitle={DASHBOARD_HELP.activityFeed.title}
          helpContent={DASHBOARD_HELP.activityFeed.content}
          icon={<IconHistory className="w-5 h-5" />}
          className="mb-4"
        />
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
            <IconActivity className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent activity
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Activity from the past 7 days will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-5">
      <SectionHeader
        title="Recent Activity"
        helpTitle={DASHBOARD_HELP.activityFeed.title}
        helpContent={DASHBOARD_HELP.activityFeed.content}
        icon={<IconHistory className="w-5 h-5" />}
        className="mb-4"
      />

      <div className="space-y-1">
        {activities.map((activity, idx) => {
          const content = (
            <div
              className={cn(
                "flex items-start gap-3 p-2 rounded-lg transition-colors",
                activity.linkHref && "hover:bg-gray-50 dark:hover:bg-neutral-700"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  getIconStyles(activity.type)
                )}
              >
                {getIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          );

          if (activity.linkHref) {
            return (
              <Link key={activity.id} href={activity.linkHref}>
                {content}
              </Link>
            );
          }

          return <div key={activity.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}

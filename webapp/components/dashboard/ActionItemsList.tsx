"use client";

import Link from "next/link";
import {
  IconAlertCircle,
  IconMessage,
  IconCalendarCheck,
  IconMail,
  IconChevronRight,
  IconInbox,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { DASHBOARD_HELP } from "./helpContent";

interface ActionItem {
  id: string;
  type: "pending_booking" | "unread_message" | "unverified_booking";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

interface ActionItemsListProps {
  items: ActionItem[];
}

function getIcon(type: ActionItem["type"]) {
  switch (type) {
    case "pending_booking":
      return <IconCalendarCheck className="w-4 h-4" />;
    case "unread_message":
      return <IconMessage className="w-4 h-4" />;
    case "unverified_booking":
      return <IconMail className="w-4 h-4" />;
    default:
      return <IconAlertCircle className="w-4 h-4" />;
  }
}

function getPriorityStyles(priority: ActionItem["priority"]) {
  switch (priority) {
    case "high":
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30",
      };
    case "medium":
      return {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
      };
    case "low":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
      };
  }
}

export function ActionItemsList({ items }: ActionItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <SectionHeader
          title="Action Items"
          helpTitle={DASHBOARD_HELP.actionItems.title}
          helpContent={DASHBOARD_HELP.actionItems.content}
          icon={<IconAlertCircle className="w-5 h-5" />}
          className="mb-4"
        />
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <IconInbox className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            All caught up!
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            No items need your attention right now
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-neutral-700">
        <SectionHeader
          title="Action Items"
          helpTitle={DASHBOARD_HELP.actionItems.title}
          helpContent={DASHBOARD_HELP.actionItems.content}
          icon={<IconAlertCircle className="w-5 h-5" />}
          action={
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
              {items.length}
            </span>
          }
        />
      </div>

      <div className="divide-y divide-gray-100 dark:divide-neutral-700">
        {items.map((item) => {
          const styles = getPriorityStyles(item.priority);
          return (
            <Link
              key={item.id}
              href={item.actionHref}
              className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors group"
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  styles.iconBg,
                  styles.icon
                )}
              >
                {getIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                <span className="hidden sm:inline">{item.actionLabel}</span>
                <IconChevronRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

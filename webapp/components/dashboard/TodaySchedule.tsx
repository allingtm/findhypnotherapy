"use client";

import Link from "next/link";
import {
  IconVideo,
  IconMapPin,
  IconPhone,
  IconCalendar,
  IconClock,
  IconUser,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { DASHBOARD_HELP } from "./helpContent";

interface ScheduleItem {
  id: string;
  type: "booking" | "session";
  startTime: string;
  endTime: string;
  clientName: string;
  serviceName: string | null;
  format: "online" | "in-person" | "phone" | null;
  status: string;
  clientSlug?: string;
}

interface TodayScheduleProps {
  schedule: ScheduleItem[];
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function FormatIcon({ format }: { format: string | null }) {
  switch (format) {
    case "online":
      return <IconVideo className="w-4 h-4 text-blue-500" />;
    case "in-person":
      return <IconMapPin className="w-4 h-4 text-green-500" />;
    case "phone":
      return <IconPhone className="w-4 h-4 text-purple-500" />;
    default:
      return <IconUser className="w-4 h-4 text-gray-400" />;
  }
}

export function TodaySchedule({ schedule }: TodayScheduleProps) {
  if (schedule.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <SectionHeader
          title="Today's Schedule"
          helpTitle={DASHBOARD_HELP.schedule.title}
          helpContent={DASHBOARD_HELP.schedule.content}
          icon={<IconClock className="w-5 h-5" />}
          action={
            <Link
              href="/dashboard/calendar"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Calendar
            </Link>
          }
          className="mb-4"
        />
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
            <IconCalendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No appointments scheduled for today
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Enjoy your free time!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-neutral-700">
        <SectionHeader
          title="Today's Schedule"
          helpTitle={DASHBOARD_HELP.schedule.title}
          helpContent={DASHBOARD_HELP.schedule.content}
          icon={<IconClock className="w-5 h-5" />}
          action={
            <Link
              href="/dashboard/calendar"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Calendar
            </Link>
          }
        />
      </div>

      <div className="divide-y divide-gray-100 dark:divide-neutral-700">
        {schedule.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {/* Time */}
            <div className="flex-shrink-0 w-16 sm:w-20">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTime(item.startTime)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(item.endTime)}
              </p>
            </div>

            {/* Type indicator */}
            <div
              className={cn(
                "flex-shrink-0 w-1 h-12 rounded-full",
                item.type === "session"
                  ? "bg-green-500"
                  : item.status === "confirmed"
                  ? "bg-blue-500"
                  : "bg-amber-500"
              )}
            />

            {/* Client info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {item.clientName}
                </p>
                {item.type === "session" && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                    Client
                  </span>
                )}
                {item.status === "pending" && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded">
                    Pending
                  </span>
                )}
              </div>
              {item.serviceName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.serviceName}
                </p>
              )}
            </div>

            {/* Format icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                <FormatIcon format={item.format} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

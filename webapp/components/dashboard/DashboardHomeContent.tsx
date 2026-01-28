"use client";

import { StatCard } from "./StatCard";
import { TodaySchedule } from "./TodaySchedule";
import { ActionItemsList } from "./ActionItemsList";
import { QuickActions } from "./QuickActions";
import { ActivityFeed } from "./ActivityFeed";
import {
  IconCalendarEvent,
  IconCalendarCheck,
  IconMessage,
  IconUsers,
  IconUserPlus,
  IconCalendar,
} from "@tabler/icons-react";
import type {
  DashboardStats,
  ScheduleItem,
  ActionItem,
  ActivityItem,
} from "@/app/actions/dashboard";

interface DashboardHomeContentProps {
  userName: string;
  stats: DashboardStats;
  schedule: ScheduleItem[];
  actionItems: ActionItem[];
  activities: ActivityItem[];
  profileSlug?: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHomeContent({
  userName,
  stats,
  schedule,
  actionItems,
  activities,
  profileSlug,
}: DashboardHomeContentProps) {
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <div className="w-full max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here&apos;s your practice overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title="Today's Sessions"
          value={stats.todaySessions}
          icon={<IconCalendarEvent className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant="info"
          linkHref="/dashboard/calendar"
          linkText="View schedule"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={<IconCalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant={stats.pendingBookings > 0 ? "warning" : "default"}
          linkHref="/dashboard/bookings"
          linkText={stats.pendingBookings > 0 ? "Review now" : "View all"}
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={<IconMessage className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant={stats.unreadMessages > 0 ? "warning" : "default"}
          linkHref="/dashboard/messages"
          linkText={stats.unreadMessages > 0 ? "Open inbox" : "View all"}
        />
        <StatCard
          title="Active Clients"
          value={stats.activeClients}
          icon={<IconUsers className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant="success"
          subtitle={
            stats.invitedClients > 0
              ? `${stats.invitedClients} invited`
              : undefined
          }
          linkHref="/dashboard/clients"
          linkText="View clients"
        />
      </div>

      {/* Today's Schedule */}
      <div className="mb-6 sm:mb-8">
        <TodaySchedule schedule={schedule} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6">
          <ActionItemsList items={actionItems} />
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions profileSlug={profileSlug} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

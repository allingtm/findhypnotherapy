"use client";

import {
  IconMessages,
  IconCalendarEvent,
  IconCheck,
  IconArrowRight,
  IconUsers,
  IconUserPlus,
  IconEye,
  IconSearch,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
} from "@tabler/icons-react";
import type { AnalyticsOverview } from "@/app/actions/analytics";

interface OverviewCardsProps {
  data: AnalyticsOverview;
  showVisibility?: boolean;
}

function TrendIndicator({
  current,
  previous,
  suffix = "",
}: {
  current: number;
  previous: number;
  suffix?: string;
}) {
  if (previous === 0 && current === 0) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">No change</span>;
  }

  if (previous === 0) {
    return (
      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
        <IconArrowUpRight className="w-3 h-3" />
        New{suffix}
      </span>
    );
  }

  const change = Math.round(((current - previous) / previous) * 100);

  if (change === 0) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
        <IconMinus className="w-3 h-3" />
        No change
      </span>
    );
  }

  if (change > 0) {
    return (
      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
        <IconArrowUpRight className="w-3 h-3" />
        +{change}%{suffix}
      </span>
    );
  }

  return (
    <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-0.5">
      <IconArrowDownRight className="w-3 h-3" />
      {change}%{suffix}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  current,
  previous,
  suffix,
  isSuffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  current: number;
  previous: number;
  suffix?: string;
  isSuffix?: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-neutral-700">
          {icon}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}{isSuffix}
        </p>
        <TrendIndicator current={current} previous={previous} suffix={suffix} />
      </div>
    </div>
  );
}

export function OverviewCards({ data, showVisibility = false }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<IconMessages className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        label="Enquiries"
        value={String(data.totalEnquiries)}
        current={data.totalEnquiries}
        previous={data.totalEnquiriesPrev}
      />
      <StatCard
        icon={<IconCalendarEvent className="w-4 h-4 text-green-600 dark:text-green-400" />}
        label="Bookings"
        value={String(data.totalBookings)}
        current={data.totalBookings}
        previous={data.totalBookingsPrev}
      />
      <StatCard
        icon={<IconCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        label="Confirmation Rate"
        value={String(data.confirmationRate)}
        isSuffix="%"
        current={data.confirmationRate}
        previous={data.confirmationRatePrev}
      />
      <StatCard
        icon={<IconArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        label="Enquiry to Booking"
        value={String(data.enquiryToBookingRate)}
        isSuffix="%"
        current={data.enquiryToBookingRate}
        previous={data.enquiryToBookingRatePrev}
      />
      <StatCard
        icon={<IconUsers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        label="Active Clients"
        value={String(data.activeClients)}
        current={data.activeClients}
        previous={data.activeClients}
      />
      <StatCard
        icon={<IconUserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        label="New Clients"
        value={String(data.newClients)}
        current={data.newClients}
        previous={data.newClientsPrev}
      />
      {showVisibility && (
        <>
          <StatCard
            icon={<IconEye className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
            label="Profile Views"
            value={String(data.profileViews)}
            current={data.profileViews}
            previous={data.profileViewsPrev}
          />
          <StatCard
            icon={<IconSearch className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            label="Search Impressions"
            value={String(data.searchImpressions)}
            current={data.searchImpressions}
            previous={data.searchImpressionsPrev}
          />
        </>
      )}
    </div>
  );
}

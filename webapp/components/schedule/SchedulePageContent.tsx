"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MemberCalendar } from "@/components/calendar/MemberCalendar";
import { BookingsPageContent } from "@/app/dashboard/bookings/BookingsPageContent";
import { WeeklyScheduleEditor } from "@/components/availability/WeeklyScheduleEditor";
import { CalendarSyncStatus } from "@/components/availability/CalendarSyncStatus";
import { saveWeeklyAvailabilityAction } from "@/app/actions/availability";
import {
  IconCalendar,
  IconCalendarCheck,
  IconCalendarEvent,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_format: string | null;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  visitor_notes: string | null;
  status: string;
  is_verified: boolean | null;
  created_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  meeting_url: string | null;
}

interface CalendarBooking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  visitor_name: string;
  service_title?: string;
  session_format?: string | null;
}

interface DaySchedule {
  day_of_week: number;
  slots: {
    start_time: string;
    end_time: string;
  }[];
}

interface CalendarConnection {
  provider: string;
  is_active: boolean | null;
  last_sync_at: string | null;
  sync_error: string | null;
}

interface BookingSettings {
  id: string;
  therapist_profile_id: string;
  slot_duration: number;
  buffer_time: number;
  min_notice_hours: number;
  max_advance_days: number;
  require_approval: boolean;
  online_booking_enabled: boolean;
  timezone: string;
}

interface SchedulePageContentProps {
  // Calendar tab data
  calendarBookings: CalendarBooking[];
  // Appointments tab data
  allBookings: Booking[];
  // Availability tab data
  bookingSettings: BookingSettings;
  initialSchedule: DaySchedule[];
  // Sync tab data
  connections: CalendarConnection[];
}

type TabKey = "calendar" | "appointments" | "availability" | "sync";

const tabs: { key: TabKey; label: string; icon: typeof IconCalendar }[] = [
  { key: "calendar", label: "Calendar", icon: IconCalendar },
  { key: "appointments", label: "Appointments", icon: IconCalendarCheck },
  { key: "availability", label: "Availability", icon: IconCalendarEvent },
  { key: "sync", label: "Sync", icon: IconRefresh },
];

export function SchedulePageContent({
  calendarBookings,
  allBookings,
  bookingSettings,
  initialSchedule,
  connections,
}: SchedulePageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "calendar"
  );

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTab === "calendar") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    const newUrl = params.toString()
      ? `/dashboard/schedule?${params.toString()}`
      : "/dashboard/schedule";
    router.replace(newUrl, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Listen for URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabKey;
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("calendar");
    }
  }, [searchParams]);

  // Availability save state
  const [saving, setSaving] = useState(false);

  const handleSaveSchedule = async (
    schedule: Array<{
      day_of_week: number;
      slots: Array<{ start_time: string; end_time: string }>;
    }>
  ) => {
    setSaving(true);
    try {
      const result = await saveWeeklyAvailabilityAction(schedule);
      if (!result.success) {
        throw new Error(result.error || "Failed to save availability");
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <IconCalendar className="w-8 h-8 text-gray-700 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Schedule
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "calendar" && (
          <div className="max-w-6xl">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View all your appointments and client sessions
            </p>
            <MemberCalendar initialBookings={calendarBookings} />
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your consultation requests and upcoming appointments
            </p>
            <BookingsPageContent initialBookings={allBookings} />
          </div>
        )}

        {activeTab === "availability" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Set your weekly availability for introductory sessions
            </p>
            <WeeklyScheduleEditor
              initialSchedule={initialSchedule}
              onSave={handleSaveSchedule}
              saving={saving}
            />
          </div>
        )}

        {activeTab === "sync" && (
          <div className="max-w-5xl">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your calendar to prevent double-bookings and sync
              appointments
            </p>
            <CalendarSyncStatus connections={connections} />
          </div>
        )}
      </div>
    </div>
  );
}

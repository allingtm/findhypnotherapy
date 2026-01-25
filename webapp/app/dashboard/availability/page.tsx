import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateBookingSettings,
  getWeeklyAvailability,
  getCalendarConnectionStatus,
} from "@/app/actions/availability";
import { AvailabilityPageContent } from "./AvailabilityPageContent";

export const metadata = {
  title: "Availability | Find Hypnotherapy",
  description: "Manage your availability for bookings",
};

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get booking settings
  const { settings, error: settingsError } = await getOrCreateBookingSettings();

  if (settingsError || !settings) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Availability
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your settings. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Get weekly availability
  const { availability } = await getWeeklyAvailability();

  // Get calendar connections
  const { connections } = await getCalendarConnectionStatus();

  // Transform availability to schedule format
  const initialSchedule = Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    slots: availability
      .filter((a) => a.day_of_week === i)
      .map((a) => ({
        start_time: a.start_time,
        end_time: a.end_time,
      })),
  }));

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Availability
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set your weekly availability for introductory sessions and connect your calendar to prevent double-bookings.
        </p>
      </div>

      <AvailabilityPageContent
        settings={settings}
        initialSchedule={initialSchedule}
        connections={connections}
      />
    </div>
  );
}

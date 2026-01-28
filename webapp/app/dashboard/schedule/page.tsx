import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SchedulePageContent } from "@/components/schedule/SchedulePageContent";
import { getBookingsForMember } from "@/app/actions/bookings";
import {
  getOrCreateBookingSettings,
  getWeeklyAvailability,
  getCalendarConnectionStatus,
} from "@/app/actions/availability";

export const metadata = {
  title: "Schedule | Find Hypnotherapy",
  description: "Manage your calendar, appointments, and availability",
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has a therapist profile
  const { data: profile } = await supabase
    .from("therapist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard/practice?tab=profile");
  }

  // Fetch all data in parallel
  const [
    bookingsResult,
    settingsResult,
    availabilityResult,
    connectionsResult,
    calendarBookingsResult,
  ] = await Promise.all([
    getBookingsForMember("all"),
    getOrCreateBookingSettings(),
    getWeeklyAvailability(),
    getCalendarConnectionStatus(),
    // Calendar view bookings (current month range)
    (async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const { data: bookings } = await supabase
        .from("bookings")
        .select(
          "id, booking_date, start_time, end_time, status, visitor_name, service_title, session_format"
        )
        .eq("therapist_profile_id", profile.id)
        .gte("booking_date", startOfMonth)
        .lte("booking_date", endOfMonth)
        .in("status", ["pending", "confirmed"])
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });

      return bookings || [];
    })(),
  ]);

  // Handle settings error
  if (settingsResult.error || !settingsResult.settings) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Schedule
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your settings. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Transform availability to schedule format
  const initialSchedule = Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    slots: (availabilityResult.availability || [])
      .filter((a) => a.day_of_week === i)
      .map((a) => ({
        start_time: a.start_time,
        end_time: a.end_time,
      })),
  }));

  return (
    <SchedulePageContent
      calendarBookings={calendarBookingsResult}
      allBookings={bookingsResult.bookings || []}
      bookingSettings={settingsResult.settings}
      initialSchedule={initialSchedule}
      connections={connectionsResult.connections || []}
    />
  );
}

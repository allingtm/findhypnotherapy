import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberCalendar } from "@/components/calendar/MemberCalendar";

export const metadata = {
  title: "Calendar | Find Hypnotherapy",
  description: "View your schedule and appointments",
};

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Check if user has a therapist profile
  const { data: profile } = await supabase
    .from("therapist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard/profile/therapist");
  }

  // Get current month's bookings
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_date, start_time, end_time, status, visitor_name, service_title, session_format")
    .eq("therapist_profile_id", profile.id)
    .gte("booking_date", startOfMonth)
    .lte("booking_date", endOfMonth)
    .in("status", ["pending", "confirmed"])
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Calendar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all your appointments and client sessions
        </p>
      </div>

      <MemberCalendar initialBookings={bookings || []} />
    </div>
  );
}

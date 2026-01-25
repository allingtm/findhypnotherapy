import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingsForMember } from "@/app/actions/bookings";
import { BookingsPageContent } from "./BookingsPageContent";

export const metadata = {
  title: "Bookings | Find Hypnotherapy",
  description: "Manage your booking requests",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all bookings
  const { bookings, error } = await getBookingsForMember("all");

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Bookings
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your bookings. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bookings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your consultation requests and upcoming appointments.
        </p>
      </div>

      <BookingsPageContent initialBookings={bookings} />
    </div>
  );
}

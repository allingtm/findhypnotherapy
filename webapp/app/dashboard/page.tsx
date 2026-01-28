import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/auth/permissions";
import { DashboardHomeContent } from "@/components/dashboard/DashboardHomeContent";
import {
  getDashboardStats,
  getDashboardTodaySchedule,
  getDashboardActionItems,
  getDashboardRecentActivity,
} from "@/app/actions/dashboard";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Find Hypnotherapy",
  description: "Your practice overview and management dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user roles
  const userRoles = await getUserRoles(supabase);
  const isAdmin = userRoles.includes("Admin");

  // Get user profile and therapist profile
  const [userResult, profileResult] = await Promise.all([
    supabase.from("users").select("name").eq("id", user.id).single(),
    supabase
      .from("therapist_profiles")
      .select("id, slug")
      .eq("user_id", user.id)
      .single(),
  ]);

  const userName = userResult.data?.name || user.email?.split("@")[0] || "User";
  const profileSlug = profileResult.data?.slug;

  // If no therapist profile, show setup prompt
  if (!profileResult.data) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Find Hypnotherapy!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete your therapist profile to start accepting bookings and
            connect with clients.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Set Up Your Profile
          </Link>
        </div>

        {isAdmin && (
          <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                <span className="font-semibold">Admin Access:</span> You have
                administrator privileges.
              </p>
              <Link
                href="/admin"
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                Admin Dashboard &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fetch all dashboard data in parallel
  const [statsResult, scheduleResult, actionItemsResult, activitiesResult] =
    await Promise.all([
      getDashboardStats(),
      getDashboardTodaySchedule(),
      getDashboardActionItems(),
      getDashboardRecentActivity(),
    ]);

  // Default stats if there's an error
  const defaultStats = {
    todaySessions: 0,
    pendingBookings: 0,
    unreadMessages: 0,
    activeClients: 0,
    invitedClients: 0,
    sessionsThisWeek: 0,
  };

  return (
    <div className="w-full">
      {/* Admin Banner */}
      {isAdmin && (
        <div className="mb-6 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-800 dark:text-purple-300">
              <span className="font-semibold">Admin Access:</span> You have
              administrator privileges.
            </p>
            <Link
              href="/admin"
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              Admin Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}

      <DashboardHomeContent
        userName={userName}
        stats={statsResult.stats || defaultStats}
        schedule={scheduleResult.schedule}
        actionItems={actionItemsResult.items}
        activities={activitiesResult.activities}
        profileSlug={profileSlug}
      />
    </div>
  );
}

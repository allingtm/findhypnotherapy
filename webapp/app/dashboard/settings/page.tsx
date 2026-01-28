import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";
import { getOrCreateBookingSettings } from "@/app/actions/availability";
import { getUserSubscription } from "@/lib/auth/subscriptions";

export const metadata = {
  title: "Settings | Find Hypnotherapy",
  description: "Manage your account, terms, and billing settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user data and settings in parallel
  const [userData, settingsResult, subscription] = await Promise.all([
    supabase.from("users").select("name, photo_url").eq("id", user.id).single(),
    getOrCreateBookingSettings(),
    getUserSubscription(supabase),
  ]);

  if (settingsResult.error || !settingsResult.settings) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Settings
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your settings. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SettingsPageContent
      user={{
        id: user.id,
        email: user.email || "",
        name: userData.data?.name || "",
        photo_url: userData.data?.photo_url,
      }}
      bookingSettings={settingsResult.settings}
      subscription={subscription}
    />
  );
}

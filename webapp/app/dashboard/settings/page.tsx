import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TermsEditor } from "@/components/settings/TermsEditor";

export const metadata = {
  title: "Settings | Find Hypnotherapy",
  description: "Manage your practice settings and terms & conditions",
};

export default async function SettingsPage() {
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
    .select("id, display_name")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard/profile/therapist");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your practice settings and client onboarding requirements
        </p>
      </div>

      {/* Terms & Conditions Section */}
      <section className="mb-12">
        <TermsEditor />
      </section>
    </div>
  );
}

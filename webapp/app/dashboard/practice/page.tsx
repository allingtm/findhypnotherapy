import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PracticePageContent } from "@/components/practice/PracticePageContent";
import {
  getOrCreateTherapistProfile,
  getSpecializations,
  getTherapistSpecializations,
} from "@/app/actions/therapist-profile";
import { getTherapistServices } from "@/app/actions/therapist-services";
import { getUserVideos } from "@/app/actions/therapist-videos";

export const metadata = {
  title: "Practice | Find Hypnotherapy",
  description: "Manage your profile, services, and content",
};

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create therapist profile
  const { profile, error } = await getOrCreateTherapistProfile();

  if (error || !profile) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Practice
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Unable to load your profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all data in parallel
  const [specializations, therapistSpecializations, services, videos] =
    await Promise.all([
      getSpecializations(),
      getTherapistSpecializations(profile.id),
      getTherapistServices(profile.id),
      getUserVideos(),
    ]);

  const selectedSpecializationIds = therapistSpecializations.map(
    (ts) => ts.specialization_id
  );

  return (
    <PracticePageContent
      profile={profile}
      specializations={specializations}
      selectedSpecializationIds={selectedSpecializationIds}
      services={services}
      videos={videos}
    />
  );
}

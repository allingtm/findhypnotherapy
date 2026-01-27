import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientList } from "@/components/clients/ClientList";

export const metadata = {
  title: "Clients | Find Hypnotherapy",
  description: "Manage your clients and their sessions",
};

export default async function ClientsPage() {
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

  return <ClientList />;
}

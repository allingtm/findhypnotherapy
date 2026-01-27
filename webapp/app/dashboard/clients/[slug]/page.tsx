import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDetailContent } from "./ClientDetailContent";

export const metadata = {
  title: "Client Details | Find Hypnotherapy",
  description: "View and manage client information",
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get therapist profile
  const { data: profile } = await supabase
    .from("therapist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard/profile/therapist");
  }

  // Get client with related data
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(`
      *,
      client_sessions(
        id,
        title,
        session_date,
        start_time,
        end_time,
        status,
        session_format,
        location,
        meeting_url,
        therapist_notes,
        created_at
      ),
      client_notes(
        id,
        note_type,
        content,
        is_private,
        created_at,
        session_id
      ),
      client_terms_acceptance(
        id,
        accepted_at,
        therapist_terms(title, version)
      )
    `)
    .eq("therapist_profile_id", profile.id)
    .eq("slug", slug)
    .single();

  if (clientError || !client) {
    notFound();
  }

  return (
    <ClientDetailContent
      client={client}
      initialTab={tab || "sessions"}
    />
  );
}

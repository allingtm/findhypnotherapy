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

  // Get client with related data using RPC function
  // (nested selects don't work correctly with RLS on client_sessions)
  const { data: client, error: clientError } = await supabase
    .rpc('get_client_with_sessions', { p_slug: slug });

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

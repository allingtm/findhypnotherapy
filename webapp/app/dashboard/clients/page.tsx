import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientsPageContent } from "@/components/clients/ClientsPageContent";
import { getConversationsAction } from "@/app/actions/messages";
import { getBookingsForMember } from "@/app/actions/bookings";

export const metadata = {
  title: "Clients | Find Hypnotherapy",
  description: "Manage your clients, inquiries, and booking requests",
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
    redirect("/dashboard/practice?tab=profile");
  }

  // Fetch conversations (inquiries) and pending bookings in parallel
  const [conversationsResult, bookingsResult] = await Promise.all([
    getConversationsAction(),
    getBookingsForMember("pending_all"),
  ]);

  const conversations = conversationsResult.conversations || [];
  const pendingBookings = bookingsResult.bookings || [];

  // Count conversations that need attention (unread messages from visitors)
  const unreadCount = conversations.filter(
    (c: { unreadCount: number; needsAttention: boolean }) =>
      c.unreadCount > 0 || c.needsAttention
  ).length;

  // Count only verified pending bookings (those needing therapist action)
  const pendingCount = pendingBookings.filter(
    (b: { is_verified: boolean }) => b.is_verified
  ).length;

  return (
    <ClientsPageContent
      conversations={conversations}
      pendingBookings={pendingBookings}
      unreadCount={unreadCount}
      pendingCount={pendingCount}
    />
  );
}

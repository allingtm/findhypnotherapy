"use server";

import { createClient } from "@/lib/supabase/server";

// Types for dashboard data
export interface DashboardStats {
  todaySessions: number;
  pendingBookings: number;
  unreadMessages: number;
  activeClients: number;
  invitedClients: number;
  sessionsThisWeek: number;
}

export interface ScheduleItem {
  id: string;
  type: "booking" | "session";
  startTime: string;
  endTime: string;
  clientName: string;
  serviceName: string | null;
  format: "online" | "in-person" | "phone" | null;
  status: string;
  clientSlug?: string;
}

export interface ActionItem {
  id: string;
  type: "pending_booking" | "unread_message" | "unverified_booking";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type:
    | "booking_created"
    | "booking_confirmed"
    | "booking_cancelled"
    | "message_received"
    | "client_onboarded";
  title: string;
  description: string;
  timestamp: string;
  linkHref?: string;
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<{
  stats: DashboardStats | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { stats: null, error: "Not authenticated" };
    }

    // Get therapist profile
    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { stats: null, error: "No therapist profile found" };
    }

    const today = new Date().toISOString().split("T")[0];
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    // Fetch all stats in parallel
    const [
      todayBookingsResult,
      todaySessionsResult,
      pendingBookingsResult,
      unreadMessagesResult,
      clientStatsResult,
      weekSessionsResult,
    ] = await Promise.all([
      // Today's bookings
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("booking_date", today)
        .in("status", ["pending", "confirmed"]),

      // Today's client sessions
      supabase
        .from("client_sessions")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("session_date", today)
        .eq("status", "scheduled"),

      // Pending bookings (verified, awaiting confirmation)
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("status", "pending")
        .eq("is_verified", true)
        .gte("booking_date", today),

      // Unread messages (conversations needing attention)
      supabase
        .from("conversations")
        .select(
          `
          id,
          messages!inner(id, sender_type, is_read)
        `
        )
        .eq("member_id", user.id)
        .eq("is_verified", true)
        .eq("is_blocked", false)
        .eq("messages.sender_type", "visitor")
        .eq("messages.is_read", false),

      // Client stats
      supabase
        .from("clients")
        .select("id, status", { count: "exact" })
        .eq("therapist_profile_id", profile.id),

      // Sessions this week
      supabase
        .from("client_sessions")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .gte("session_date", startOfWeek)
        .lte("session_date", endOfWeek),
    ]);

    // Calculate client counts
    const clients = clientStatsResult.data || [];
    const activeClients = clients.filter((c) => c.status === "active").length;
    const invitedClients = clients.filter((c) => c.status === "invited").length;

    // Count unique conversations with unread messages
    const unreadConversations = new Set(
      (unreadMessagesResult.data || []).map((c) => c.id)
    );

    const stats: DashboardStats = {
      todaySessions:
        (todayBookingsResult.count || 0) + (todaySessionsResult.count || 0),
      pendingBookings: pendingBookingsResult.count || 0,
      unreadMessages: unreadConversations.size,
      activeClients,
      invitedClients,
      sessionsThisWeek: weekSessionsResult.count || 0,
    };

    return { stats, error: null };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { stats: null, error: "Failed to load dashboard stats" };
  }
}

// Get today's schedule (bookings + sessions)
export async function getDashboardTodaySchedule(): Promise<{
  schedule: ScheduleItem[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { schedule: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { schedule: [], error: "No therapist profile found" };
    }

    const today = new Date().toISOString().split("T")[0];

    // Fetch bookings and sessions in parallel
    const [bookingsResult, sessionsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, start_time, end_time, visitor_name, service_title, session_format, status"
        )
        .eq("therapist_profile_id", profile.id)
        .eq("booking_date", today)
        .in("status", ["pending", "confirmed"])
        .order("start_time"),

      supabase
        .from("client_sessions")
        .select(
          `
          id, start_time, end_time, title, session_format, status,
          clients(id, slug, first_name, last_name)
        `
        )
        .eq("therapist_profile_id", profile.id)
        .eq("session_date", today)
        .eq("status", "scheduled")
        .order("start_time"),
    ]);

    const schedule: ScheduleItem[] = [];

    // Add bookings
    for (const booking of bookingsResult.data || []) {
      schedule.push({
        id: booking.id,
        type: "booking",
        startTime: booking.start_time,
        endTime: booking.end_time,
        clientName: booking.visitor_name,
        serviceName: booking.service_title,
        format: booking.session_format as ScheduleItem["format"],
        status: booking.status,
      });
    }

    // Add client sessions
    for (const session of sessionsResult.data || []) {
      // clients is a single object from the join, not an array
      const clientData = session.clients as unknown as {
        id: string;
        slug: string;
        first_name: string | null;
        last_name: string | null;
      } | null;
      schedule.push({
        id: session.id,
        type: "session",
        startTime: session.start_time,
        endTime: session.end_time,
        clientName: clientData
          ? `${clientData.first_name || ""} ${clientData.last_name || ""}`.trim()
          : "Unknown Client",
        serviceName: session.title,
        format: session.session_format as ScheduleItem["format"],
        status: session.status,
        clientSlug: clientData?.slug,
      });
    }

    // Sort by start time
    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return { schedule, error: null };
  } catch (error) {
    console.error("Dashboard schedule error:", error);
    return { schedule: [], error: "Failed to load today's schedule" };
  }
}

// Get action items that need attention
export async function getDashboardActionItems(): Promise<{
  items: ActionItem[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { items: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { items: [], error: "No therapist profile found" };
    }

    const today = new Date().toISOString().split("T")[0];
    const items: ActionItem[] = [];

    // Fetch pending bookings and conversations in parallel
    const [pendingBookingsResult, unverifiedBookingsResult, conversationsResult] =
      await Promise.all([
        // Pending verified bookings
        supabase
          .from("bookings")
          .select("id, visitor_name, visitor_email, booking_date, start_time, created_at")
          .eq("therapist_profile_id", profile.id)
          .eq("status", "pending")
          .eq("is_verified", true)
          .gte("booking_date", today)
          .order("booking_date")
          .limit(5),

        // Unverified bookings
        supabase
          .from("bookings")
          .select("id, visitor_name, visitor_email, booking_date, created_at")
          .eq("therapist_profile_id", profile.id)
          .eq("status", "pending")
          .eq("is_verified", false)
          .gte("booking_date", today)
          .order("created_at", { ascending: false })
          .limit(3),

        // Conversations with unread messages
        supabase
          .from("conversations")
          .select(
            `
            id, visitor_name, visitor_email, updated_at,
            messages(id, content, sender_type, is_read, created_at)
          `
          )
          .eq("member_id", user.id)
          .eq("is_verified", true)
          .eq("is_blocked", false)
          .order("updated_at", { ascending: false })
          .limit(10),
      ]);

    // Add pending bookings
    for (const booking of pendingBookingsResult.data || []) {
      items.push({
        id: `booking-${booking.id}`,
        type: "pending_booking",
        title: "Pending Intro Call",
        description: `${booking.visitor_name} - ${formatDateShort(booking.booking_date)} at ${formatTime(booking.start_time)}`,
        actionLabel: "Review",
        actionHref: "/dashboard/bookings",
        priority: "high",
        createdAt: booking.created_at || new Date().toISOString(),
      });
    }

    // Add unverified bookings
    for (const booking of unverifiedBookingsResult.data || []) {
      items.push({
        id: `unverified-${booking.id}`,
        type: "unverified_booking",
        title: "Awaiting Verification",
        description: `${booking.visitor_email} needs to verify their email`,
        actionLabel: "View",
        actionHref: "/dashboard/bookings",
        priority: "medium",
        createdAt: booking.created_at || new Date().toISOString(),
      });
    }

    // Add conversations needing reply
    for (const conv of conversationsResult.data || []) {
      const messages = conv.messages || [];
      const unreadFromVisitor = messages.filter(
        (m: { sender_type: string; is_read: boolean }) =>
          m.sender_type === "visitor" && !m.is_read
      );

      if (unreadFromVisitor.length > 0) {
        items.push({
          id: `message-${conv.id}`,
          type: "unread_message",
          title: "Awaiting Reply",
          description: `Message from ${conv.visitor_name}`,
          actionLabel: "Reply",
          actionHref: `/dashboard/messages/${conv.id}`,
          priority: "high",
          createdAt: conv.updated_at || new Date().toISOString(),
        });
      }
    }

    // Sort by priority and date
    items.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { items: items.slice(0, 8), error: null };
  } catch (error) {
    console.error("Dashboard action items error:", error);
    return { items: [], error: "Failed to load action items" };
  }
}

// Get recent activity feed
export async function getDashboardRecentActivity(): Promise<{
  activities: ActivityItem[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { activities: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { activities: [], error: "No therapist profile found" };
    }

    const activities: ActivityItem[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch recent events in parallel
    const [bookingsResult, messagesResult, clientsResult] = await Promise.all([
      // Recent bookings (created, confirmed, cancelled)
      supabase
        .from("bookings")
        .select("id, visitor_name, status, created_at, confirmed_at, cancelled_at")
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),

      // Recent messages
      supabase
        .from("messages")
        .select(
          `
          id, created_at, sender_type,
          conversations!inner(id, member_id, visitor_name)
        `
        )
        .eq("conversations.member_id", user.id)
        .eq("sender_type", "visitor")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5),

      // Recently onboarded clients
      supabase
        .from("clients")
        .select("id, slug, first_name, last_name, onboarded_at")
        .eq("therapist_profile_id", profile.id)
        .eq("status", "active")
        .not("onboarded_at", "is", null)
        .gte("onboarded_at", sevenDaysAgo.toISOString())
        .order("onboarded_at", { ascending: false })
        .limit(5),
    ]);

    // Process bookings
    for (const booking of bookingsResult.data || []) {
      if (booking.confirmed_at) {
        activities.push({
          id: `confirmed-${booking.id}`,
          type: "booking_confirmed",
          title: "Booking Confirmed",
          description: `Session with ${booking.visitor_name}`,
          timestamp: booking.confirmed_at,
          linkHref: "/dashboard/bookings",
        });
      } else if (booking.cancelled_at) {
        activities.push({
          id: `cancelled-${booking.id}`,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          description: `Session with ${booking.visitor_name}`,
          timestamp: booking.cancelled_at,
        });
      } else if (booking.status === "pending") {
        activities.push({
          id: `created-${booking.id}`,
          type: "booking_created",
          title: "New Intro Call Request",
          description: `From ${booking.visitor_name}`,
          timestamp: booking.created_at || new Date().toISOString(),
          linkHref: "/dashboard/bookings",
        });
      }
    }

    // Process messages
    for (const message of messagesResult.data || []) {
      const conv = message.conversations as unknown as {
        id: string;
        visitor_name: string;
      };
      if (conv) {
        activities.push({
          id: `message-${message.id}`,
          type: "message_received",
          title: "New Message",
          description: `From ${conv.visitor_name}`,
          timestamp: message.created_at,
          linkHref: `/dashboard/messages/${conv.id}`,
        });
      }
    }

    // Process client onboarding
    for (const client of clientsResult.data || []) {
      activities.push({
        id: `client-${client.id}`,
        type: "client_onboarded",
        title: "Client Onboarded",
        description: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
        timestamp: client.onboarded_at!,
        linkHref: `/dashboard/clients/${client.slug}`,
      });
    }

    // Sort by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return { activities: activities.slice(0, 10), error: null };
  } catch (error) {
    console.error("Dashboard activity error:", error);
    return { activities: [], error: "Failed to load recent activity" };
  }
}

// Helper functions
function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getEndOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? 0 : 7); // Adjust for Sunday end
  const sunday = new Date(now.setDate(diff));
  return sunday.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

// ============================================
// CHART DATA FUNCTIONS
// ============================================

export interface SessionTrendData {
  date: string;
  sessions: number;
  bookings: number;
}

export interface ClientStatusData {
  status: string;
  count: number;
}

export interface ServicePopularityData {
  serviceName: string;
  count: number;
}

export interface SessionFormatData {
  format: string;
  count: number;
}

// Get session trends over time for line/area chart
export async function getDashboardSessionTrends(
  days: number = 30
): Promise<{ data: SessionTrendData[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { data: [], error: "No therapist profile found" };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Fetch sessions and bookings in parallel
    const [sessionsResult, bookingsResult] = await Promise.all([
      supabase
        .from("client_sessions")
        .select("session_date")
        .eq("therapist_profile_id", profile.id)
        .gte("session_date", startDateStr)
        .in("status", ["scheduled", "completed"]),

      supabase
        .from("bookings")
        .select("booking_date")
        .eq("therapist_profile_id", profile.id)
        .gte("booking_date", startDateStr)
        .in("status", ["confirmed", "pending"])
        .eq("is_verified", true),
    ]);

    // Build date map for the period
    const dateMap = new Map<string, { sessions: number; bookings: number }>();
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, { sessions: 0, bookings: 0 });
    }

    // Count sessions by date
    for (const session of sessionsResult.data || []) {
      const dateStr = session.session_date;
      if (dateMap.has(dateStr)) {
        const entry = dateMap.get(dateStr)!;
        entry.sessions++;
      }
    }

    // Count bookings by date
    for (const booking of bookingsResult.data || []) {
      const dateStr = booking.booking_date;
      if (dateMap.has(dateStr)) {
        const entry = dateMap.get(dateStr)!;
        entry.bookings++;
      }
    }

    // Convert to array
    const data: SessionTrendData[] = Array.from(dateMap.entries()).map(
      ([date, counts]) => ({
        date,
        sessions: counts.sessions,
        bookings: counts.bookings,
      })
    );

    return { data, error: null };
  } catch (error) {
    console.error("Dashboard session trends error:", error);
    return { data: [], error: "Failed to load session trends" };
  }
}

// Get client status distribution for donut chart
export async function getDashboardClientStatus(): Promise<{
  data: ClientStatusData[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { data: [], error: "No therapist profile found" };
    }

    const { data: clients } = await supabase
      .from("clients")
      .select("status")
      .eq("therapist_profile_id", profile.id);

    // Count by status
    const statusCounts = new Map<string, number>();
    for (const client of clients || []) {
      const status = client.status || "unknown";
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }

    const data: ClientStatusData[] = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({ status, count })
    );

    return { data, error: null };
  } catch (error) {
    console.error("Dashboard client status error:", error);
    return { data: [], error: "Failed to load client status" };
  }
}

// Get service popularity for bar chart
export async function getDashboardServicePopularity(): Promise<{
  data: ServicePopularityData[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { data: [], error: "No therapist profile found" };
    }

    // Get bookings with service info from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [bookingsResult, sessionsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("service_title")
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", ninetyDaysAgo.toISOString())
        .in("status", ["confirmed", "pending"]),

      supabase
        .from("client_sessions")
        .select("title")
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", ninetyDaysAgo.toISOString()),
    ]);

    // Count by service name
    const serviceCounts = new Map<string, number>();

    for (const booking of bookingsResult.data || []) {
      const name = booking.service_title || "Other";
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
    }

    for (const session of sessionsResult.data || []) {
      const name = session.title || "Other";
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
    }

    // Sort by count and take top 5
    const data: ServicePopularityData[] = Array.from(serviceCounts.entries())
      .map(([serviceName, count]) => ({ serviceName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { data, error: null };
  } catch (error) {
    console.error("Dashboard service popularity error:", error);
    return { data: [], error: "Failed to load service popularity" };
  }
}

// Get session format distribution for pie chart
export async function getDashboardSessionFormats(): Promise<{
  data: SessionFormatData[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("therapist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { data: [], error: "No therapist profile found" };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [bookingsResult, sessionsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("session_format")
        .eq("therapist_profile_id", profile.id)
        .gte("booking_date", thirtyDaysAgo.toISOString().split("T")[0])
        .in("status", ["confirmed", "pending"]),

      supabase
        .from("client_sessions")
        .select("session_format")
        .eq("therapist_profile_id", profile.id)
        .gte("session_date", thirtyDaysAgo.toISOString().split("T")[0]),
    ]);

    // Count by format
    const formatCounts = new Map<string, number>();

    for (const booking of bookingsResult.data || []) {
      const format = booking.session_format || "other";
      formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
    }

    for (const session of sessionsResult.data || []) {
      const format = session.session_format || "other";
      formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
    }

    const data: SessionFormatData[] = Array.from(formatCounts.entries()).map(
      ([format, count]) => ({ format, count })
    );

    return { data, error: null };
  } catch (error) {
    console.error("Dashboard session formats error:", error);
    return { data: [], error: "Failed to load session formats" };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// TYPES
// ============================================

export interface AnalyticsOverview {
  totalEnquiries: number;
  totalEnquiriesPrev: number;
  totalBookings: number;
  totalBookingsPrev: number;
  confirmationRate: number;
  confirmationRatePrev: number;
  enquiryToBookingRate: number;
  enquiryToBookingRatePrev: number;
  activeClients: number;
  newClients: number;
  newClientsPrev: number;
  profileViews: number;
  profileViewsPrev: number;
  uniqueVisitors: number;
  searchImpressions: number;
  searchImpressionsPrev: number;
}

export interface BookingFunnelData {
  pending: number;
  verified: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface BookingDayData {
  day: string;
  count: number;
}

export interface BookingTimeData {
  hour: number;
  label: string;
  count: number;
}

export interface CancellationData {
  cancelledByMember: number;
  cancelledByVisitor: number;
  cancelledBySystem: number;
  topReasons: { reason: string; count: number }[];
}

export interface ServiceBookingData {
  serviceName: string;
  count: number;
}

export interface BookingAnalytics {
  funnel: BookingFunnelData;
  avgTimeToConfirmHours: number | null;
  cancellations: CancellationData;
  byDayOfWeek: BookingDayData[];
  byTimeOfDay: BookingTimeData[];
  topServices: ServiceBookingData[];
  formatSplit: { format: string; count: number }[];
}

export interface MessageVolumeData {
  date: string;
  count: number;
}

export interface EngagementAnalytics {
  messageVolume: MessageVolumeData[];
  avgResponseTimeMinutes: number | null;
  conversationsStarted: number;
  conversationsStartedPrev: number;
  conversationToClientRate: number;
  emailDelivered: number;
  emailOpened: number;
  emailBounced: number;
}

export interface ClientPipelineData {
  status: string;
  count: number;
}

export interface ClientAnalytics {
  pipeline: ClientPipelineData[];
  onboardingCompletionRate: number;
  avgSessionsPerClient: number;
  sessionCompletionRate: number;
  rsvpResponseRate: number;
  invitationFunnel: {
    sent: number;
    opened: number;
    completed: number;
  };
}

export interface ProfileCompletionItem {
  label: string;
  completed: boolean;
  weight: number;
  actionHref: string;
  actionLabel: string;
}

export interface ProfileCompletionScore {
  score: number;
  items: ProfileCompletionItem[];
}

export interface AnalyticsInsight {
  id: string;
  type: "positive" | "negative" | "neutral" | "tip";
  title: string;
  description: string;
}

// ============================================
// HELPER: Get therapist profile ID
// ============================================

async function getTherapistProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, profile: null, user: null };

  const { data: profile } = await supabase
    .from("therapist_profiles")
    .select("id, user_id")
    .eq("user_id", user.id)
    .single();

  return { supabase, profile, user };
}

function getDateRange(days: number) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - days);
  const prevStart = new Date();
  prevStart.setDate(now.getDate() - days * 2);
  return {
    startDate: start.toISOString(),
    prevStartDate: prevStart.toISOString(),
    endDate: now.toISOString(),
    startDateOnly: start.toISOString().split("T")[0],
  };
}

// ============================================
// OVERVIEW METRICS
// ============================================

export async function getAnalyticsOverview(
  days: number = 30
): Promise<{ data: AnalyticsOverview | null; error: string | null }> {
  try {
    const { supabase, profile } = await getTherapistProfile();
    if (!profile) return { data: null, error: "No therapist profile found" };

    const { startDate, prevStartDate, endDate } = getDateRange(days);

    const [
      enquiriesResult,
      enquiriesPrevResult,
      bookingsResult,
      bookingsPrevResult,
      confirmedResult,
      confirmedPrevResult,
      cancelledResult,
      cancelledPrevResult,
      activeClientsResult,
      newClientsResult,
      newClientsPrevResult,
      profileViewsResult,
      profileViewsPrevResult,
      uniqueVisitorsResult,
      impressionsResult,
      impressionsPrevResult,
    ] = await Promise.all([
      // Current period enquiries
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("member_id", profile.user_id)
        .eq("is_verified", true)
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Previous period enquiries
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("member_id", profile.user_id)
        .eq("is_verified", true)
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // Current period bookings
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Previous period bookings
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // Current confirmed
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("status", "confirmed")
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Previous confirmed
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("status", "confirmed")
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // Current cancelled
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("status", "cancelled")
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Previous cancelled
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("status", "cancelled")
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // Active clients
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("status", "active"),
      // New clients current
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // New clients previous
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // Profile views current (Phase 2)
      supabase
        .from("profile_events")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("event_type", "profile_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Profile views previous
      supabase
        .from("profile_events")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("event_type", "profile_view")
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // Unique visitors
      supabase
        .from("profile_events")
        .select("visitor_hash")
        .eq("therapist_profile_id", profile.id)
        .eq("event_type", "profile_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Search impressions current
      supabase
        .from("profile_events")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("event_type", "search_impression")
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      // Search impressions previous
      supabase
        .from("profile_events")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .eq("event_type", "search_impression")
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
    ]);

    const confirmed = confirmedResult.count || 0;
    const cancelled = cancelledResult.count || 0;
    const confirmedPrev = confirmedPrevResult.count || 0;
    const cancelledPrev = cancelledPrevResult.count || 0;
    const totalBookings = bookingsResult.count || 0;
    const totalEnquiries = enquiriesResult.count || 0;

    const confirmationRate =
      confirmed + cancelled > 0
        ? Math.round((confirmed / (confirmed + cancelled)) * 100)
        : 0;
    const confirmationRatePrev =
      confirmedPrev + cancelledPrev > 0
        ? Math.round(
            (confirmedPrev / (confirmedPrev + cancelledPrev)) * 100
          )
        : 0;

    const enquiryToBookingRate =
      totalEnquiries > 0
        ? Math.round((totalBookings / totalEnquiries) * 100)
        : 0;
    const enquiryToBookingRatePrev =
      (enquiriesPrevResult.count || 0) > 0
        ? Math.round(
            ((bookingsPrevResult.count || 0) /
              (enquiriesPrevResult.count || 0)) *
              100
          )
        : 0;

    // Count unique visitor hashes
    const visitorHashes = new Set(
      ((uniqueVisitorsResult as { data: { visitor_hash: string }[] | null }).data || []).map(
        (r: { visitor_hash: string }) => r.visitor_hash
      )
    );

    return {
      data: {
        totalEnquiries,
        totalEnquiriesPrev: enquiriesPrevResult.count || 0,
        totalBookings,
        totalBookingsPrev: bookingsPrevResult.count || 0,
        confirmationRate,
        confirmationRatePrev,
        enquiryToBookingRate,
        enquiryToBookingRatePrev,
        activeClients: activeClientsResult.count || 0,
        newClients: newClientsResult.count || 0,
        newClientsPrev: newClientsPrevResult.count || 0,
        profileViews: (profileViewsResult as { count: number | null }).count || 0,
        profileViewsPrev: (profileViewsPrevResult as { count: number | null }).count || 0,
        uniqueVisitors: visitorHashes.size,
        searchImpressions: (impressionsResult as { count: number | null }).count || 0,
        searchImpressionsPrev: (impressionsPrevResult as { count: number | null }).count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Analytics overview error:", error);
    return { data: null, error: "Failed to load analytics overview" };
  }
}

// ============================================
// BOOKING ANALYTICS
// ============================================

export async function getBookingAnalytics(
  days: number = 30
): Promise<{ data: BookingAnalytics | null; error: string | null }> {
  try {
    const { supabase, profile } = await getTherapistProfile();
    if (!profile) return { data: null, error: "No therapist profile found" };

    const { startDate } = getDateRange(days);

    const [
      bookingsResult,
      confirmedTimesResult,
      cancelledResult,
      servicesResult,
    ] = await Promise.all([
      // All bookings in period
      supabase
        .from("bookings")
        .select(
          "id, status, is_verified, booking_date, start_time, session_format, service_id, created_at, confirmed_at, cancelled_by, cancellation_reason"
        )
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", startDate),
      // Confirmed bookings with timing
      supabase
        .from("bookings")
        .select("created_at, confirmed_at")
        .eq("therapist_profile_id", profile.id)
        .eq("status", "confirmed")
        .not("confirmed_at", "is", null)
        .gte("created_at", startDate),
      // Cancelled bookings with details
      supabase
        .from("bookings")
        .select("cancelled_by, cancellation_reason")
        .eq("therapist_profile_id", profile.id)
        .eq("status", "cancelled")
        .gte("created_at", startDate),
      // Service names
      supabase
        .from("therapist_services")
        .select("id, name")
        .eq("therapist_profile_id", profile.id),
    ]);

    const bookings = bookingsResult.data || [];

    // Funnel
    const funnel: BookingFunnelData = {
      pending: bookings.filter((b) => b.status === "pending" && !b.is_verified).length,
      verified: bookings.filter((b) => b.status === "pending" && b.is_verified).length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      noShow: bookings.filter((b) => b.status === "no_show").length,
    };

    // Avg time to confirm
    let avgTimeToConfirmHours: number | null = null;
    const confirmedTimes = confirmedTimesResult.data || [];
    if (confirmedTimes.length > 0) {
      const totalHours = confirmedTimes.reduce((sum, b) => {
        const created = new Date(b.created_at!).getTime();
        const confirmed = new Date(b.confirmed_at!).getTime();
        return sum + (confirmed - created) / (1000 * 60 * 60);
      }, 0);
      avgTimeToConfirmHours = Math.round((totalHours / confirmedTimes.length) * 10) / 10;
    }

    // Cancellations
    const cancelledBookings = cancelledResult.data || [];
    const reasonCounts = new Map<string, number>();
    let byMember = 0, byVisitor = 0, bySystem = 0;
    for (const b of cancelledBookings) {
      if (b.cancelled_by === "member") byMember++;
      else if (b.cancelled_by === "visitor") byVisitor++;
      else bySystem++;
      if (b.cancellation_reason) {
        const reason = b.cancellation_reason;
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      }
    }
    const topReasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // By day of week
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = new Array(7).fill(0);
    for (const b of bookings) {
      if (b.booking_date) {
        const day = new Date(b.booking_date + "T00:00:00").getDay();
        dayCounts[day]++;
      }
    }
    const byDayOfWeek: BookingDayData[] = dayNames.map((day, i) => ({
      day,
      count: dayCounts[i],
    }));

    // By time of day
    const hourCounts = new Array(24).fill(0);
    for (const b of bookings) {
      if (b.start_time) {
        const hour = parseInt(b.start_time.split(":")[0], 10);
        hourCounts[hour]++;
      }
    }
    const byTimeOfDay: BookingTimeData[] = hourCounts
      .map((count, hour) => ({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        count,
      }))
      .filter((d) => d.count > 0 || (d.hour >= 7 && d.hour <= 21));

    // Top services
    const serviceMap = new Map<string, string>();
    for (const s of servicesResult.data || []) {
      serviceMap.set(s.id, s.name);
    }
    const serviceCounts = new Map<string, number>();
    for (const b of bookings) {
      if (b.service_id) {
        const name = serviceMap.get(b.service_id) || "Other";
        serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
      }
    }
    const topServices = Array.from(serviceCounts.entries())
      .map(([serviceName, count]) => ({ serviceName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format split
    const formatCounts = new Map<string, number>();
    for (const b of bookings) {
      const format = b.session_format || "other";
      formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
    }
    const formatSplit = Array.from(formatCounts.entries()).map(
      ([format, count]) => ({ format, count })
    );

    return {
      data: {
        funnel,
        avgTimeToConfirmHours,
        cancellations: {
          cancelledByMember: byMember,
          cancelledByVisitor: byVisitor,
          cancelledBySystem: bySystem,
          topReasons,
        },
        byDayOfWeek,
        byTimeOfDay,
        topServices,
        formatSplit,
      },
      error: null,
    };
  } catch (error) {
    console.error("Booking analytics error:", error);
    return { data: null, error: "Failed to load booking analytics" };
  }
}

// ============================================
// ENGAGEMENT ANALYTICS
// ============================================

export async function getEngagementAnalytics(
  days: number = 30
): Promise<{ data: EngagementAnalytics | null; error: string | null }> {
  try {
    const { supabase, profile } = await getTherapistProfile();
    if (!profile) return { data: null, error: "No therapist profile found" };

    const { startDate, prevStartDate } = getDateRange(days);

    const [
      messagesResult,
      conversationsResult,
      conversationsPrevResult,
      allConversationsResult,
      emailEventsResult,
    ] = await Promise.all([
      // Messages received from visitors in period
      supabase
        .from("messages")
        .select(
          `
          id, created_at, sender_type,
          conversations!inner(id, member_id)
        `
        )
        .eq("conversations.member_id", profile.user_id)
        .gte("created_at", startDate),
      // Conversations started current
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("member_id", profile.user_id)
        .eq("is_verified", true)
        .gte("created_at", startDate),
      // Conversations started previous
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("member_id", profile.user_id)
        .eq("is_verified", true)
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      // All conversations for conversion rate
      supabase
        .from("conversations")
        .select("id, client_id")
        .eq("member_id", profile.user_id)
        .eq("is_verified", true),
      // Email events for bookings belonging to this therapist
      supabase
        .from("email_events")
        .select("event_type, booking_id")
        .not("booking_id", "is", null)
        .gte("created_at", startDate),
    ]);

    // Message volume by day
    const messages = messagesResult.data || [];
    const visitorMessages = messages.filter(
      (m) => m.sender_type === "visitor"
    );
    const volumeMap = new Map<string, number>();

    // Initialize all dates in period
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      volumeMap.set(d.toISOString().split("T")[0], 0);
    }
    for (const m of visitorMessages) {
      const date = new Date(m.created_at!).toISOString().split("T")[0];
      if (volumeMap.has(date)) {
        volumeMap.set(date, (volumeMap.get(date) || 0) + 1);
      }
    }
    const messageVolume: MessageVolumeData[] = Array.from(
      volumeMap.entries()
    ).map(([date, count]) => ({ date, count }));

    // Average response time
    // Group messages by conversation, then find visitor→member pairs
    const convMessages = new Map<string, { created_at: string; sender_type: string }[]>();
    for (const m of messages) {
      const convId = (m.conversations as unknown as { id: string }).id;
      if (!convMessages.has(convId)) convMessages.set(convId, []);
      convMessages.get(convId)!.push({
        created_at: m.created_at!,
        sender_type: m.sender_type,
      });
    }

    const responseTimes: number[] = [];
    for (const msgs of convMessages.values()) {
      const sorted = msgs.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        if (
          sorted[i].sender_type === "visitor" &&
          sorted[i + 1].sender_type === "member"
        ) {
          const diff =
            new Date(sorted[i + 1].created_at).getTime() -
            new Date(sorted[i].created_at).getTime();
          responseTimes.push(diff / (1000 * 60)); // minutes
        }
      }
    }

    const avgResponseTimeMinutes =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : null;

    // Conversation to client conversion
    const allConvs = allConversationsResult.data || [];
    const withClient = allConvs.filter((c) => c.client_id !== null).length;
    const conversationToClientRate =
      allConvs.length > 0
        ? Math.round((withClient / allConvs.length) * 100)
        : 0;

    // Email events - filter to only this therapist's bookings
    const bookingIds = new Set(
      (
        await supabase
          .from("bookings")
          .select("id")
          .eq("therapist_profile_id", profile.id)
      ).data?.map((b) => b.id) || []
    );

    const relevantEvents = (emailEventsResult.data || []).filter((e) =>
      bookingIds.has(e.booking_id!)
    );
    let emailDelivered = 0, emailOpened = 0, emailBounced = 0;
    for (const e of relevantEvents) {
      if (e.event_type === "delivered") emailDelivered++;
      else if (e.event_type === "open") emailOpened++;
      else if (e.event_type === "bounce" || e.event_type === "dropped")
        emailBounced++;
    }

    return {
      data: {
        messageVolume,
        avgResponseTimeMinutes,
        conversationsStarted: conversationsResult.count || 0,
        conversationsStartedPrev: conversationsPrevResult.count || 0,
        conversationToClientRate,
        emailDelivered,
        emailOpened,
        emailBounced,
      },
      error: null,
    };
  } catch (error) {
    console.error("Engagement analytics error:", error);
    return { data: null, error: "Failed to load engagement analytics" };
  }
}

// ============================================
// CLIENT ANALYTICS
// ============================================

export async function getClientAnalytics(
  days: number = 30
): Promise<{ data: ClientAnalytics | null; error: string | null }> {
  try {
    const { supabase, profile } = await getTherapistProfile();
    if (!profile) return { data: null, error: "No therapist profile found" };

    const [
      clientsResult,
      sessionsResult,
      invitationsResult,
    ] = await Promise.all([
      // All clients
      supabase
        .from("clients")
        .select("id, status, onboarded_at")
        .eq("therapist_profile_id", profile.id),
      // All client sessions
      supabase
        .from("client_sessions")
        .select("id, client_id, status, rsvp_status")
        .eq("therapist_profile_id", profile.id),
      // Client invitations
      supabase
        .from("client_invitations")
        .select("id, sent_at, opened_at, completed_at, clients!inner(therapist_profile_id)")
        .eq("clients.therapist_profile_id", profile.id),
    ]);

    const clients = clientsResult.data || [];
    const sessions = sessionsResult.data || [];

    // Pipeline
    const statusCounts = new Map<string, number>();
    for (const c of clients) {
      const status = c.status || "unknown";
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }
    const pipeline: ClientPipelineData[] = [
      "invited",
      "onboarding",
      "active",
      "archived",
    ].map((status) => ({
      status,
      count: statusCounts.get(status) || 0,
    }));

    // Onboarding completion rate
    const onboarded = clients.filter((c) => c.onboarded_at !== null).length;
    const onboardingCompletionRate =
      clients.length > 0 ? Math.round((onboarded / clients.length) * 100) : 0;

    // Avg sessions per client
    const clientSessionCounts = new Map<string, number>();
    for (const s of sessions) {
      clientSessionCounts.set(
        s.client_id,
        (clientSessionCounts.get(s.client_id) || 0) + 1
      );
    }
    const avgSessionsPerClient =
      clientSessionCounts.size > 0
        ? Math.round(
            (sessions.length / clientSessionCounts.size) * 10
          ) / 10
        : 0;

    // Session completion rate
    const completed = sessions.filter((s) => s.status === "completed").length;
    const totalResolved = sessions.filter((s) =>
      ["completed", "cancelled", "no_show"].includes(s.status)
    ).length;
    const sessionCompletionRate =
      totalResolved > 0 ? Math.round((completed / totalResolved) * 100) : 0;

    // RSVP response rate
    const withRsvp = sessions.filter(
      (s) => s.rsvp_status !== null
    );
    const rsvpResponded = withRsvp.filter(
      (s) => s.rsvp_status !== "pending"
    ).length;
    const rsvpResponseRate =
      withRsvp.length > 0
        ? Math.round((rsvpResponded / withRsvp.length) * 100)
        : 0;

    // Invitation funnel
    const invitations = invitationsResult.data || [];
    const invitationFunnel = {
      sent: invitations.filter((i) => i.sent_at !== null).length,
      opened: invitations.filter((i) => i.opened_at !== null).length,
      completed: invitations.filter((i) => i.completed_at !== null).length,
    };

    return {
      data: {
        pipeline,
        onboardingCompletionRate,
        avgSessionsPerClient,
        sessionCompletionRate,
        rsvpResponseRate,
        invitationFunnel,
      },
      error: null,
    };
  } catch (error) {
    console.error("Client analytics error:", error);
    return { data: null, error: "Failed to load client analytics" };
  }
}

// ============================================
// PROFILE COMPLETION SCORE
// ============================================

export async function getProfileCompletionScore(): Promise<{
  data: ProfileCompletionScore | null;
  error: string | null;
}> {
  try {
    const { supabase, profile, user } = await getTherapistProfile();
    if (!profile || !user) return { data: null, error: "No therapist profile found" };

    const [profileResult, userResult, specsResult, servicesResult, videosResult, settingsResult] =
      await Promise.all([
        supabase
          .from("therapist_profiles")
          .select(
            "professional_title, bio, credentials, city, banner_url"
          )
          .eq("id", profile.id)
          .single(),
        supabase
          .from("users")
          .select("photo_url")
          .eq("id", user.id)
          .single(),
        supabase
          .from("therapist_specializations")
          .select("id", { count: "exact", head: true })
          .eq("therapist_profile_id", profile.id),
        supabase
          .from("therapist_services")
          .select("id", { count: "exact", head: true })
          .eq("therapist_profile_id", profile.id)
          .eq("is_active", true),
        supabase
          .from("therapist_videos")
          .select("id", { count: "exact", head: true })
          .eq("therapist_profile_id", profile.id)
          .eq("status", "published"),
        supabase
          .from("therapist_booking_settings")
          .select("accepts_online_booking")
          .eq("therapist_profile_id", profile.id)
          .single(),
      ]);

    const p = profileResult.data;
    const u = userResult.data;

    const items: ProfileCompletionItem[] = [
      {
        label: "Profile photo",
        completed: !!u?.photo_url,
        weight: 15,
        actionHref: "/dashboard/settings?tab=account",
        actionLabel: "Add photo",
      },
      {
        label: "Professional title",
        completed: !!p?.professional_title,
        weight: 10,
        actionHref: "/dashboard/practice",
        actionLabel: "Add title",
      },
      {
        label: "Bio (100+ characters)",
        completed: !!p?.bio && p.bio.length > 100,
        weight: 15,
        actionHref: "/dashboard/practice",
        actionLabel: "Write bio",
      },
      {
        label: "Credentials",
        completed: !!p?.credentials && p.credentials.length > 0,
        weight: 10,
        actionHref: "/dashboard/practice",
        actionLabel: "Add credentials",
      },
      {
        label: "Specialisations (3+)",
        completed: (specsResult.count || 0) >= 3,
        weight: 10,
        actionHref: "/dashboard/practice",
        actionLabel: "Add specialisations",
      },
      {
        label: "Location",
        completed: !!p?.city,
        weight: 5,
        actionHref: "/dashboard/practice",
        actionLabel: "Add location",
      },
      {
        label: "At least 1 active service",
        completed: (servicesResult.count || 0) >= 1,
        weight: 15,
        actionHref: "/dashboard/practice",
        actionLabel: "Create service",
      },
      {
        label: "Banner image",
        completed: !!p?.banner_url,
        weight: 5,
        actionHref: "/dashboard/practice",
        actionLabel: "Upload banner",
      },
      {
        label: "Video content",
        completed: (videosResult.count || 0) >= 1,
        weight: 10,
        actionHref: "/dashboard/practice",
        actionLabel: "Upload video",
      },
      {
        label: "Online booking enabled",
        completed: settingsResult.data?.accepts_online_booking === true,
        weight: 5,
        actionHref: "/dashboard/schedule",
        actionLabel: "Enable booking",
      },
    ];

    const score = items
      .filter((i) => i.completed)
      .reduce((sum, i) => sum + i.weight, 0);

    return { data: { score, items }, error: null };
  } catch (error) {
    console.error("Profile completion score error:", error);
    return { data: null, error: "Failed to load profile completion score" };
  }
}

// ============================================
// AUTOMATED INSIGHTS
// ============================================

export async function getAnalyticsInsights(
  days: number = 30
): Promise<{ data: AnalyticsInsight[]; error: string | null }> {
  try {
    const { supabase, profile } = await getTherapistProfile();
    if (!profile) return { data: [], error: "No therapist profile found" };

    const insights: AnalyticsInsight[] = [];
    const { startDate, prevStartDate } = getDateRange(days);

    // Fetch data for insights
    const [
      bookingsCurrent,
      bookingsPrev,
      messagesCurrent,
      messagesPrev,
      cancelledResult,
      clientsResult,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, booking_date, start_time", { count: "exact" })
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", startDate),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("therapist_profile_id", profile.id)
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      supabase
        .from("messages")
        .select("id, conversations!inner(member_id)", { count: "exact" })
        .eq("conversations.member_id", profile.user_id)
        .eq("sender_type", "visitor")
        .gte("created_at", startDate),
      supabase
        .from("messages")
        .select("id, conversations!inner(member_id)", { count: "exact" })
        .eq("conversations.member_id", profile.user_id)
        .eq("sender_type", "visitor")
        .gte("created_at", prevStartDate)
        .lt("created_at", startDate),
      supabase
        .from("bookings")
        .select("cancelled_by, cancellation_reason")
        .eq("therapist_profile_id", profile.id)
        .eq("status", "cancelled")
        .gte("created_at", startDate),
      supabase
        .from("clients")
        .select("id, status")
        .eq("therapist_profile_id", profile.id),
    ]);

    const currentBookingCount = bookingsCurrent.count || 0;
    const prevBookingCount = bookingsPrev.count || 0;
    const currentMsgCount = messagesCurrent.count || 0;
    const prevMsgCount = messagesPrev.count || 0;

    // Booking trend insight
    if (prevBookingCount > 0 && currentBookingCount > 0) {
      const change = Math.round(
        ((currentBookingCount - prevBookingCount) / prevBookingCount) * 100
      );
      if (change > 20) {
        insights.push({
          id: "booking-trend-up",
          type: "positive",
          title: "Bookings are growing",
          description: `You received ${change}% more bookings compared to the previous ${days} days. Keep up the great work!`,
        });
      } else if (change < -20) {
        insights.push({
          id: "booking-trend-down",
          type: "negative",
          title: "Bookings have decreased",
          description: `Bookings are down ${Math.abs(change)}% compared to the previous ${days} days. Consider updating your profile or services to attract more visitors.`,
        });
      }
    }

    // Message trend insight
    if (prevMsgCount > 0 && currentMsgCount > 0) {
      const change = Math.round(
        ((currentMsgCount - prevMsgCount) / prevMsgCount) * 100
      );
      if (change > 20) {
        insights.push({
          id: "message-trend-up",
          type: "positive",
          title: "Enquiries are increasing",
          description: `You received ${change}% more messages this period. Your profile is attracting attention.`,
        });
      }
    }

    // Busiest day insight
    const bookings = bookingsCurrent.data || [];
    if (bookings.length >= 3) {
      const dayCounts = new Map<number, number>();
      for (const b of bookings) {
        if (b.booking_date) {
          const day = new Date(b.booking_date + "T00:00:00").getDay();
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        }
      }
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let busiestDay = 0, maxCount = 0;
      for (const [day, count] of dayCounts) {
        if (count > maxCount) {
          busiestDay = day;
          maxCount = count;
        }
      }
      if (maxCount >= 2) {
        insights.push({
          id: "busiest-day",
          type: "neutral",
          title: `${dayNames[busiestDay]} is your busiest day`,
          description: `You received ${maxCount} bookings on ${dayNames[busiestDay]}s. Make sure you have plenty of availability on this day.`,
        });
      }
    }

    // Cancellation insight
    const cancelled = cancelledResult.data || [];
    if (cancelled.length >= 2) {
      const byVisitor = cancelled.filter((c) => c.cancelled_by === "visitor").length;
      if (byVisitor > cancelled.length / 2) {
        insights.push({
          id: "cancellation-visitors",
          type: "negative",
          title: `${cancelled.length} cancellations this period`,
          description: `${byVisitor} were cancelled by visitors. Consider sending reminders or requiring confirmation to reduce no-shows.`,
        });
      }
    }

    // New therapist encouragement
    const clients = clientsResult.data || [];
    const activeClients = clients.filter((c) => c.status === "active").length;
    if (activeClients === 0 && currentBookingCount > 0) {
      insights.push({
        id: "first-clients",
        type: "tip",
        title: "Convert bookings to clients",
        description:
          "You have bookings but no active clients yet. After a successful intro call, invite them as a client to manage their sessions and notes.",
      });
    }

    // Profile completeness tip
    if (insights.length < 4) {
      insights.push({
        id: "profile-tip",
        type: "tip",
        title: "Complete your profile",
        description:
          "Therapists with complete profiles (photo, bio, services, and videos) receive up to 3x more enquiries. Check your profile score above.",
      });
    }

    return { data: insights.slice(0, 4), error: null };
  } catch (error) {
    console.error("Analytics insights error:", error);
    return { data: [], error: "Failed to load insights" };
  }
}

// ============================================
// PROFILE VIEWS OVER TIME (Phase 2)
// ============================================

export interface ProfileViewTrendData {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export async function getProfileViewTrends(
  days: number = 30
): Promise<{ data: ProfileViewTrendData[]; error: string | null }> {
  try {
    const { supabase, profile } = await getTherapistProfile();
    if (!profile) return { data: [], error: "No therapist profile found" };

    const { startDate } = getDateRange(days);

    const { data: events } = await supabase
      .from("profile_events")
      .select("created_at, visitor_hash")
      .eq("therapist_profile_id", profile.id)
      .eq("event_type", "profile_view")
      .gte("created_at", startDate);

    // Build date map
    const dateMap = new Map<string, { views: number; visitors: Set<string> }>();
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      dateMap.set(d.toISOString().split("T")[0], { views: 0, visitors: new Set() });
    }

    for (const e of events || []) {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      if (dateMap.has(date)) {
        const entry = dateMap.get(date)!;
        entry.views++;
        if (e.visitor_hash) entry.visitors.add(e.visitor_hash);
      }
    }

    const data: ProfileViewTrendData[] = Array.from(dateMap.entries()).map(
      ([date, { views, visitors }]) => ({
        date,
        views,
        uniqueVisitors: visitors.size,
      })
    );

    return { data, error: null };
  } catch (error) {
    console.error("Profile view trends error:", error);
    return { data: [], error: "Failed to load profile view trends" };
  }
}

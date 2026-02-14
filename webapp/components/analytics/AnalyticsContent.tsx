"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OverviewCards } from "./OverviewCards";
import { BookingFunnel } from "./BookingFunnel";
import { BookingsByDayChart } from "./BookingsByDayChart";
import { BookingsByTimeChart } from "./BookingsByTimeChart";
import { ResponseTimeChart } from "./ResponseTimeChart";
import { MessageVolumeChart } from "./MessageVolumeChart";
import { ClientPipelineChart } from "./ClientPipelineChart";
import { TopServicesTable } from "./TopServicesTable";
import { ProfileScoreCard } from "./ProfileScoreCard";
import { InsightsCards } from "./InsightsCards";
import { ProfileViewsChart } from "./ProfileViewsChart";
import { InvitationFunnelChart } from "./InvitationFunnelChart";
import type {
  AnalyticsOverview,
  BookingAnalytics,
  EngagementAnalytics,
  ClientAnalytics,
  ProfileCompletionScore,
  AnalyticsInsight,
  ProfileViewTrendData,
} from "@/app/actions/analytics";

interface AnalyticsContentProps {
  overview: AnalyticsOverview;
  bookings: BookingAnalytics;
  engagement: EngagementAnalytics;
  clients: ClientAnalytics;
  profileScore: ProfileCompletionScore;
  insights: AnalyticsInsight[];
  profileViews: ProfileViewTrendData[];
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "engagement", label: "Engagement" },
  { id: "clients", label: "Clients" },
];

export function AnalyticsContent({
  overview,
  bookings,
  engagement,
  clients,
  profileScore,
  insights,
  profileViews,
}: AnalyticsContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-6">
        <div className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <OverviewCards data={overview} showVisibility={overview.profileViews > 0 || overview.searchImpressions > 0} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileScoreCard data={profileScore} />
            <ProfileViewsChart data={profileViews} />
          </div>

          <InsightsCards insights={insights} />
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-6">
          {/* Summary cards for bookings tab */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {bookings.funnel.pending + bookings.funnel.verified + bookings.funnel.confirmed + bookings.funnel.completed + bookings.funnel.cancelled + bookings.funnel.noShow}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {bookings.funnel.confirmed + bookings.funnel.completed}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Confirm Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {bookings.avgTimeToConfirmHours !== null
                  ? bookings.avgTimeToConfirmHours < 1
                    ? `${Math.round(bookings.avgTimeToConfirmHours * 60)}m`
                    : `${bookings.avgTimeToConfirmHours}h`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancellations</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {bookings.funnel.cancelled}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookingFunnel data={bookings.funnel} />
            <TopServicesTable data={bookings.topServices} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookingsByDayChart data={bookings.byDayOfWeek} />
            <BookingsByTimeChart data={bookings.byTimeOfDay} />
          </div>

          {/* Cancellation breakdown */}
          {bookings.cancellations.cancelledByMember + bookings.cancellations.cancelledByVisitor > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cancellation Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">By You</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bookings.cancellations.cancelledByMember}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">By Visitor</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bookings.cancellations.cancelledByVisitor}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">System</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bookings.cancellations.cancelledBySystem}
                  </p>
                </div>
              </div>
              {bookings.cancellations.topReasons.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Top Reasons:
                  </p>
                  <ul className="space-y-1">
                    {bookings.cancellations.topReasons.map((r, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                        &ldquo;{r.reason}&rdquo;
                        <span className="text-gray-400 dark:text-gray-500 ml-1">
                          ({r.count})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Session format split */}
          {bookings.formatSplit.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Session Format
              </h3>
              <div className="flex gap-6">
                {bookings.formatSplit.map((f) => (
                  <div key={f.format} className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {f.count}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {f.format}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "engagement" && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {engagement.conversationsStarted}
              </p>
              {engagement.conversationsStartedPrev > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  vs {engagement.conversationsStartedPrev} prev. period
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {engagement.conversationToClientRate}%
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Conversations to clients
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Emails Delivered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {engagement.emailDelivered}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Emails Opened</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {engagement.emailOpened}
              </p>
              {engagement.emailDelivered > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {Math.round((engagement.emailOpened / engagement.emailDelivered) * 100)}% open rate
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponseTimeChart avgResponseTimeMinutes={engagement.avgResponseTimeMinutes} />
            <MessageVolumeChart data={engagement.messageVolume} />
          </div>
        </div>
      )}

      {activeTab === "clients" && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Onboarding Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {clients.onboardingCompletionRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Sessions/Client</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {clients.avgSessionsPerClient}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Session Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {clients.sessionCompletionRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">RSVP Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {clients.rsvpResponseRate}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientPipelineChart data={clients.pipeline} />
            <InvitationFunnelChart data={clients.invitationFunnel} />
          </div>
        </div>
      )}
    </div>
  );
}

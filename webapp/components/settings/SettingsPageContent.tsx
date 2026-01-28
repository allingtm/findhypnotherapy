"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountSection } from "@/components/therapist-profile/sections/AccountSection";
import { TermsEditor } from "@/components/settings/TermsEditor";
import { BookingSettingsForm } from "@/components/availability/BookingSettingsForm";
import { BillingSection } from "./BillingSection";
import {
  IconSettings,
  IconUser,
  IconFileText,
  IconCreditCard,
  IconCalendarCog,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  photo_url?: string | null;
}

interface BookingSettings {
  id: string;
  therapist_profile_id: string;
  slot_duration_minutes: number;
  buffer_minutes: number | null;
  min_booking_notice_hours: number | null;
  max_booking_days_ahead: number | null;
  timezone: string;
  requires_approval: boolean | null;
  accepts_online_booking: boolean | null;
  google_calendar_connected: boolean | null;
  microsoft_calendar_connected: boolean | null;
  zoom_connected: boolean | null;
  send_visitor_reminders: boolean | null;
  send_therapist_reminders: boolean | null;
  video_platform_preference: string | null;
  default_video_link: string | null;
}

interface Subscription {
  id: string;
  status: string;
  plan_name: string | null;
  current_period_end: string | null;
  trial_end: string | null;
}

interface SettingsPageContentProps {
  user: User;
  bookingSettings: BookingSettings;
  subscription: Subscription | null;
}

type TabKey = "account" | "terms" | "billing" | "booking";

const tabs: { key: TabKey; label: string; icon: typeof IconUser }[] = [
  { key: "account", label: "Account", icon: IconUser },
  { key: "terms", label: "Terms", icon: IconFileText },
  { key: "billing", label: "Billing", icon: IconCreditCard },
  { key: "booking", label: "Booking Settings", icon: IconCalendarCog },
];

export function SettingsPageContent({
  user,
  bookingSettings,
  subscription,
}: SettingsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "account"
  );

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTab === "account") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    const newUrl = params.toString()
      ? `/dashboard/settings?${params.toString()}`
      : "/dashboard/settings";
    router.replace(newUrl, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Listen for URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabKey;
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("account");
    }
  }, [searchParams]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <IconSettings className="w-8 h-8 text-gray-700 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl">
        {activeTab === "account" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your account settings and profile
            </p>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
              <AccountSection user={user} />
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create and manage your terms and conditions for clients
            </p>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
              <TermsEditor />
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your subscription and billing information
            </p>
            <BillingSection subscription={subscription} />
          </div>
        )}

        {activeTab === "booking" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure how bookings work on your profile
            </p>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
              <BookingSettingsForm settings={bookingSettings} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

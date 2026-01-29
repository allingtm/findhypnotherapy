"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientList } from "./ClientList";
import { ConversationList } from "@/components/messages/ConversationList";
import { BookingRequestsList } from "./BookingRequestsList";
import {
  IconUsers,
  IconMessageCircle,
  IconCalendarCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { CLIENTS_HELP } from "./clientsHelpContent";

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  is_blocked: boolean;
  unreadCount: number;
  lastMessage: {
    content: string;
    senderType: string;
    createdAt: string;
  } | null;
  totalMessages: number;
  messagesLast30Days: number;
  needsAttention: boolean;
}

type EmailDeliveryStatus = "sent" | "delivered" | "opened" | "failed";

interface BookingRequest {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  session_format: string | null;
  visitor_notes: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
  service?: {
    name: string;
  } | null;
  verificationEmailStatus?: EmailDeliveryStatus;
  notificationEmailStatus?: EmailDeliveryStatus;
  confirmationEmailStatus?: EmailDeliveryStatus;
}

interface ClientsPageContentProps {
  conversations: Conversation[];
  pendingBookings: BookingRequest[];
  unreadCount: number;
  pendingCount: number;
}

type TabKey = "all" | "inquiries" | "requests";

const tabs: { key: TabKey; label: string; icon: typeof IconUsers }[] = [
  { key: "all", label: "All Clients", icon: IconUsers },
  { key: "inquiries", label: "Enquiries", icon: IconMessageCircle },
  { key: "requests", label: "Intro Calls", icon: IconCalendarCheck },
];

export function ClientsPageContent({
  conversations,
  pendingBookings,
  unreadCount,
  pendingCount,
}: ClientsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "all"
  );

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    const newUrl = params.toString()
      ? `/dashboard/clients?${params.toString()}`
      : "/dashboard/clients";
    router.replace(newUrl, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Listen for URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabKey;
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("all");
    }
  }, [searchParams]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <IconUsers className="w-8 h-8 text-gray-700 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Clients
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count =
              tab.key === "inquiries"
                ? unreadCount
                : tab.key === "requests"
                ? pendingCount
                : 0;

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
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1 px-2 py-0.5 text-xs font-semibold rounded-full",
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl">
        {activeTab === "all" && <ClientList />}

        {activeTab === "inquiries" && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <SectionHeader
                title="Enquiries"
                helpTitle={CLIENTS_HELP.enquiries.title}
                helpContent={CLIENTS_HELP.enquiries.content}
                icon={<IconMessageCircle className="w-5 h-5" />}
              />
            </div>
            <ConversationList conversations={conversations} />
          </div>
        )}

        {activeTab === "requests" && (
          <BookingRequestsList bookings={pendingBookings} />
        )}
      </div>
    </div>
  );
}

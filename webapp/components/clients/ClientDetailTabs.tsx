"use client";

import { useState } from "react";
import { IconCalendarEvent, IconMail, IconNotes, IconUser } from "@tabler/icons-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "sessions", label: "Sessions", icon: IconCalendarEvent },
  { id: "messages", label: "Messages", icon: IconMail },
  { id: "notes", label: "Notes", icon: IconNotes },
  { id: "details", label: "Details", icon: IconUser },
];

interface ClientDetailTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ClientDetailTabs({ activeTab, onTabChange }: ClientDetailTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-neutral-700">
      <nav className="flex gap-4 overflow-x-auto" aria-label="Tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { InviteClientDialog } from "@/components/clients/InviteClientDialog";
import {
  IconUserPlus,
  IconCalendarPlus,
  IconEye,
  IconBolt,
} from "@tabler/icons-react";
import { SectionHeader } from "./SectionHeader";
import { DASHBOARD_HELP } from "./helpContent";

interface QuickActionsProps {
  profileSlug?: string | null;
}

export function QuickActions({ profileSlug }: QuickActionsProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const actions = [
    {
      icon: IconUserPlus,
      label: "Invite Client",
      description: "Send an invitation to a new client",
      onClick: () => setShowInviteDialog(true),
    },
    {
      icon: IconCalendarPlus,
      label: "Block Time",
      description: "Mark time as unavailable",
      href: "/dashboard/availability",
    },
    {
      icon: IconEye,
      label: "View Profile",
      description: "See your public listing",
      href: profileSlug ? `/directory/${profileSlug}` : "/dashboard/profile",
      external: !!profileSlug,
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-5">
      <SectionHeader
        title="Quick Actions"
        helpTitle={DASHBOARD_HELP.quickActions.title}
        helpContent={DASHBOARD_HELP.quickActions.content}
        icon={<IconBolt className="w-5 h-5" />}
        className="mb-4"
      />

      <div className="space-y-2">
        {actions.map((action, idx) => {
          const Icon = action.icon;

          if (action.onClick) {
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          }

          if (action.external) {
            return (
              <a
                key={idx}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </a>
            );
          }

          return (
            <Link
              key={idx}
              href={action.href!}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <InviteClientDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onSuccess={() => setShowInviteDialog(false)}
      />
    </div>
  );
}

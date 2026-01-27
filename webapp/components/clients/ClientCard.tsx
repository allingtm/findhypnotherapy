"use client";

import Link from "next/link";
import {
  IconMail,
  IconCalendarEvent,
  IconDots,
  IconArchive,
  IconRefresh,
  IconUserCheck,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import { resendClientInvitationAction, archiveClientAction } from "@/app/actions/clients";

interface ClientCardProps {
  client: {
    id: string;
    slug: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    status: string;
    created_at: string;
    onboarded_at: string | null;
    session_count?: number;
    last_session_date?: string | null;
  };
  onUpdate?: () => void;
}

export function ClientCard({ client, onUpdate }: ClientCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const name =
    client.first_name || client.last_name
      ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
      : null;

  const getStatusBadge = () => {
    switch (client.status) {
      case "invited":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <IconClock className="w-3 h-3" />
            Invited
          </span>
        );
      case "onboarding":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <IconAlertCircle className="w-3 h-3" />
            Onboarding
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <IconUserCheck className="w-3 h-3" />
            Active
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-400">
            <IconArchive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const handleResendInvitation = async () => {
    setIsLoading(true);
    setShowMenu(false);
    try {
      await resendClientInvitationAction(client.id);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to resend invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    setIsLoading(true);
    setShowMenu(false);
    try {
      await archiveClientAction(client.id);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to archive client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <Link
          href={`/dashboard/clients/${client.slug}`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {(name || client.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {name || "Pending"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {client.email}
              </p>
            </div>
          </div>
        </Link>

        {/* Status & Menu */}
        <div className="flex items-center gap-2 ml-4">
          {getStatusBadge()}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={isLoading}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconDots className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-20 min-w-[160px]">
                  {client.status === "invited" && (
                    <button
                      onClick={handleResendInvitation}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    >
                      <IconRefresh className="w-4 h-4" />
                      Resend Invitation
                    </button>
                  )}
                  {client.status === "active" && (
                    <Link
                      href={`/dashboard/clients/${client.slug}?tab=sessions`}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <IconCalendarEvent className="w-4 h-4" />
                      Add Session
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/clients/${client.slug}?tab=messages`}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    onClick={() => setShowMenu(false)}
                  >
                    <IconMail className="w-4 h-4" />
                    Send Message
                  </Link>
                  {client.status !== "archived" && (
                    <button
                      onClick={handleArchive}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    >
                      <IconArchive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row for active clients */}
      {client.status === "active" && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent className="w-4 h-4" />
            <span>
              {client.session_count || 0} session{(client.session_count || 0) !== 1 ? "s" : ""}
            </span>
          </div>
          {client.last_session_date && (
            <div>
              Last session:{" "}
              {new Date(client.last_session_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </div>
          )}
        </div>
      )}

      {/* Onboarded date for active clients */}
      {client.status === "active" && client.onboarded_at && (
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Client since{" "}
          {new Date(client.onboarded_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}

      {/* Invited date for pending clients */}
      {client.status === "invited" && (
        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Invited{" "}
          {new Date(client.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}
    </div>
  );
}

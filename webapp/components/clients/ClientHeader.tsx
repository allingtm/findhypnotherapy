"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconArrowLeft,
  IconArchive,
  IconArchiveOff,
  IconDots,
  IconMail,
  IconUserCheck,
  IconClock,
  IconAlertCircle,
  IconDeviceDesktop,
  IconCheck,
} from "@tabler/icons-react";
import { archiveClientAction, restoreClientAction, migrateClientToPortalAction } from "@/app/actions/clients";
import { toast } from "sonner";

interface ClientHeaderProps {
  client: {
    id: string;
    slug: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    status: string;
    onboarded_at: string | null;
    client_account_id: string | null;
  };
  onUpdate: () => void;
}

export function ClientHeader({ client, onUpdate }: ClientHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const name =
    client.first_name || client.last_name
      ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
      : "Pending";

  const getStatusBadge = () => {
    switch (client.status) {
      case "invited":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <IconClock className="w-4 h-4" />
            Invitation Pending
          </span>
        );
      case "onboarding":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <IconAlertCircle className="w-4 h-4" />
            Onboarding
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <IconUserCheck className="w-4 h-4" />
            Active Client
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-400">
            <IconArchive className="w-4 h-4" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const handleArchive = async () => {
    setIsLoading(true);
    setShowMenu(false);
    try {
      await archiveClientAction(client.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to archive client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setShowMenu(false);
    try {
      await restoreClientAction(client.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to restore client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnablePortal = async () => {
    setIsLoading(true);
    setShowMenu(false);
    try {
      const result = await migrateClientToPortalAction(client.id, true);
      if (result.success) {
        toast.success("Portal access enabled! Client will receive a welcome email.");
        onUpdate();
      } else {
        toast.error(result.error || "Failed to enable portal access");
      }
    } catch (error) {
      console.error("Failed to enable portal:", error);
      toast.error("Failed to enable portal access");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6 relative">
      {/* More menu - top right */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
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
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-20 min-w-[180px]">
                <a
                  href={`mailto:${client.email}`}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                  onClick={() => setShowMenu(false)}
                >
                  <IconMail className="w-4 h-4" />
                  Send Email
                </a>
                {client.status === "active" && !client.client_account_id && (
                  <button
                    onClick={handleEnablePortal}
                    className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <IconDeviceDesktop className="w-4 h-4" />
                    Enable Portal Access
                  </button>
                )}
                {client.status === "active" && client.client_account_id && (
                  <div className="px-4 py-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <IconCheck className="w-4 h-4" />
                    Portal Enabled
                  </div>
                )}
                {client.status === "archived" ? (
                  <button
                    onClick={handleRestore}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <IconArchiveOff className="w-4 h-4" />
                    Restore Client
                  </button>
                ) : (
                  <button
                    onClick={handleArchive}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <IconArchive className="w-4 h-4" />
                    Archive Client
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Back Link & Avatar */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients"
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <IconArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-xl">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Name & Email */}
        <div className="flex-1 min-w-0 pr-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {name}
            </h1>
            {getStatusBadge()}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{client.email}</p>
          {client.status === "active" && client.onboarded_at && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Client since{" "}
              {new Date(client.onboarded_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

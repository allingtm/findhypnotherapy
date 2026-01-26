"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { disconnectCalendarAction } from "@/app/actions/availability";
import { IconBrandGoogle, IconBrandWindows, IconBrandZoom, IconCheck, IconX } from "@tabler/icons-react";

interface CalendarConnection {
  provider: string;
  is_active: boolean | null;
  sync_error: string | null;
}

interface CalendarSyncStatusProps {
  connections: CalendarConnection[];
  googleConnectUrl?: string;
  microsoftConnectUrl?: string;
}

export function CalendarSyncStatus({
  connections,
  googleConnectUrl = "/api/calendar/google/connect",
  microsoftConnectUrl = "/api/calendar/microsoft/connect",
}: CalendarSyncStatusProps) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showZoomComingSoon, setShowZoomComingSoon] = useState(false);

  const googleConnection = connections.find((c) => c.provider === "google");
  const microsoftConnection = connections.find((c) => c.provider === "microsoft");

  const handleDisconnect = async (provider: "google" | "microsoft" | "zoom") => {
    setDisconnecting(provider);
    setError(null);
    setSuccess(null);

    try {
      const result = await disconnectCalendarAction(provider);
      if (result.success) {
        const providerName = provider === "google" ? "Google Calendar" : provider === "microsoft" ? "Outlook" : "Zoom";
        setSuccess(`${providerName} disconnected successfully`);
      } else {
        setError(result.error || "Failed to disconnect calendar");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Calendar Sync
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Connect your calendar to prevent double-bookings
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Google Calendar */}
        <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <IconBrandGoogle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Google Calendar
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gmail, Google Workspace
              </p>
            </div>
          </div>

          {googleConnection?.is_active ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <IconCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>

              {googleConnection.sync_error && (
                <p className="text-xs text-red-500">{googleConnection.sync_error}</p>
              )}

              <Button
                variant="secondary"
                onClick={() => handleDisconnect("google")}
                loading={disconnecting === "google"}
                className="w-full text-sm"
              >
                <IconX className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          ) : microsoftConnection?.is_active ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Disconnect Outlook to use Google Calendar
            </p>
          ) : (
            <a
              href={googleConnectUrl}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Connect Google Calendar
            </a>
          )}
        </div>

        {/* Microsoft Outlook */}
        <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <IconBrandWindows className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Microsoft Outlook
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Outlook, Office 365, Hotmail
              </p>
            </div>
          </div>

          {microsoftConnection?.is_active ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <IconCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>

              {microsoftConnection.sync_error && (
                <p className="text-xs text-red-500">{microsoftConnection.sync_error}</p>
              )}

              <Button
                variant="secondary"
                onClick={() => handleDisconnect("microsoft")}
                loading={disconnecting === "microsoft"}
                className="w-full text-sm"
              >
                <IconX className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          ) : googleConnection?.is_active ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Disconnect Google Calendar to use Outlook
            </p>
          ) : (
            <a
              href={microsoftConnectUrl}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Connect Outlook
            </a>
          )}
        </div>

        {/* Zoom */}
        <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <IconBrandZoom className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Zoom
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate unique meeting links
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowZoomComingSoon(true)}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Connect Zoom
          </button>
        </div>
      </div>

      {/* Zoom Coming Soon Dialog */}
      {showZoomComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <IconBrandZoom className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Coming Soon
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Zoom integration is coming soon! In the meantime, you can use the &quot;Personal Meeting Link&quot; option in your booking settings to include your Zoom room link in booking confirmations.
            </p>
            <Button
              onClick={() => setShowZoomComingSoon(false)}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        We check your calendar availability and create events for confirmed bookings.
        We only read free/busy times, not your event details.
      </p>
    </div>
  );
}

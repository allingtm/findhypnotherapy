"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  confirmBookingAction,
  cancelBookingAction,
} from "@/app/actions/bookings";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconCheck,
  IconChecks,
  IconX,
  IconVideo,
  IconMapPin,
  IconPhone,
  IconMail,
  IconNote,
  IconInbox,
  IconEye,
  IconAlertCircle,
} from "@tabler/icons-react";

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

function EmailStatusBadge({
  status,
  label,
}: {
  status: EmailDeliveryStatus | undefined;
  label: string;
}) {
  if (!status) return null;

  const config = {
    sent: {
      icon: IconCheck,
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      text: `${label} Sent`,
    },
    delivered: {
      icon: IconChecks,
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      text: `${label} Delivered`,
    },
    opened: {
      icon: IconEye,
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      text: `${label} Opened`,
    },
    failed: {
      icon: IconAlertCircle,
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      text: `${label} Failed`,
    },
  };

  const { icon: Icon, className, text } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${className}`}
    >
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

interface BookingRequestsListProps {
  bookings: BookingRequest[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function FormatIcon({ format }: { format: string | null }) {
  switch (format) {
    case "online":
      return <IconVideo className="w-4 h-4 text-blue-500" />;
    case "in-person":
      return <IconMapPin className="w-4 h-4 text-green-500" />;
    case "phone":
      return <IconPhone className="w-4 h-4 text-purple-500" />;
    default:
      return null;
  }
}

export function BookingRequestsList({ bookings }: BookingRequestsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localBookings, setLocalBookings] = useState(bookings);

  const handleConfirm = async (bookingId: string) => {
    setLoadingId(bookingId);
    try {
      const result = await confirmBookingAction(bookingId);
      if (result.success) {
        // Remove from list after confirmation
        setLocalBookings((prev) => prev.filter((b) => b.id !== bookingId));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to confirm booking:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }
    setLoadingId(bookingId);
    try {
      const result = await cancelBookingAction(bookingId, "Declined by therapist");
      if (result.success) {
        setLocalBookings((prev) => prev.filter((b) => b.id !== bookingId));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setLoadingId(null);
    }
  };

  if (localBookings.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
          <IconInbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No pending booking requests
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          When visitors request appointments through your profile, they will
          appear here for your approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {localBookings.length} booking request{localBookings.length !== 1 ? "s" : ""}{" "}
        awaiting your confirmation
      </p>

      {localBookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <IconUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {booking.visitor_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {booking.visitor_email}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  booking.is_verified
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                }`}
              >
                {booking.is_verified ? "Verified" : "Awaiting Verification"}
              </span>
              {!booking.is_verified && booking.verificationEmailStatus && (
                <EmailStatusBadge
                  status={booking.verificationEmailStatus}
                  label="Email"
                />
              )}
              {booking.is_verified && booking.notificationEmailStatus && (
                <EmailStatusBadge
                  status={booking.notificationEmailStatus}
                  label="Notification"
                />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <IconCalendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {formatDate(booking.booking_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IconClock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </span>
            </div>
            {booking.session_format && (
              <div className="flex items-center gap-2 text-sm">
                <FormatIcon format={booking.session_format} />
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {booking.session_format}
                </span>
              </div>
            )}
            {booking.service?.name && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {booking.service.name}
                </span>
              </div>
            )}
          </div>

          {/* Phone */}
          {booking.visitor_phone && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <IconPhone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {booking.visitor_phone}
              </span>
            </div>
          )}

          {/* Notes */}
          {booking.visitor_notes && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg">
              <div className="flex items-start gap-2">
                <IconNote className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {booking.visitor_notes}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
            {booking.is_verified ? (
              <>
                <Button
                  onClick={() => handleConfirm(booking.id)}
                  disabled={loadingId === booking.id}
                  className="flex items-center gap-2"
                >
                  <IconCheck className="w-4 h-4" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCancel(booking.id)}
                  disabled={loadingId === booking.id}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                >
                  <IconX className="w-4 h-4" />
                  Decline
                </Button>
              </>
            ) : (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Waiting for visitor to verify their email address
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

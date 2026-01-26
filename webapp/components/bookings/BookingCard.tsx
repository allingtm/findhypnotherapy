"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { confirmBookingAction, cancelBookingAction } from "@/app/actions/bookings";
import { getOrCreateConversationFromBooking } from "@/app/actions/messages";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconMessage,
  IconPhone,
  IconCheck,
  IconX,
  IconVideo,
} from "@tabler/icons-react";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_format: string | null;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  visitor_notes: string | null;
  status: string;
  is_verified: boolean | null;
  created_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  meeting_url: string | null;
}

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: () => void;
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

function getStatusBadge(status: string, isVerified: boolean | null) {
  if (status === "pending" && !isVerified) {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
        Awaiting Verification
      </span>
    );
  }

  switch (status) {
    case "pending":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
          Pending
        </span>
      );
    case "confirmed":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
          Confirmed
        </span>
      );
    case "cancelled":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
          Cancelled
        </span>
      );
    case "completed":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-full">
          Completed
        </span>
      );
    case "no_show":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full">
          No Show
        </span>
      );
    default:
      return null;
  }
}

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      const result = await confirmBookingAction(booking.id);
      if (result.success) {
        onStatusChange?.();
      } else {
        setError(result.error || "Failed to confirm booking");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const result = await cancelBookingAction(booking.id);
      if (result.success) {
        onStatusChange?.();
      } else {
        setError(result.error || "Failed to cancel booking");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleStartConversation = async () => {
    setIsStartingConversation(true);
    setError(null);

    try {
      const result = await getOrCreateConversationFromBooking(
        booking.visitor_email,
        booking.visitor_name
      );
      if (result.success && result.conversationId) {
        router.push(`/dashboard/messages/${result.conversationId}`);
      } else {
        setError(result.error || "Failed to start conversation");
        setIsStartingConversation(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsStartingConversation(false);
    }
  };

  const canConfirm = booking.status === "pending" && booking.is_verified;
  const canCancel =
    booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <IconUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {booking.visitor_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {booking.visitor_email}
            </p>
          </div>
        </div>
        {getStatusBadge(booking.status, booking.is_verified)}
      </div>

      <div className="grid gap-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <IconCalendar className="w-4 h-4" />
          <span>{formatDate(booking.booking_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <IconClock className="w-4 h-4" />
          <span>
            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
          </span>
        </div>
        {booking.visitor_phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <IconPhone className="w-4 h-4" />
            <span>{booking.visitor_phone}</span>
          </div>
        )}
        {booking.status === "confirmed" &&
          booking.session_format === "online" &&
          booking.meeting_url && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <IconVideo className="w-4 h-4" />
              <a
                href={booking.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Join Video Session
              </a>
            </div>
          )}
      </div>

      {booking.visitor_notes && (
        <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {booking.visitor_notes}
          </p>
        </div>
      )}

      {booking.status === "cancelled" && booking.cancellation_reason && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>Cancellation reason:</strong> {booking.cancellation_reason}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {(canConfirm || canCancel) && (
        <div className="flex gap-2">
          {canConfirm && (
            <Button
              onClick={handleConfirm}
              loading={isConfirming}
              disabled={isCancelling}
              className="flex-1"
            >
              <IconCheck className="w-4 h-4 mr-1" />
              Confirm
            </Button>
          )}
          {canCancel && (
            <Button
              variant="secondary"
              onClick={handleCancel}
              loading={isCancelling}
              disabled={isConfirming}
              className={canConfirm ? "" : "flex-1"}
            >
              <IconX className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Contact link for confirmed bookings */}
      {booking.status === "confirmed" && (
        <button
          onClick={handleStartConversation}
          disabled={isStartingConversation}
          className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <IconMessage className="w-4 h-4" />
          {isStartingConversation ? "Opening..." : "Send Message"}
        </button>
      )}
    </div>
  );
}

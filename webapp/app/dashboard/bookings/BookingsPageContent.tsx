"use client";

import React, { useState, useCallback } from "react";
import { BookingCard } from "@/components/bookings/BookingCard";
import { getBookingsForMember } from "@/app/actions/bookings";
import { IconCalendarOff } from "@tabler/icons-react";

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
}

type FilterType = "pending" | "upcoming" | "past" | "all";

interface BookingsPageContentProps {
  initialBookings: Booking[];
}

export function BookingsPageContent({
  initialBookings,
}: BookingsPageContentProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [activeFilter, setActiveFilter] = useState<FilterType>("upcoming");
  const [isLoading, setIsLoading] = useState(false);

  const refreshBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { bookings: newBookings } = await getBookingsForMember("all");
      setBookings(newBookings);
    } catch (error) {
      console.error("Failed to refresh bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filteredBookings = bookings.filter((booking) => {
    switch (activeFilter) {
      case "pending":
        return (
          booking.status === "pending" &&
          booking.is_verified &&
          booking.booking_date >= today
        );
      case "upcoming":
        return (
          (booking.status === "pending" || booking.status === "confirmed") &&
          booking.booking_date >= today
        );
      case "past":
        return booking.booking_date < today;
      case "all":
      default:
        return true;
    }
  });

  // Count badges
  const pendingCount = bookings.filter(
    (b) =>
      b.status === "pending" && b.is_verified && b.booking_date >= today
  ).length;
  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      b.booking_date >= today
  ).length;

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
              ${activeFilter === filter.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }
            `}
          >
            {filter.label}
            {filter.count !== undefined && filter.count > 0 && (
              <span
                className={`
                  ml-2 px-2 py-0.5 text-xs rounded-full
                  ${activeFilter === filter.key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading bookings...
          </p>
        </div>
      )}

      {/* Bookings grid */}
      {!isLoading && filteredBookings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusChange={refreshBookings}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <IconCalendarOff className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeFilter === "pending"
              ? "You have no pending booking requests."
              : activeFilter === "upcoming"
                ? "You have no upcoming appointments."
                : activeFilter === "past"
                  ? "You have no past appointments."
                  : "You haven't received any booking requests yet."}
          </p>
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all bookings
            </button>
          )}
        </div>
      )}

      {/* Help text */}
      {!isLoading && bookings.length > 0 && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            How bookings work
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>1. Visitors request a booking through your profile</li>
            <li>2. They verify their email address</li>
            <li>3. You confirm or decline the booking here</li>
            <li>4. They receive a confirmation email</li>
          </ul>
        </div>
      )}
    </div>
  );
}

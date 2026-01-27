"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendarEvent,
  IconUser,
  IconVideo,
  IconPhone,
  IconClock,
} from "@tabler/icons-react";
import Link from "next/link";
import { getSessionsForCalendarAction } from "@/app/actions/client-sessions";

interface CalendarEvent {
  id: string;
  type: "booking" | "session";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  format?: string | null;
  clientName?: string;
  clientSlug?: string;
  visitorName?: string;
}

interface MemberCalendarProps {
  initialBookings?: Array<{
    id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    visitor_name: string;
    service_title?: string;
    session_format?: string | null;
  }>;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MemberCalendar({ initialBookings = [] }: MemberCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Convert bookings to events
  const bookingEvents: CalendarEvent[] = useMemo(() => {
    return initialBookings.map((b) => ({
      id: b.id,
      type: "booking" as const,
      title: b.service_title || "Booking",
      date: b.booking_date,
      startTime: b.start_time,
      endTime: b.end_time,
      status: b.status,
      format: b.session_format,
      visitorName: b.visitor_name,
    }));
  }, [initialBookings]);

  // Load sessions for current month
  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split("T")[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

        const result = await getSessionsForCalendarAction(startDate, endDate);
        if (result.success && result.data) {
          const sessionEvents: CalendarEvent[] = result.data.map((s: Record<string, unknown>) => {
            const client = s.clients as { first_name: string | null; last_name: string | null; slug: string } | null;
            return {
              id: s.id as string,
              type: "session" as const,
              title: s.title as string,
              date: s.session_date as string,
              startTime: s.start_time as string,
              endTime: s.end_time as string,
              status: s.status as string,
              format: s.session_format as string | null,
              clientName: client
                ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
                : undefined,
              clientSlug: client?.slug,
            };
          });
          setSessions(sessionEvents);
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, [currentDate]);

  // Get all events for the current month
  const allEvents = useMemo(() => {
    return [...bookingEvents, ...sessions];
  }, [bookingEvents, sessions]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: Date | null; events: CalendarEvent[] }> = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, events: [] });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = allEvents.filter((e) => e.date === dateStr);
      days.push({ date, events: dayEvents });
    }

    return days;
  }, [currentDate, allEvents]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((e) => e.date === selectedDate);
  }, [selectedDate, allEvents]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <IconChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <IconChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-4 right-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day.date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-24 bg-gray-50 dark:bg-neutral-900/50 rounded-lg"
                />
              );
            }

            const dateStr = day.date.toISOString().split("T")[0];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-24 p-2 rounded-lg text-left transition-colors ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                    : isToday
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700"
                } border border-gray-200 dark:border-neutral-700`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {day.date.getDate()}
                </span>
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {day.events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs truncate px-1 py-0.5 rounded ${
                        event.type === "session"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : event.status === "confirmed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {event.startTime.slice(0, 5)} {event.title}
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      <div className="lg:w-80">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sticky top-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDate
              ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Select a day"}
          </h3>

          {selectedDate && selectedEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No appointments on this day
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Legend
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" />
                <span className="text-gray-600 dark:text-gray-400">Client Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30" />
                <span className="text-gray-600 dark:text-gray-400">Confirmed Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30" />
                <span className="text-gray-600 dark:text-gray-400">Pending Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const getFormatIcon = () => {
    switch (event.format) {
      case "online":
        return <IconVideo className="w-4 h-4" />;
      case "phone":
        return <IconPhone className="w-4 h-4" />;
      default:
        return <IconUser className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg ${
        event.type === "session"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : event.status === "confirmed"
          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getFormatIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {event.title}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <IconClock className="w-3 h-3" />
            {event.startTime} - {event.endTime}
          </div>
          {event.type === "session" && event.clientName && (
            <Link
              href={`/dashboard/clients/${event.clientSlug}`}
              className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1 block"
            >
              {event.clientName}
            </Link>
          )}
          {event.type === "booking" && event.visitorName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {event.visitorName}
            </p>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            event.type === "session"
              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
              : event.status === "confirmed"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
              : "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200"
          }`}
        >
          {event.type === "session" ? "Session" : event.status}
        </span>
      </div>
    </div>
  );
}

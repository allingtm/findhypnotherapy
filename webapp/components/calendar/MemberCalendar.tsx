"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Inject,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";
import type {
  PopupOpenEventArgs,
  ActionEventArgs,
  EventRenderedArgs,
  EventClickArgs,
} from "@syncfusion/ej2-react-schedule";
import {
  IconVideo,
  IconPhone,
  IconUser,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { getSessionsForCalendarAction } from "@/app/actions/client-sessions";

interface CalendarEvent {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay: boolean;
  Type: "booking" | "session";
  Status: string;
  Format?: string | null;
  ClientName?: string;
  ClientSlug?: string;
  VisitorName?: string;
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

const EVENT_COLORS = {
  session: { bg: "#22c55e", border: "#16a34a" },
  confirmed: { bg: "#3b82f6", border: "#2563eb" },
  pending: { bg: "#f59e0b", border: "#d97706" },
};

export function MemberCalendar({ initialBookings = [] }: MemberCalendarProps) {
  const scheduleRef = useRef<ScheduleComponent>(null);
  const [sessions, setSessions] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert bookings to Syncfusion events
  const bookingEvents: CalendarEvent[] = useMemo(() => {
    return initialBookings.map((b) => {
      const [year, month, day] = b.booking_date.split("-").map(Number);
      const [startH, startM] = b.start_time.split(":").map(Number);
      const [endH, endM] = b.end_time.split(":").map(Number);

      return {
        Id: b.id,
        Subject: b.service_title || "Booking",
        StartTime: new Date(year, month - 1, day, startH, startM),
        EndTime: new Date(year, month - 1, day, endH, endM),
        IsAllDay: false,
        Type: "booking" as const,
        Status: b.status,
        Format: b.session_format,
        VisitorName: b.visitor_name,
      };
    });
  }, [initialBookings]);

  // Load sessions for visible date range
  useEffect(() => {
    async function loadSessions() {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        // Load 3 months of data for smooth navigation
        const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
        const endDate = new Date(year, month + 2, 0).toISOString().split("T")[0];

        const result = await getSessionsForCalendarAction(startDate, endDate);
        if (result.success && result.data) {
          const sessionEvents: CalendarEvent[] = result.data.map(
            (s: Record<string, unknown>) => {
              const client = s.clients as {
                first_name: string | null;
                last_name: string | null;
                slug: string;
              } | null;

              const sessionDate = s.session_date as string;
              const [year, month, day] = sessionDate.split("-").map(Number);
              const startTime = s.start_time as string;
              const endTime = s.end_time as string;
              const [startH, startM] = startTime.split(":").map(Number);
              const [endH, endM] = endTime.split(":").map(Number);

              return {
                Id: s.id as string,
                Subject: s.title as string,
                StartTime: new Date(year, month - 1, day, startH, startM),
                EndTime: new Date(year, month - 1, day, endH, endM),
                IsAllDay: false,
                Type: "session" as const,
                Status: s.status as string,
                Format: s.session_format as string | null,
                ClientName: client
                  ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
                  : undefined,
                ClientSlug: client?.slug,
              };
            }
          );
          setSessions(sessionEvents);
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    }
    loadSessions();
  }, [currentDate]);

  // Combine all events
  const allEvents = useMemo(() => {
    return [...bookingEvents, ...sessions];
  }, [bookingEvents, sessions]);

  const onPopupOpen = useCallback((args: PopupOpenEventArgs) => {
    // Prevent default popups - we use our custom sidebar
    args.cancel = true;
  }, []);

  const onActionBegin = useCallback((args: ActionEventArgs) => {
    // Block all CRUD operations - read-only calendar
    if (
      args.requestType === "eventCreate" ||
      args.requestType === "eventChange" ||
      args.requestType === "eventRemove"
    ) {
      args.cancel = true;
    }
  }, []);

  const onEventClick = useCallback((args: EventClickArgs) => {
    const event = args.event as CalendarEvent;
    setSelectedEvent(event);
  }, []);

  const onEventRendered = useCallback((args: EventRenderedArgs) => {
    if (args.element && args.data) {
      const event = args.data as CalendarEvent;
      let colors = EVENT_COLORS.pending;

      if (event.Type === "session") {
        colors = EVENT_COLORS.session;
      } else if (event.Status === "confirmed") {
        colors = EVENT_COLORS.confirmed;
      }

      args.element.style.backgroundColor = colors.bg;
      args.element.style.borderColor = colors.border;
    }
  }, []);

  const onNavigating = useCallback(
    (args: { currentDate?: Date; action?: string }) => {
      if (args.currentDate) {
        setCurrentDate(args.currentDate);
      }
    },
    []
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar */}
      <div className="flex-1">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: EVENT_COLORS.session.bg }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              Client Sessions
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: EVENT_COLORS.confirmed.bg }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              Confirmed Bookings
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: EVENT_COLORS.pending.bg }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              Pending Bookings
            </span>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          <ScheduleComponent
            ref={scheduleRef}
            height="650px"
            selectedDate={currentDate}
            currentView="Month"
            startHour="06:00"
            endHour="22:00"
            readonly={true}
            showTimeIndicator={true}
            allowDragAndDrop={false}
            allowResizing={false}
            timeScale={{ enable: true, interval: 60, slotCount: 2 }}
            eventSettings={{
              dataSource: allEvents,
              fields: {
                id: "Id",
                subject: { name: "Subject" },
                startTime: { name: "StartTime" },
                endTime: { name: "EndTime" },
                isAllDay: { name: "IsAllDay" },
              },
            }}
            popupOpen={onPopupOpen}
            actionBegin={onActionBegin}
            eventClick={onEventClick}
            eventRendered={onEventRendered}
            navigating={onNavigating}
          >
            <ViewsDirective>
              <ViewDirective option="Day" />
              <ViewDirective option="Week" />
              <ViewDirective option="WorkWeek" />
              <ViewDirective option="Month" />
            </ViewsDirective>
            <Inject services={[Day, Week, WorkWeek, Month]} />
          </ScheduleComponent>
        </div>
      </div>

      {/* Selected Event Detail Sidebar */}
      <div className="lg:w-80">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedEvent ? "Event Details" : "Select an event"}
            </h3>
            {selectedEvent && (
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded"
              >
                <IconX className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {selectedEvent ? (
            <EventDetailCard event={selectedEvent} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Click on an event in the calendar to see its details
            </p>
          )}

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              This Month
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {
                    sessions.filter((s) => {
                      const eventMonth = s.StartTime.getMonth();
                      const eventYear = s.StartTime.getFullYear();
                      return (
                        eventMonth === currentDate.getMonth() &&
                        eventYear === currentDate.getFullYear()
                      );
                    }).length
                  }
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Sessions
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {
                    bookingEvents.filter((b) => {
                      const eventMonth = b.StartTime.getMonth();
                      const eventYear = b.StartTime.getFullYear();
                      return (
                        eventMonth === currentDate.getMonth() &&
                        eventYear === currentDate.getFullYear()
                      );
                    }).length
                  }
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Bookings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventDetailCard({ event }: { event: CalendarEvent }) {
  const getFormatIcon = () => {
    switch (event.Format) {
      case "online":
        return <IconVideo className="w-4 h-4" />;
      case "phone":
        return <IconPhone className="w-4 h-4" />;
      default:
        return <IconUser className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const colors =
    event.Type === "session"
      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      : event.Status === "confirmed"
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";

  const badgeColors =
    event.Type === "session"
      ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
      : event.Status === "confirmed"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
        : "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200";

  return (
    <div className={`p-4 rounded-lg border ${colors}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-600 dark:text-gray-400">
          {getFormatIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white">
            {event.Subject}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(event.StartTime)}
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <IconClock className="w-4 h-4" />
            {formatTime(event.StartTime)} - {formatTime(event.EndTime)}
          </div>

          {event.Type === "session" && event.ClientName && (
            <Link
              href={`/dashboard/clients/${event.ClientSlug}`}
              className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2 block"
            >
              {event.ClientName}
            </Link>
          )}

          {event.Type === "booking" && event.VisitorName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {event.VisitorName}
            </p>
          )}

          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-3 ${badgeColors}`}>
            {event.Type === "session" ? "Session" : event.Status}
          </span>
        </div>
      </div>
    </div>
  );
}

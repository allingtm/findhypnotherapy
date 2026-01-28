"use client";

import React, { useMemo, useCallback } from "react";
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
} from "@syncfusion/ej2-react-schedule";

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

interface BookingsCalendarViewProps {
  bookings: Booking[];
}

interface CalendarEvent {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay: boolean;
  Status: string;
  SessionFormat: string | null;
  VisitorEmail: string;
  VisitorPhone: string | null;
  BookingId: string;
}

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  confirmed: { bg: "#22c55e", border: "#16a34a" },
  pending: { bg: "#eab308", border: "#ca8a04" },
  cancelled: { bg: "#ef4444", border: "#dc2626" },
  completed: { bg: "#3b82f6", border: "#2563eb" },
  no_show: { bg: "#6b7280", border: "#4b5563" },
};

function bookingsToEvents(bookings: Booking[]): CalendarEvent[] {
  return bookings
    .filter((b) => b.is_verified !== false)
    .map((booking) => {
      const [year, month, day] = booking.booking_date.split("-").map(Number);
      const [startH, startM] = booking.start_time.split(":").map(Number);
      const [endH, endM] = booking.end_time.split(":").map(Number);

      const startTime = new Date(year, month - 1, day, startH, startM);
      const endTime = new Date(year, month - 1, day, endH, endM);

      const formatLabel =
        booking.session_format === "online"
          ? " (Online)"
          : booking.session_format === "in-person"
            ? " (In-person)"
            : booking.session_format === "phone"
              ? " (Phone)"
              : "";

      return {
        Id: booking.id,
        Subject: `${booking.visitor_name}${formatLabel}`,
        StartTime: startTime,
        EndTime: endTime,
        IsAllDay: false,
        Status: booking.status,
        SessionFormat: booking.session_format,
        VisitorEmail: booking.visitor_email,
        VisitorPhone: booking.visitor_phone,
        BookingId: booking.id,
      };
    });
}

export function BookingsCalendarView({ bookings }: BookingsCalendarViewProps) {
  const events = useMemo(() => bookingsToEvents(bookings), [bookings]);

  const onPopupOpen = useCallback((args: PopupOpenEventArgs) => {
    // Prevent editor popup — this is read-only
    if (args.type === "Editor") {
      args.cancel = true;
    }
  }, []);

  const onActionBegin = useCallback((args: ActionEventArgs) => {
    // Block all CRUD operations — read-only calendar
    if (
      args.requestType === "eventCreate" ||
      args.requestType === "eventChange" ||
      args.requestType === "eventRemove"
    ) {
      args.cancel = true;
    }
  }, []);

  const onEventRendered = useCallback((args: EventRenderedArgs) => {
    if (args.element && args.data) {
      const status = (args.data as CalendarEvent).Status;
      const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
      args.element.style.backgroundColor = colors.bg;
      args.element.style.borderColor = colors.border;
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: STATUS_COLORS.confirmed.bg }}
          />
          <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: STATUS_COLORS.pending.bg }}
          />
          <span className="text-gray-600 dark:text-gray-400">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: STATUS_COLORS.completed.bg }}
          />
          <span className="text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: STATUS_COLORS.cancelled.bg }}
          />
          <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: STATUS_COLORS.no_show.bg }}
          />
          <span className="text-gray-600 dark:text-gray-400">No Show</span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <ScheduleComponent
          height="650px"
          selectedDate={new Date()}
          currentView="Week"
          startHour="06:00"
          endHour="22:00"
          readonly={true}
          showTimeIndicator={true}
          allowDragAndDrop={false}
          allowResizing={false}
          timeScale={{ enable: true, interval: 60, slotCount: 2 }}
          eventSettings={{
            dataSource: events,
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
          eventRendered={onEventRendered}
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
  );
}

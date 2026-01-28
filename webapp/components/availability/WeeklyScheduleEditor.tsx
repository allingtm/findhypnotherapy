"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  ScheduleComponent,
  Week,
  Inject,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";
import type { ActionEventArgs, PopupOpenEventArgs, EventRenderedArgs } from "@syncfusion/ej2-react-schedule";
import { Button } from "@/components/ui/Button";
import { DAY_NAMES } from "@/lib/validation/booking";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface DaySchedule {
  day_of_week: number;
  slots: TimeSlot[];
}

interface WeeklyScheduleEditorProps {
  initialSchedule?: DaySchedule[];
  onSave: (schedule: DaySchedule[]) => Promise<void>;
  saving?: boolean;
}

interface ScheduleEvent {
  Id: number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay: boolean;
}

// Get a reference Monday for positioning events on the correct weekday.
// Syncfusion Week view shows Sun (index 0) through Sat (index 6).
// We pick a recent Sunday as the anchor so day_of_week 0 = Sunday.
function getReferenceWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function scheduleToEvents(schedule: DaySchedule[]): ScheduleEvent[] {
  const weekStart = getReferenceWeekStart();
  const events: ScheduleEvent[] = [];
  let id = 1;

  for (const day of schedule) {
    for (const slot of day.slots) {
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const [endH, endM] = slot.end_time.split(":").map(Number);

      const startDate = new Date(weekStart);
      startDate.setDate(weekStart.getDate() + day.day_of_week);
      startDate.setHours(startH, startM, 0, 0);

      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + day.day_of_week);
      endDate.setHours(endH, endM, 0, 0);

      events.push({
        Id: id++,
        Subject: "Available",
        StartTime: startDate,
        EndTime: endDate,
        IsAllDay: false,
      });
    }
  }

  return events;
}

function eventsToSchedule(events: ScheduleEvent[]): DaySchedule[] {
  const schedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    slots: [],
  }));

  for (const event of events) {
    const dayOfWeek = event.StartTime.getDay();
    const startTime = `${event.StartTime.getHours().toString().padStart(2, "0")}:${event.StartTime.getMinutes().toString().padStart(2, "0")}`;
    const endTime = `${event.EndTime.getHours().toString().padStart(2, "0")}:${event.EndTime.getMinutes().toString().padStart(2, "0")}`;

    schedule[dayOfWeek].slots.push({ start_time: startTime, end_time: endTime });
  }

  // Sort slots by start_time within each day
  for (const day of schedule) {
    day.slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  return schedule;
}

export function WeeklyScheduleEditor({
  initialSchedule = [],
  onSave,
  saving = false,
}: WeeklyScheduleEditorProps) {
  const scheduleRef = useRef<ScheduleComponent>(null);
  const [error, setError] = useState<string | null>(null);

  const initialEvents = useMemo(
    () => scheduleToEvents(initialSchedule),
    [initialSchedule]
  );

  const referenceDate = useMemo(() => getReferenceWeekStart(), []);

  const onActionBegin = useCallback((args: ActionEventArgs) => {
    setError(null);

    // Enforce that events stay within a single day
    if (
      args.requestType === "eventCreate" ||
      args.requestType === "eventChange"
    ) {
      const events = (args.data instanceof Array ? args.data : [args.data]) as ScheduleEvent[];
      for (const event of events) {
        if (!event.StartTime || !event.EndTime) continue;

        // Prevent multi-day events
        if (event.StartTime.getDate() !== event.EndTime.getDate()) {
          args.cancel = true;
          setError("Availability blocks must be within a single day.");
          return;
        }

        // Prevent start >= end
        if (event.StartTime >= event.EndTime) {
          args.cancel = true;
          setError("Start time must be before end time.");
          return;
        }
      }
    }
  }, []);

  const onActionComplete = useCallback((args: ActionEventArgs) => {
    // Check for overlaps after create/change
    if (
      args.requestType === "eventCreated" ||
      args.requestType === "eventChanged"
    ) {
      const scheduler = scheduleRef.current;
      if (!scheduler) return;

      const allEvents = scheduler.getEvents() as ScheduleEvent[];

      // Group by day
      const byDay = new Map<number, ScheduleEvent[]>();
      for (const e of allEvents) {
        const day = e.StartTime.getDay();
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(e);
      }

      // Check overlaps within each day
      for (const [dayNum, dayEvents] of byDay) {
        dayEvents.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());
        for (let i = 0; i < dayEvents.length - 1; i++) {
          if (dayEvents[i].EndTime > dayEvents[i + 1].StartTime) {
            setError(
              `${DAY_NAMES[dayNum]}: Time slots overlap. Please adjust.`
            );
            return;
          }
        }
      }
    }
  }, []);

  const onPopupOpen = useCallback((args: PopupOpenEventArgs) => {
    // Disable the default editor popup — we only want drag-to-create and resize
    if (args.type === "Editor") {
      args.cancel = true;
    }
    // Allow QuickInfo for delete actions
    if (args.type === "QuickInfo" && args.data) {
      // Simplify quick info — just show "Available" with delete option
      const data = args.data as ScheduleEvent;
      if (data.Subject === undefined) {
        // Creating via cell click — set default subject
        (args.data as Record<string, unknown>).Subject = "Available";
      }
    }
  }, []);

  const onEventRendered = useCallback((args: EventRenderedArgs) => {
    // Style all availability blocks with a consistent green colour
    if (args.element) {
      args.element.style.backgroundColor = "#22c55e";
      args.element.style.borderColor = "#16a34a";
    }
  }, []);

  const handleSave = async () => {
    setError(null);
    const scheduler = scheduleRef.current;
    if (!scheduler) return;

    const allEvents = scheduler.getEvents() as ScheduleEvent[];

    // Validate overlaps before saving
    const byDay = new Map<number, ScheduleEvent[]>();
    for (const e of allEvents) {
      const day = e.StartTime.getDay();
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(e);
    }

    for (const [dayNum, dayEvents] of byDay) {
      dayEvents.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());
      for (let i = 0; i < dayEvents.length - 1; i++) {
        if (dayEvents[i].EndTime > dayEvents[i + 1].StartTime) {
          setError(`${DAY_NAMES[dayNum]}: Time slots overlap. Please fix before saving.`);
          return;
        }
      }
    }

    const schedule = eventsToSchedule(allEvents);

    try {
      await onSave(schedule);
    } catch {
      setError("Failed to save schedule. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Click and drag on the calendar to create availability blocks. Drag edges to resize, or drag blocks to move them.
      </div>

      <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <ScheduleComponent
          ref={scheduleRef}
          height="550px"
          selectedDate={referenceDate}
          currentView="Week"
          startHour="06:00"
          endHour="22:00"
          showHeaderBar={false}
          showTimeIndicator={false}
          allowDragAndDrop={true}
          allowResizing={true}
          allowOverlap={false}
          timeScale={{ enable: true, interval: 60, slotCount: 2 }}
          workHours={{ highlight: true, start: "09:00", end: "17:00" }}
          eventSettings={{
            dataSource: initialEvents,
            fields: {
              id: "Id",
              subject: { name: "Subject", default: "Available" },
              startTime: { name: "StartTime" },
              endTime: { name: "EndTime" },
              isAllDay: { name: "IsAllDay" },
            },
            allowAdding: true,
            allowEditing: true,
            allowDeleting: true,
          }}
          actionBegin={onActionBegin}
          actionComplete={onActionComplete}
          popupOpen={onPopupOpen}
          eventRendered={onEventRendered}
        >
          <ViewsDirective>
            <ViewDirective option="Week" />
          </ViewsDirective>
          <Inject services={[Week]} />
        </ScheduleComponent>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Save Schedule
        </Button>
      </div>
    </div>
  );
}

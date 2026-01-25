"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { DAY_NAMES, DAY_NAMES_SHORT } from "@/lib/validation/booking";
import { IconPlus, IconTrash, IconCopy } from "@tabler/icons-react";

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

// Generate time options in 15-minute intervals
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      times.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

// Format time for display (e.g., "09:00" -> "9:00 AM")
function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function WeeklyScheduleEditor({
  initialSchedule = [],
  onSave,
  saving = false,
}: WeeklyScheduleEditorProps) {
  // Initialize schedule with all 7 days
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const defaultSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      slots: [],
    }));

    // Merge initial schedule
    for (const day of initialSchedule) {
      const index = defaultSchedule.findIndex((d) => d.day_of_week === day.day_of_week);
      if (index !== -1) {
        defaultSchedule[index].slots = [...day.slots];
      }
    }

    return defaultSchedule;
  });

  const [copyFromDay, setCopyFromDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add a new time slot to a day
  const addSlot = useCallback((dayIndex: number) => {
    setSchedule((prev) => {
      const day = prev[dayIndex];

      // Default to 9:00-17:00 or after the last slot
      let startTime = "09:00";
      let endTime = "17:00";

      if (day.slots.length > 0) {
        const lastSlot = day.slots[day.slots.length - 1];
        const [lastEndHours, lastEndMinutes] = lastSlot.end_time.split(":").map(Number);
        const newStartMinutes = lastEndHours * 60 + lastEndMinutes + 60; // 1 hour later

        if (newStartMinutes < 23 * 60) {
          startTime = `${Math.floor(newStartMinutes / 60).toString().padStart(2, "0")}:${(newStartMinutes % 60).toString().padStart(2, "0")}`;
          const newEndMinutes = newStartMinutes + 60;
          endTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, "0")}:${(newEndMinutes % 60).toString().padStart(2, "0")}`;
        }
      }

      // Create new array with new day object containing new slots array
      return prev.map((d, i) =>
        i === dayIndex
          ? { ...d, slots: [...d.slots, { start_time: startTime, end_time: endTime }] }
          : d
      );
    });
    setError(null);
  }, []);

  // Remove a time slot from a day
  const removeSlot = useCallback((dayIndex: number, slotIndex: number) => {
    setSchedule((prev) => {
      // Create new array with new day object containing filtered slots
      return prev.map((d, i) =>
        i === dayIndex
          ? { ...d, slots: d.slots.filter((_, si) => si !== slotIndex) }
          : d
      );
    });
    setError(null);
  }, []);

  // Update a time slot
  const updateSlot = useCallback(
    (dayIndex: number, slotIndex: number, field: "start_time" | "end_time", value: string) => {
      setSchedule((prev) => {
        // Create new array with new day object containing new slots with updated slot
        return prev.map((d, i) =>
          i === dayIndex
            ? {
                ...d,
                slots: d.slots.map((slot, si) =>
                  si === slotIndex ? { ...slot, [field]: value } : slot
                ),
              }
            : d
        );
      });
      setError(null);
    },
    []
  );

  // Copy schedule from one day to another
  const copySchedule = useCallback((fromDay: number, toDay: number) => {
    setSchedule((prev) => {
      // Create new array with new day object containing copied slots
      return prev.map((d, i) =>
        i === toDay
          ? { ...d, slots: prev[fromDay].slots.map((slot) => ({ ...slot })) }
          : d
      );
    });
    setCopyFromDay(null);
    setError(null);
  }, []);

  // Copy to all weekdays (Mon-Fri)
  const copyToWeekdays = useCallback((fromDay: number) => {
    setSchedule((prev) => {
      // Create new array with new day objects for weekdays (1-5) containing copied slots
      return prev.map((d, i) =>
        i >= 1 && i <= 5 && i !== fromDay
          ? { ...d, slots: prev[fromDay].slots.map((slot) => ({ ...slot })) }
          : d
      );
    });
    setCopyFromDay(null);
    setError(null);
  }, []);

  // Clear a day's schedule
  const clearDay = useCallback((dayIndex: number) => {
    setSchedule((prev) => {
      // Create new array with new day object containing empty slots
      return prev.map((d, i) =>
        i === dayIndex ? { ...d, slots: [] } : d
      );
    });
    setError(null);
  }, []);

  // Validate and save
  const handleSave = async () => {
    setError(null);

    // Validate all slots
    for (const day of schedule) {
      for (let i = 0; i < day.slots.length; i++) {
        const slot = day.slots[i];

        // Check start < end
        if (slot.start_time >= slot.end_time) {
          setError(`${DAY_NAMES[day.day_of_week]}: Start time must be before end time`);
          return;
        }

        // Check for overlapping slots
        for (let j = i + 1; j < day.slots.length; j++) {
          const otherSlot = day.slots[j];
          if (
            (slot.start_time < otherSlot.end_time && slot.end_time > otherSlot.start_time)
          ) {
            setError(`${DAY_NAMES[day.day_of_week]}: Time slots cannot overlap`);
            return;
          }
        }
      }
    }

    try {
      await onSave(schedule);
    } catch (err) {
      setError("Failed to save schedule. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {schedule.map((day, dayIndex) => (
          <div
            key={day.day_of_week}
            className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4"
          >
            {/* Day header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                <span className="hidden sm:inline">{DAY_NAMES[day.day_of_week]}</span>
                <span className="sm:hidden">{DAY_NAMES_SHORT[day.day_of_week]}</span>
              </h3>
              <div className="flex items-center gap-2">
                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => setCopyFromDay(copyFromDay === dayIndex ? null : dayIndex)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700"
                  title="Copy schedule"
                >
                  <IconCopy className="h-4 w-4" />
                </button>
                {/* Add slot button */}
                <button
                  type="button"
                  onClick={() => addSlot(dayIndex)}
                  className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Add time slot"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Copy options */}
            {copyFromDay === dayIndex && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Copy this schedule to:</p>
                <div className="flex flex-wrap gap-2">
                  {schedule.map((targetDay, targetIndex) => {
                    if (targetIndex === dayIndex) return null;
                    return (
                      <button
                        key={targetDay.day_of_week}
                        type="button"
                        onClick={() => copySchedule(dayIndex, targetIndex)}
                        className="px-2 py-1 text-xs bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-600"
                      >
                        {DAY_NAMES_SHORT[targetDay.day_of_week]}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => copyToWeekdays(dayIndex)}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    All Weekdays
                  </button>
                </div>
              </div>
            )}

            {/* Time slots */}
            {day.slots.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No availability set - click + to add
              </p>
            ) : (
              <div className="space-y-2">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    {/* Start time */}
                    <select
                      value={slot.start_time}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, "start_time", e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </option>
                      ))}
                    </select>

                    <span className="text-gray-500 dark:text-gray-400">to</span>

                    {/* End time */}
                    <select
                      value={slot.end_time}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, "end_time", e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </option>
                      ))}
                    </select>

                    {/* Delete slot button */}
                    <button
                      type="button"
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                      className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove slot"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Save Schedule
        </Button>
      </div>
    </div>
  );
}

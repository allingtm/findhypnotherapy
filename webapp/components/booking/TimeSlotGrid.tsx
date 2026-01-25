"use client";

import React from "react";
import { IconClock } from "@tabler/icons-react";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading?: boolean;
  selectedDate: string | null;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false,
  selectedDate,
}: TimeSlotGridProps) {
  if (!selectedDate) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center">
          <IconClock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Select a date to see available times
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading times...</p>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center">
          <IconClock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No available times for this date
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Please try selecting a different date
          </p>
        </div>
      </div>
    );
  }

  // Format selected date for display
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Available Times
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {formattedDate}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected =
            selectedSlot?.start_time === slot.start_time &&
            selectedSlot?.end_time === slot.end_time;

          return (
            <button
              key={`${slot.start_time}-${slot.end_time}`}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`
                px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-600"
                }
              `}
            >
              {formatTime(slot.start_time)}
            </button>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Selected: {formatTime(selectedSlot.start_time)} -{" "}
            {formatTime(selectedSlot.end_time)}
          </p>
        </div>
      )}
    </div>
  );
}

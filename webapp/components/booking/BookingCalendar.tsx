"use client";

import React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface BookingCalendarProps {
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  loading?: boolean;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
  loading = false,
}: BookingCalendarProps) {
  const availableDateSet = new Set(availableDates);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    // Don't allow going before current month
    if (newDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      onMonthChange(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onMonthChange(newDate);
  };

  const formatDateStr = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const isPrevMonthDisabled =
    new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={isPrevMonthDisabled || loading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <IconChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthLabel}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <IconChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const dateStr = formatDateStr(day);
          const isAvailable = availableDateSet.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isPast = new Date(dateStr) < today;
          const isToday = new Date(dateStr).toDateString() === today.toDateString();

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => isAvailable && !loading && onSelectDate(dateStr)}
              disabled={!isAvailable || isPast || loading}
              className={`
                relative p-2 text-sm rounded-lg transition-colors
                ${isSelected
                  ? "bg-blue-600 text-white font-semibold"
                  : isAvailable && !isPast
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer font-medium"
                    : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                }
                ${isToday && !isSelected ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-neutral-800" : ""}
              `}
            >
              {day}
              {isAvailable && !isPast && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-600 rounded" />
          <span>Selected</span>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading availability...
        </div>
      )}
    </div>
  );
}

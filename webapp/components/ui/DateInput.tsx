"use client";

import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps {
  value: string; // ISO format YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

export function DateInput({
  value,
  onChange,
  label,
  error,
  required,
  minDate,
  maxDate,
  placeholder = "dd/mm/yyyy",
  disabled,
}: DateInputProps) {
  // Convert ISO string to Date object for the picker
  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : null;

  // Handle date change from picker
  const handleChange = (date: Date | null) => {
    if (date) {
      // Convert back to ISO format for storage
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && " *"}
        </label>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        locale={enGB}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        calendarClassName="dark:bg-neutral-800"
        showPopperArrow={false}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

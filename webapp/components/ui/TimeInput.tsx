"use client";

import DatePicker from "react-datepicker";
import { setHours, setMinutes, parse, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

interface TimeInputProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  minTime?: string; // HH:mm format
  maxTime?: string; // HH:mm format
  placeholder?: string;
  disabled?: boolean;
  timeIntervals?: number; // minutes between options, default 5
}

export function TimeInput({
  value,
  onChange,
  label,
  error,
  required,
  minTime = "06:00",
  maxTime = "22:00",
  placeholder = "Select time",
  disabled,
  timeIntervals = 5,
}: TimeInputProps) {
  // Convert HH:mm string to Date object for the picker
  const selectedTime = value
    ? parse(value, "HH:mm", new Date())
    : null;

  // Convert min/max time strings to Date objects
  const minTimeDate = parse(minTime, "HH:mm", new Date());
  const maxTimeDate = parse(maxTime, "HH:mm", new Date());

  // Handle time change from picker
  const handleChange = (date: Date | null) => {
    if (date) {
      onChange(format(date, "HH:mm"));
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
        selected={selectedTime}
        onChange={handleChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={timeIntervals}
        timeCaption="Time"
        dateFormat="HH:mm"
        timeFormat="HH:mm"
        minTime={minTimeDate}
        maxTime={maxTimeDate}
        placeholderText={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        showPopperArrow={false}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

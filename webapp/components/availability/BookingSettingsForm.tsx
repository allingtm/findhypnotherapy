"use client";

import React, { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { updateBookingSettingsAction } from "@/app/actions/availability";
import {
  SLOT_DURATION_OPTIONS,
  BUFFER_TIME_OPTIONS,
  MIN_NOTICE_OPTIONS,
  MAX_DAYS_AHEAD_OPTIONS,
  COMMON_TIMEZONES,
} from "@/lib/validation/booking";

interface BookingSettings {
  id: string;
  therapist_profile_id: string;
  slot_duration_minutes: number;
  buffer_minutes: number | null;
  min_booking_notice_hours: number | null;
  max_booking_days_ahead: number | null;
  timezone: string;
  requires_approval: boolean | null;
  accepts_online_booking: boolean | null;
  google_calendar_connected: boolean | null;
  microsoft_calendar_connected: boolean | null;
  send_visitor_reminders: boolean | null;
  send_therapist_reminders: boolean | null;
}

interface BookingSettingsFormProps {
  settings: BookingSettings;
}

export function BookingSettingsForm({ settings }: BookingSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateBookingSettingsAction, {
    success: false,
    error: undefined,
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <Alert type="error" message={state.error} />}
      {state.success && <Alert type="success" message="Settings saved successfully!" />}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Slot Duration */}
        <div>
          <label
            htmlFor="slot_duration_minutes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Appointment Duration
          </label>
          <select
            id="slot_duration_minutes"
            name="slot_duration_minutes"
            defaultValue={settings.slot_duration_minutes}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SLOT_DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            How long each booking slot should be
          </p>
        </div>

        {/* Buffer Time */}
        <div>
          <label
            htmlFor="buffer_minutes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Buffer Between Appointments
          </label>
          <select
            id="buffer_minutes"
            name="buffer_minutes"
            defaultValue={settings.buffer_minutes ?? 0}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {BUFFER_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Break time between consecutive appointments
          </p>
        </div>

        {/* Minimum Notice */}
        <div>
          <label
            htmlFor="min_booking_notice_hours"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Minimum Notice Required
          </label>
          <select
            id="min_booking_notice_hours"
            name="min_booking_notice_hours"
            defaultValue={settings.min_booking_notice_hours ?? 24}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MIN_NOTICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            How far in advance clients must book
          </p>
        </div>

        {/* Max Days Ahead */}
        <div>
          <label
            htmlFor="max_booking_days_ahead"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Booking Window
          </label>
          <select
            id="max_booking_days_ahead"
            name="max_booking_days_ahead"
            defaultValue={settings.max_booking_days_ahead ?? 30}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MAX_DAYS_AHEAD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            How far into the future clients can book
          </p>
        </div>

        {/* Timezone */}
        <div className="md:col-span-2">
          <label
            htmlFor="timezone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Your Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={settings.timezone}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            All times will be displayed in this timezone
          </p>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
        {/* Accepts Online Booking */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="accepts_online_booking"
            value="true"
            defaultChecked={settings.accepts_online_booking ?? true}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Accept Online Bookings
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Allow visitors to book appointments directly through your profile
            </p>
          </div>
        </label>

        {/* Requires Approval */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="requires_approval"
            value="true"
            defaultChecked={settings.requires_approval ?? false}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Require Approval
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and manually approve each booking request before confirmation
            </p>
          </div>
        </label>
      </div>

      {/* Reminder Settings */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Booking Reminders
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Automatic email reminders are sent 24 hours and 1 hour before appointments.
        </p>

        {/* Send Visitor Reminders */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="send_visitor_reminders"
            value="true"
            defaultChecked={settings.send_visitor_reminders ?? true}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Send Client Reminders
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your clients will receive reminder emails before their appointments
            </p>
          </div>
        </label>

        {/* Send Therapist Reminders */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="send_therapist_reminders"
            value="true"
            defaultChecked={settings.send_therapist_reminders ?? true}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Send Me Reminders
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will receive reminder emails before your appointments
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" loading={isPending}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { WeeklyScheduleEditor } from "@/components/availability/WeeklyScheduleEditor";
import { BookingSettingsForm } from "@/components/availability/BookingSettingsForm";
import { CalendarSyncStatus } from "@/components/availability/CalendarSyncStatus";
import { saveWeeklyAvailabilityAction } from "@/app/actions/availability";
import { Alert } from "@/components/ui/Alert";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface DaySchedule {
  day_of_week: number;
  slots: TimeSlot[];
}

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

interface CalendarConnection {
  provider: string;
  is_active: boolean | null;
  last_sync_at: string | null;
  sync_error: string | null;
}

interface AvailabilityPageContentProps {
  settings: BookingSettings;
  initialSchedule: DaySchedule[];
  connections: CalendarConnection[];
}

export function AvailabilityPageContent({
  settings,
  initialSchedule,
  connections,
}: AvailabilityPageContentProps) {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveSchedule = async (schedule: DaySchedule[]) => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const result = await saveWeeklyAvailabilityAction(schedule);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || "Failed to save schedule");
      }
    } catch {
      setSaveError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Save success/error messages */}
      {saveSuccess && (
        <Alert type="success" message="Your availability has been saved successfully!" />
      )}
      {saveError && <Alert type="error" message={saveError} />}

      {/* Booking Settings */}
      <section className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Booking Settings
        </h2>
        <BookingSettingsForm settings={settings} />
      </section>

      {/* Weekly Schedule */}
      <section className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Weekly Availability
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Set the times when you&apos;re available for introductory sessions. You can add multiple time blocks per day.
        </p>
        <WeeklyScheduleEditor
          initialSchedule={initialSchedule}
          onSave={handleSaveSchedule}
          saving={saving}
        />
      </section>

      {/* Calendar Sync */}
      <section className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <CalendarSyncStatus connections={connections} />
      </section>

      {/* Help Text */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          How it works
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>1. Set your regular weekly availability above</li>
          <li>2. Optionally connect your calendar to automatically block times when you&apos;re busy</li>
          <li>3. Visitors will see available time slots on your profile and can book directly</li>
          <li>4. You&apos;ll receive an email notification when someone books</li>
        </ul>
      </section>
    </div>
  );
}

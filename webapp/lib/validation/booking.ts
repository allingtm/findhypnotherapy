import { z } from "zod";

// Booking settings validation
export const bookingSettingsSchema = z.object({
  slot_duration_minutes: z.coerce
    .number()
    .int()
    .min(15, "Slot duration must be at least 15 minutes")
    .max(240, "Slot duration cannot exceed 4 hours"),
  buffer_minutes: z.coerce
    .number()
    .int()
    .min(0, "Buffer cannot be negative")
    .max(60, "Buffer cannot exceed 60 minutes"),
  min_booking_notice_hours: z.coerce
    .number()
    .int()
    .min(0, "Notice period cannot be negative")
    .max(168, "Notice period cannot exceed 7 days"),
  max_booking_days_ahead: z.coerce
    .number()
    .int()
    .min(1, "Must allow at least 1 day ahead booking")
    .max(365, "Cannot exceed 1 year ahead"),
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .max(100, "Invalid timezone"),
  requires_approval: z.coerce.boolean(),
  accepts_online_booking: z.coerce.boolean(),
});

export type BookingSettingsData = z.infer<typeof bookingSettingsSchema>;

// Weekly availability slot validation
export const availabilitySlotSchema = z.object({
  day_of_week: z
    .number()
    .int()
    .min(0, "Invalid day")
    .max(6, "Invalid day"),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (use HH:MM)"),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (use HH:MM)"),
});

export type AvailabilitySlotData = z.infer<typeof availabilitySlotSchema>;

// Full weekly schedule validation
export const weeklyScheduleSchema = z.array(
  z.object({
    day_of_week: z.number().int().min(0).max(6),
    slots: z.array(
      z.object({
        start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
        end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
      })
    ),
  })
);

export type WeeklyScheduleData = z.infer<typeof weeklyScheduleSchema>;

// Date override validation
export const dateOverrideSchema = z.object({
  override_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
  is_available: z.boolean(),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format")
    .optional()
    .nullable(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format")
    .optional()
    .nullable(),
  reason: z
    .string()
    .max(255, "Reason must be 255 characters or less")
    .optional()
    .nullable(),
});

export type DateOverrideData = z.infer<typeof dateOverrideSchema>;

// Visitor booking form validation
export const bookingFormSchema = z.object({
  therapistProfileId: z.string().uuid("Invalid therapist profile"),
  serviceId: z.string().uuid("Invalid service").optional().nullable(),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  sessionFormat: z
    .enum(["online", "in-person", "phone"])
    .optional()
    .nullable(),
  visitorName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  visitorEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .toLowerCase()
    .trim(),
  visitorPhone: z
    .string()
    .max(20, "Phone number must be 20 characters or less")
    .optional()
    .nullable(),
  visitorNotes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .nullable(),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Member booking status update validation
export const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
  cancellationReason: z
    .string()
    .max(500, "Reason must be 500 characters or less")
    .optional()
    .nullable(),
});

export type UpdateBookingStatusData = z.infer<typeof updateBookingStatusSchema>;

// Visitor cancellation validation
export const visitorCancelBookingSchema = z.object({
  visitorToken: z.string().min(1, "Invalid booking token"),
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or less")
    .optional()
    .nullable(),
});

export type VisitorCancelBookingData = z.infer<typeof visitorCancelBookingSchema>;

// Time slot type for availability display
export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

// Day names for display
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

// Common timezones for UK-based app
export const COMMON_TIMEZONES = [
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Dublin", label: "Dublin (GMT/IST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
] as const;

// Slot duration options
export const SLOT_DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
] as const;

// Buffer time options
export const BUFFER_TIME_OPTIONS = [
  { value: 0, label: "No buffer" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
] as const;

// Minimum notice options (in hours)
export const MIN_NOTICE_OPTIONS = [
  { value: 0, label: "No minimum" },
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 4, label: "4 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours" },
  { value: 48, label: "48 hours" },
  { value: 72, label: "3 days" },
  { value: 168, label: "1 week" },
] as const;

// Max days ahead options
export const MAX_DAYS_AHEAD_OPTIONS = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: 60, label: "2 months" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
] as const;

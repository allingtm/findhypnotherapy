import { z } from "zod";

// Name format regex - matches database check_name_format constraint
// Only allows: letters, spaces, apostrophes, hyphens
const nameFormatRegex = /^[a-zA-Z\s'\-]*$/;
const nameFormatMessage = "Name can only contain letters, spaces, apostrophes, and hyphens";

// =====================
// CLIENT INVITATION
// =====================

export const clientInvitationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .toLowerCase()
    .trim(),
  firstName: z
    .string()
    .max(100, "First name must be 100 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim()
    .optional(),
  lastName: z
    .string()
    .max(100, "Last name must be 100 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim()
    .optional(),
  personalMessage: z
    .string()
    .max(500, "Personal message must be 500 characters or less")
    .trim()
    .optional(),
  serviceId: z
    .string()
    .uuid("Invalid service ID")
    .optional()
    .nullable(),
});

export type ClientInvitationData = z.infer<typeof clientInvitationSchema>;

// =====================
// CLIENT ONBOARDING
// =====================

export const clientOnboardingSchema = z.object({
  token: z.string().min(64, "Invalid token").max(64, "Invalid token"),

  // Personal Info
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim(),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),

  // Address (optional)
  addressLine1: z
    .string()
    .max(255, "Address must be 255 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  addressLine2: z
    .string()
    .max(255, "Address must be 255 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City must be 100 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .max(20, "Postal code must be 20 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country must be 100 characters or less")
    .trim()
    .default("United Kingdom"),

  // Emergency Contact (required)
  emergencyContactName: z
    .string()
    .min(1, "Emergency contact name is required")
    .max(200, "Name must be 200 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim(),
  emergencyContactPhone: z
    .string()
    .min(1, "Emergency contact phone is required")
    .max(50, "Phone must be 50 characters or less")
    .trim(),
  emergencyContactRelationship: z
    .string()
    .max(100, "Relationship must be 100 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),

  // Health Information (optional)
  healthConditions: z
    .string()
    .max(2000, "Health conditions must be 2000 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  medications: z
    .string()
    .max(1000, "Medications must be 1000 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  allergies: z
    .string()
    .max(500, "Allergies must be 500 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  gpName: z
    .string()
    .max(200, "GP name must be 200 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim()
    .optional()
    .or(z.literal("")),
  gpPractice: z
    .string()
    .max(255, "GP practice must be 255 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),

  // Terms & Conditions
  termsAccepted: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
});

export type ClientOnboardingData = z.infer<typeof clientOnboardingSchema>;

// =====================
// CLIENT UPDATE
// =====================

export const clientUpdateSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),

  // Personal Info
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less")
    .regex(nameFormatRegex, nameFormatMessage)
    .trim()
    .optional(),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or less")
    .trim()
    .optional()
    .nullable(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .toLowerCase()
    .trim()
    .optional(),

  // Address
  addressLine1: z.string().max(255).trim().optional().nullable(),
  addressLine2: z.string().max(255).trim().optional().nullable(),
  city: z.string().max(100).trim().optional().nullable(),
  postalCode: z.string().max(20).trim().optional().nullable(),
  country: z.string().max(100).trim().optional().nullable(),

  // Emergency Contact
  emergencyContactName: z.string().max(200).regex(nameFormatRegex, nameFormatMessage).trim().optional().nullable(),
  emergencyContactPhone: z.string().max(50).trim().optional().nullable(),
  emergencyContactRelationship: z.string().max(100).trim().optional().nullable(),

  // Health Information
  healthConditions: z.string().max(2000).trim().optional().nullable(),
  medications: z.string().max(1000).trim().optional().nullable(),
  allergies: z.string().max(500).trim().optional().nullable(),
  gpName: z.string().max(200).regex(nameFormatRegex, nameFormatMessage).trim().optional().nullable(),
  gpPractice: z.string().max(255).trim().optional().nullable(),
});

export type ClientUpdateData = z.infer<typeof clientUpdateSchema>;

// =====================
// CLIENT SESSION
// =====================

export const clientSessionSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  serviceId: z.string().uuid("Invalid service ID").optional().nullable(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be 8 hours or less"),
  sessionFormat: z.enum(["online", "in-person", "phone"]).optional().nullable(),
  location: z
    .string()
    .max(500, "Location must be 500 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  meetingUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "URL must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  therapistNotes: z
    .string()
    .max(5000, "Notes must be 5000 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  sendNotification: z.boolean().default(true),
});

export type ClientSessionData = z.infer<typeof clientSessionSchema>;

export const clientSessionUpdateSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  serviceId: z.string().uuid("Invalid service ID").optional().nullable(),
  title: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(2000).trim().optional().nullable(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  sessionFormat: z.enum(["online", "in-person", "phone"]).optional().nullable(),
  location: z.string().max(500).trim().optional().nullable(),
  meetingUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  therapistNotes: z.string().max(5000).trim().optional().nullable(),
  sendNotification: z.boolean().default(true),
});

export type ClientSessionUpdateData = z.infer<typeof clientSessionUpdateSchema>;

export const cancelSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  sendNotification: z.boolean().default(true),
});

export type CancelSessionData = z.infer<typeof cancelSessionSchema>;

// =====================
// CLIENT NOTES
// =====================

export const clientNoteSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  sessionId: z.string().uuid("Invalid session ID").optional().nullable(),
  noteType: z.enum(["session_note", "general_note", "progress_note"], {
    message: "Invalid note type",
  }),
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note must be 10000 characters or less")
    .trim(),
  isPrivate: z.boolean().default(true),
});

export type ClientNoteData = z.infer<typeof clientNoteSchema>;

export const clientNoteUpdateSchema = z.object({
  noteId: z.string().uuid("Invalid note ID"),
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note must be 10000 characters or less")
    .trim()
    .optional(),
  isPrivate: z.boolean().optional(),
});

export type ClientNoteUpdateData = z.infer<typeof clientNoteUpdateSchema>;

// =====================
// THERAPIST TERMS
// =====================

export const therapistTermsSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .trim()
    .default("Terms & Conditions"),
  content: z
    .string()
    .min(10, "Terms content must be at least 10 characters")
    .max(50000, "Terms must be 50000 characters or less")
    .trim(),
});

export type TherapistTermsData = z.infer<typeof therapistTermsSchema>;

export const therapistTermsUpdateSchema = z.object({
  termsId: z.string().uuid("Invalid terms ID"),
  title: z.string().min(1).max(255).trim().optional(),
  content: z.string().min(10).max(50000).trim().optional(),
  isActive: z.boolean().optional(),
});

export type TherapistTermsUpdateData = z.infer<typeof therapistTermsUpdateSchema>;

// =====================
// SESSION RSVP
// =====================

export const rsvpResponseSchema = z.object({
  token: z.string().min(64, "Invalid token").max(64, "Invalid token"),
  response: z.enum(["accepted", "declined"], {
    message: "Response must be 'accepted' or 'declined'",
  }),
});

export type RsvpResponseData = z.infer<typeof rsvpResponseSchema>;

export const rsvpProposeRescheduleSchema = z.object({
  token: z.string().min(64, "Invalid token").max(64, "Invalid token"),
  proposedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  proposedStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  proposedEndTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  message: z
    .string()
    .max(500, "Message must be 500 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type RsvpProposeRescheduleData = z.infer<typeof rsvpProposeRescheduleSchema>;

export const therapistRescheduleResponseSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  accept: z.boolean(),
  message: z
    .string()
    .max(500, "Message must be 500 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type TherapistRescheduleResponseData = z.infer<typeof therapistRescheduleResponseSchema>;

// Client portal RSVP (authenticated)
export const clientRsvpResponseSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  response: z.enum(["accepted", "declined"], {
    message: "Response must be 'accepted' or 'declined'",
  }),
});

export type ClientRsvpResponseData = z.infer<typeof clientRsvpResponseSchema>;

export const clientProposeRescheduleSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  proposedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  proposedStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  proposedEndTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  message: z
    .string()
    .max(500, "Message must be 500 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ClientProposeRescheduleData = z.infer<typeof clientProposeRescheduleSchema>;

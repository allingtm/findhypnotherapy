import { z } from "zod";

// =====================
// THERAPIST PROFILE
// =====================

export const therapistProfileSchema = z.object({
  professional_title: z
    .string()
    .max(100, "Title must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  credentials: z.array(z.string()).optional(),
  years_experience: z.coerce
    .number()
    .int("Years must be a whole number")
    .min(0, "Years cannot be negative")
    .max(100, "Years must be 100 or less")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(5000, "Bio must be 5000 characters or less")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Phone must be 20 characters or less")
    .optional()
    .or(z.literal("")),
  website_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  booking_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  address_line1: z
    .string()
    .max(200, "Address must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  address_line2: z
    .string()
    .max(200, "Address must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  state_province: z
    .string()
    .max(100, "County/State must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  postal_code: z
    .string()
    .max(20, "Postal code must be 20 characters or less")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  address_visibility: z.enum(["full", "city_only", "hidden"]).optional(),
  session_format: z.array(z.enum(["in-person", "online", "phone"])).optional(),
  offers_free_consultation: z.coerce.boolean().optional(),
  availability_notes: z
    .string()
    .max(1000, "Availability notes must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  meta_description: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional()
    .or(z.literal("")),
});

export type TherapistProfileData = z.infer<typeof therapistProfileSchema>;

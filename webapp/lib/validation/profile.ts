import { z } from "zod";

// =====================
// PROFILE UPDATE
// =====================

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .toLowerCase()
    .trim(),
  photoUrl: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
});

export type ProfileData = z.infer<typeof profileSchema>;

// =====================
// PASSWORD CHANGE
// =====================

export const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or less"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type PasswordData = z.infer<typeof passwordSchema>;

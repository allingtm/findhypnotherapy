import { z } from "zod";

// Service type and price display mode enums
export const serviceTypeValues = ['single_session', 'package', 'programme', 'consultation', 'subscription'] as const;
export const priceDisplayModeValues = ['exact', 'from', 'range', 'contact', 'free'] as const;

export type ServiceType = typeof serviceTypeValues[number];
export type PriceDisplayMode = typeof priceDisplayModeValues[number];

// =====================
// INDIVIDUAL FIELD SCHEMAS (for client-side onBlur validation)
// =====================

export const serviceNameSchema = z
  .string()
  .min(1, "Service name is required")
  .max(100, "Name must be 100 characters or less");

export const serviceDescriptionSchema = z
  .string()
  .max(500, "Description must be 500 characters or less")
  .optional()
  .or(z.literal(""));

export const serviceShortDescriptionSchema = z
  .string()
  .max(100, "Short description must be 100 characters or less")
  .optional()
  .or(z.literal(""));

export const serviceOutcomeFocusSchema = z
  .string()
  .max(200, "Outcome focus must be 200 characters or less")
  .optional()
  .or(z.literal(""));

export const servicePriceSchema = z.coerce
  .number()
  .min(0, "Price must be positive")
  .optional()
  .nullable();

export const servicePriceMinSchema = z.coerce
  .number()
  .min(0, "Minimum price must be positive")
  .optional()
  .nullable();

export const servicePriceMaxSchema = z.coerce
  .number()
  .min(0, "Maximum price must be positive")
  .optional()
  .nullable();

export const serviceDurationSchema = z.coerce
  .number()
  .int("Duration must be a whole number")
  .min(15, "Minimum 15 minutes")
  .max(480, "Maximum 8 hours");

export const serviceSessionCountSchema = z.coerce
  .number()
  .int("Must be a whole number")
  .min(1, "At least 1 session required")
  .max(50, "Maximum 50 sessions");

export const serviceTermsContentSchema = z
  .string()
  .max(5000, "Terms addendum must be 5000 characters or less")
  .optional()
  .or(z.literal(""));

// =====================
// FULL SERVICE SCHEMA (for server-side validation)
// =====================

export const serviceSchema = z.object({
  name: serviceNameSchema,
  description: serviceDescriptionSchema,
  short_description: serviceShortDescriptionSchema,

  // Service classification
  service_type: z.enum(serviceTypeValues).default("single_session"),
  price_display_mode: z.enum(priceDisplayModeValues).default("exact"),

  // Pricing fields
  price: servicePriceSchema,
  price_min: servicePriceMinSchema,
  price_max: servicePriceMaxSchema,
  currency: z.string().max(3).default("GBP"),

  // Session details
  duration_minutes: serviceDurationSchema,
  session_count: serviceSessionCountSchema.default(1),
  session_count_min: z.coerce.number().int().min(1).optional().nullable(),
  session_count_max: z.coerce.number().int().min(1).optional().nullable(),

  // Content fields
  includes: z.array(z.string()).default([]),
  outcome_focus: serviceOutcomeFocusSchema,

  // Display options
  is_active: z.coerce.boolean().default(true),
  is_featured: z.coerce.boolean().default(false),
  show_per_session_price: z.coerce.boolean().default(true),
  show_price: z.coerce.boolean().default(true),
  show_session_details: z.coerce.boolean().default(true),
  show_includes: z.coerce.boolean().default(true),
  show_outcome_focus: z.coerce.boolean().default(true),

  // Service-specific terms addendum (optional)
  terms_content: serviceTermsContentSchema,
}).superRefine((data, ctx) => {
  // Validate price based on display mode
  if (data.price_display_mode === "exact" || data.price_display_mode === "from") {
    if (data.price === undefined || data.price === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for this display mode",
        path: ["price"],
      });
    }
  }

  if (data.price_display_mode === "range") {
    if (data.price_min === undefined || data.price_min === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum price is required for range pricing",
        path: ["price_min"],
      });
    }
    if (data.price_max === undefined || data.price_max === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum price is required for range pricing",
        path: ["price_max"],
      });
    }
    // Only compare if both values are defined numbers
    if (typeof data.price_min === "number" && typeof data.price_max === "number" && data.price_min >= data.price_max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum price must be greater than minimum price",
        path: ["price_max"],
      });
    }
  }

  // Validate session count range
  if (typeof data.session_count_min === "number" && typeof data.session_count_max === "number" &&
      data.session_count_min > data.session_count_max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum sessions must be greater than or equal to minimum",
      path: ["session_count_max"],
    });
  }
});

export type ServiceData = z.infer<typeof serviceSchema>;

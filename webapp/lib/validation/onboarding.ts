import { z } from "zod";

// =====================
// INDIVIDUAL FIELD SCHEMAS (for client-side onBlur validation)
// =====================

// Personal Info
export const firstNameSchema = z
  .string()
  .min(1, "First name is required")
  .max(100, "First name must be 100 characters or less");

export const lastNameSchema = z
  .string()
  .min(1, "Last name is required")
  .max(100, "Last name must be 100 characters or less");

export const phoneSchema = z
  .string()
  .max(50, "Phone number must be 50 characters or less")
  .optional()
  .or(z.literal(""));

// Address
export const addressLine1Schema = z
  .string()
  .max(255, "Address must be 255 characters or less")
  .optional()
  .or(z.literal(""));

export const addressLine2Schema = z
  .string()
  .max(255, "Address must be 255 characters or less")
  .optional()
  .or(z.literal(""));

export const citySchema = z
  .string()
  .max(100, "City must be 100 characters or less")
  .optional()
  .or(z.literal(""));

export const postalCodeSchema = z
  .string()
  .max(20, "Postal code must be 20 characters or less")
  .optional()
  .or(z.literal(""));

export const countrySchema = z
  .string()
  .max(100, "Country must be 100 characters or less")
  .optional()
  .or(z.literal(""));

// Emergency Contact
export const emergencyContactNameSchema = z
  .string()
  .max(200, "Name must be 200 characters or less")
  .optional()
  .or(z.literal(""));

export const emergencyContactPhoneSchema = z
  .string()
  .max(50, "Phone must be 50 characters or less")
  .optional()
  .or(z.literal(""));

export const emergencyContactRelationshipSchema = z
  .string()
  .max(100, "Relationship must be 100 characters or less")
  .optional()
  .or(z.literal(""));

// Health Info
export const healthConditionsSchema = z
  .string()
  .max(2000, "Health conditions must be 2000 characters or less")
  .optional()
  .or(z.literal(""));

export const medicationsSchema = z
  .string()
  .max(1000, "Medications must be 1000 characters or less")
  .optional()
  .or(z.literal(""));

export const allergiesSchema = z
  .string()
  .max(500, "Allergies must be 500 characters or less")
  .optional()
  .or(z.literal(""));

export const gpNameSchema = z
  .string()
  .max(200, "GP name must be 200 characters or less")
  .optional()
  .or(z.literal(""));

export const gpPracticeSchema = z
  .string()
  .max(255, "GP practice must be 255 characters or less")
  .optional()
  .or(z.literal(""));

// =====================
// GROUPED SCHEMAS (for step-level validation)
// =====================

export const personalInfoSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: phoneSchema,
});

export const addressSchema = z.object({
  addressLine1: addressLine1Schema,
  addressLine2: addressLine2Schema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: countrySchema,
});

export const emergencyContactSchema = z.object({
  emergencyContactName: emergencyContactNameSchema,
  emergencyContactPhone: emergencyContactPhoneSchema,
  emergencyContactRelationship: emergencyContactRelationshipSchema,
});

export const healthInfoSchema = z.object({
  healthConditions: healthConditionsSchema,
  medications: medicationsSchema,
  allergies: allergiesSchema,
  gpName: gpNameSchema,
  gpPractice: gpPracticeSchema,
});

// =====================
// FULL ONBOARDING SCHEMA
// =====================

export const onboardingSchema = z.object({
  // Personal Info
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: phoneSchema,
  // Address
  addressLine1: addressLine1Schema,
  addressLine2: addressLine2Schema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: countrySchema,
  // Emergency Contact
  emergencyContactName: emergencyContactNameSchema,
  emergencyContactPhone: emergencyContactPhoneSchema,
  emergencyContactRelationship: emergencyContactRelationshipSchema,
  // Health Info
  healthConditions: healthConditionsSchema,
  medications: medicationsSchema,
  allergies: allergiesSchema,
  gpName: gpNameSchema,
  gpPractice: gpPracticeSchema,
  // Terms
  termsAccepted: z.boolean(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
export type HealthInfoData = z.infer<typeof healthInfoSchema>;

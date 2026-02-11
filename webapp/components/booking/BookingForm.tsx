"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Turnstile } from "@/components/ui/Turnstile";
import { TermsAcceptance } from "./TermsAcceptance";
import { submitBookingAction } from "@/app/actions/bookings";

// Field schemas for client-side validation
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be 100 characters or less");

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be 255 characters or less");

const phoneSchema = z
  .string()
  .max(20, "Phone number must be 20 characters or less")
  .optional();

const notesSchema = z
  .string()
  .max(1000, "Notes must be 1000 characters or less")
  .optional();

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface TherapistTerms {
  id: string;
  title: string;
  content: string;
  version: string;
}

interface BookingFormProps {
  therapistProfileId: string;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  therapistName: string;
  therapistTerms: TherapistTerms | null;
  onSuccess?: () => void;
  serviceId?: string | null;
}

export function BookingForm({
  therapistProfileId,
  selectedDate,
  selectedSlot,
  therapistName,
  therapistTerms,
  onSuccess,
  serviceId,
}: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<"verification_sent" | "pre_verified" | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [acceptedTermsId, setAcceptedTermsId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [notes, setNotes] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const validateField = (field: string, value: string) => {
    try {
      switch (field) {
        case "visitorName":
          nameSchema.parse(value);
          break;
        case "visitorEmail":
          emailSchema.parse(value);
          break;
        case "visitorPhone":
          if (value) phoneSchema.parse(value);
          break;
        case "visitorNotes":
          if (value) notesSchema.parse(value);
          break;
      }
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const message = err.issues[0]?.message || "Invalid input";
        setFieldErrors((prev) => ({ ...prev, [field]: message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedDate || !selectedSlot) {
      setError("Please select a date and time");
      setIsSubmitting(false);
      return;
    }

    // Validate terms acceptance if terms exist
    if (therapistTerms && !termsAccepted) {
      setError("Please accept the Terms & Conditions to continue");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("therapistProfileId", therapistProfileId);
    formData.set("bookingDate", selectedDate);
    formData.set("startTime", selectedSlot.start_time);
    formData.set("endTime", selectedSlot.end_time);

    // Include service ID if selected
    if (serviceId) {
      formData.set("serviceId", serviceId);
    }

    // Include terms acceptance data
    if (termsAccepted && acceptedTermsId) {
      formData.set("termsAccepted", "true");
      formData.set("termsId", acceptedTermsId);
    }

    // Include Turnstile token
    formData.set("turnstileToken", turnstileToken);

    try {
      const result = await submitBookingAction(formData);

      if (result.success) {
        const data = result.data as { bookingId: string; visitorToken?: string; preVerified?: boolean };

        if (data.preVerified && data.visitorToken) {
          // Email already verified - redirect to booking confirmed page
          setSuccessType("pre_verified");
          onSuccess?.();
          // Short delay to show success message before redirect
          setTimeout(() => {
            router.push(`/booking-verified?token=${data.visitorToken}`);
          }, 1500);
        } else {
          // Need email verification
          setSuccessType("verification_sent");
          onSuccess?.();
        }
      } else {
        setError(result.error || "Failed to submit booking");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successType === "pre_verified") {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Intro Call Requested!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your intro call request has been sent to {therapistName}. Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  if (successType === "verification_sent") {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Check your email
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We&apos;ve sent a confirmation link to your email address. Please click
            the link to confirm your booking with {therapistName}.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            The link will expire in 24 hours.
          </p>
        </div>
      </div>
    );
  }

  const isFormDisabled = !selectedDate || !selectedSlot;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Your Details
      </h3>

      {isFormDisabled && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Please select a date and time above to continue.
        </p>
      )}

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div>
          <label
            htmlFor="visitorName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="visitorName"
            name="visitorName"
            required
            maxLength={100}
            disabled={isFormDisabled || isSubmitting}
            onBlur={(e) => validateField("visitorName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.visitorName
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-neutral-600"
            }`}
            placeholder="John Smith"
          />
          {fieldErrors.visitorName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.visitorName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="visitorEmail"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address *
          </label>
          <input
            type="email"
            id="visitorEmail"
            name="visitorEmail"
            required
            maxLength={255}
            disabled={isFormDisabled || isSubmitting}
            onBlur={(e) => validateField("visitorEmail", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.visitorEmail
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-neutral-600"
            }`}
            placeholder="john@example.com"
          />
          {fieldErrors.visitorEmail ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.visitorEmail}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We&apos;ll send a confirmation link to this address
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="visitorPhone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone Number (optional)
          </label>
          <input
            type="tel"
            id="visitorPhone"
            name="visitorPhone"
            maxLength={20}
            disabled={isFormDisabled || isSubmitting}
            onBlur={(e) => validateField("visitorPhone", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.visitorPhone
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-neutral-600"
            }`}
            placeholder="07123 456789"
          />
          {fieldErrors.visitorPhone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.visitorPhone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="visitorNotes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Anything you&apos;d like to share? (optional)
          </label>
          <textarea
            id="visitorNotes"
            name="visitorNotes"
            rows={3}
            maxLength={1000}
            value={notes}
            disabled={isFormDisabled || isSubmitting}
            onChange={(e) => {
              setNotes(e.target.value);
              if (fieldErrors.visitorNotes && e.target.value.length <= 1000) {
                setFieldErrors((prev) => ({ ...prev, visitorNotes: null }));
              }
            }}
            onBlur={(e) => validateField("visitorNotes", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
              fieldErrors.visitorNotes
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-neutral-600"
            }`}
            placeholder="Briefly describe what you're looking for help with..."
          />
          <div className="flex justify-between mt-1">
            {fieldErrors.visitorNotes ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.visitorNotes}
              </p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${notes.length > 900 ? "text-orange-500" : "text-gray-400"}`}>
              {notes.length}/1000
            </span>
          </div>
        </div>

        {/* Terms & Conditions */}
        {therapistTerms && (
          <TermsAcceptance
            terms={{
              id: therapistTerms.id,
              title: therapistTerms.title,
              content: therapistTerms.content,
            }}
            accepted={termsAccepted}
            onAcceptChange={(accepted, termsId) => {
              setTermsAccepted(accepted);
              setAcceptedTermsId(termsId);
            }}
            disabled={isFormDisabled || isSubmitting}
          />
        )}

        {/* Turnstile spam protection */}
        {!isFormDisabled && (
          <div className="mb-4">
            <Turnstile onVerify={handleTurnstileVerify} />
          </div>
        )}

        <Button
          type="submit"
          disabled={isFormDisabled || isSubmitting || (!!therapistTerms && !termsAccepted)}
          loading={isSubmitting}
          className="w-full"
        >
          Request Booking
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          You&apos;ll receive an email to confirm your booking. The therapist will
          then review and confirm your appointment.
        </p>
      </form>
    </div>
  );
}

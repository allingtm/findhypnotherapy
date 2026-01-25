"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { submitBookingAction } from "@/app/actions/bookings";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface BookingFormProps {
  therapistProfileId: string;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  therapistName: string;
  onSuccess?: () => void;
}

export function BookingForm({
  therapistProfileId,
  selectedDate,
  selectedSlot,
  therapistName,
  onSuccess,
}: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<"verification_sent" | "pre_verified" | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedDate || !selectedSlot) {
      setError("Please select a date and time");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("therapistProfileId", therapistProfileId);
    formData.set("bookingDate", selectedDate);
    formData.set("startTime", selectedSlot.start_time);
    formData.set("endTime", selectedSlot.end_time);

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
            Booking Submitted!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your booking request has been sent to {therapistName}. Redirecting you now...
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
            disabled={isFormDisabled || isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="John Smith"
          />
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
            disabled={isFormDisabled || isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="john@example.com"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            We&apos;ll send a confirmation link to this address
          </p>
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
            disabled={isFormDisabled || isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="07123 456789"
          />
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
            disabled={isFormDisabled || isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Briefly describe what you're looking for help with..."
          />
        </div>

        <Button
          type="submit"
          disabled={isFormDisabled || isSubmitting}
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

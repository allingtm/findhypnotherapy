"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateTherapistProfileAction } from "@/app/actions/therapist-profile";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Tables } from "@/lib/types/database";

interface SessionDetailsSectionProps {
  profile: Tables<"therapist_profiles">;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending}>
      Save Session Details
    </Button>
  );
}

function TextArea({
  label,
  error,
  className = "",
  id,
  ...props
}: {
  label: string;
  error?: string;
  className?: string;
  id?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300 dark:border-neutral-600"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function SessionDetailsSection({ profile }: SessionDetailsSectionProps) {
  const [state, formAction] = useActionState(updateTherapistProfileAction, {
    success: false,
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Session Details
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        How you offer your services to clients.
      </p>

      <form action={formAction} className="space-y-4">
        {state.error && <Alert type="error" message={state.error} />}
        {state.success && (
          <Alert type="success" message="Session details updated successfully!" />
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Formats Offered
          </label>
          <div className="flex flex-wrap gap-4">
            {["in-person", "online", "phone"].map((format) => (
              <label key={format} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="session_format"
                  value={format}
                  defaultChecked={profile.session_format?.includes(format)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {format}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="offers_free_consultation"
              value="true"
              defaultChecked={profile.offers_free_consultation || false}
              className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Offer free initial consultation
            </span>
          </label>
        </div>

        <TextArea
          label="Availability Notes"
          name="availability_notes"
          defaultValue={profile.availability_notes || ""}
          placeholder="e.g., Monday-Friday 9am-5pm, Saturdays by appointment"
          rows={3}
        />

        {/* Hidden fields to preserve other data */}
        <input type="hidden" name="professional_title" defaultValue={profile.professional_title || ""} />
        <input type="hidden" name="credentials" defaultValue={profile.credentials?.join(", ") || ""} />
        <input type="hidden" name="years_experience" defaultValue={profile.years_experience?.toString() || ""} />
        <input type="hidden" name="bio" defaultValue={profile.bio || ""} />
        <input type="hidden" name="phone" defaultValue={profile.phone || ""} />
        <input type="hidden" name="website_url" defaultValue={profile.website_url || ""} />
        <input type="hidden" name="booking_url" defaultValue={profile.booking_url || ""} />
        <input type="hidden" name="address_line1" defaultValue={profile.address_line1 || ""} />
        <input type="hidden" name="address_line2" defaultValue={profile.address_line2 || ""} />
        <input type="hidden" name="city" defaultValue={profile.city || ""} />
        <input type="hidden" name="state_province" defaultValue={profile.state_province || ""} />
        <input type="hidden" name="postal_code" defaultValue={profile.postal_code || ""} />
        <input type="hidden" name="country" defaultValue={profile.country || "United Kingdom"} />
        <input type="hidden" name="address_visibility" defaultValue={profile.address_visibility || "full"} />
        <input type="hidden" name="meta_description" defaultValue={profile.meta_description || ""} />

        <div className="flex gap-3 pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

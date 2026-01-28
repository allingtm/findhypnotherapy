"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateTherapistProfileAction } from "@/app/actions/therapist-profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { BannerUpload } from "../BannerUpload";
import { MobileBannerUpload } from "../MobileBannerUpload";
import type { Tables } from "@/lib/types/database";

interface BasicInfoSectionProps {
  profile: Tables<"therapist_profiles">;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending}>
      Save Basic Info
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

export function BasicInfoSection({ profile }: BasicInfoSectionProps) {
  const [state, formAction] = useActionState(updateTherapistProfileAction, {
    success: false,
  });

  return (
    <div className="space-y-6">
      {/* Profile Banners */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Profile Banners
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Add banner images to personalise your profile. The desktop banner displays on larger
          screens, while the mobile banner is optimised for phones.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desktop Banner */}
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Desktop Banner
            </h4>
            <BannerUpload currentBannerUrl={profile.banner_url} />
          </div>

          {/* Mobile Banner */}
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile Banner
            </h4>
            <MobileBannerUpload currentMobileBannerUrl={profile.mobile_banner_url} />
          </div>
        </div>
      </div>

      {/* Professional Information Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Professional Information
        </h3>

        <form action={formAction} className="space-y-4">
          {state.error && <Alert type="error" message={state.error} />}
          {state.success && (
            <Alert type="success" message="Basic info updated successfully!" />
          )}

          <Input
            label="Professional Title"
            type="text"
            name="professional_title"
            defaultValue={profile.professional_title || ""}
            placeholder="e.g., Clinical Hypnotherapist, Certified Hypnotherapy Practitioner"
          />

          <Input
            label="Credentials (comma-separated)"
            type="text"
            name="credentials"
            defaultValue={profile.credentials?.join(", ") || ""}
            placeholder="e.g., CHt, CCHt, NLP Practitioner"
          />

          <Input
            label="Years of Experience"
            type="number"
            name="years_experience"
            defaultValue={profile.years_experience?.toString() || ""}
            placeholder="Enter number of years"
            min="0"
            max="100"
          />

          <TextArea
            label="Bio"
            name="bio"
            defaultValue={profile.bio || ""}
            placeholder="Tell potential clients about yourself, your approach, and what makes you unique..."
            rows={6}
          />

          {/* Hidden fields to preserve other data */}
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
          {profile.session_format?.map((format) => (
            <input key={format} type="hidden" name="session_format" value={format} />
          ))}
          <input type="hidden" name="offers_free_consultation" value={profile.offers_free_consultation ? "true" : ""} />
          <input type="hidden" name="availability_notes" defaultValue={profile.availability_notes || ""} />
          <input type="hidden" name="meta_description" defaultValue={profile.meta_description || ""} />

          <div className="flex gap-3 pt-4">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

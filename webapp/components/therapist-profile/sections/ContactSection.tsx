"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateTherapistProfileAction } from "@/app/actions/therapist-profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import type { Tables } from "@/lib/types/database";

interface ContactSectionProps {
  profile: Tables<"therapist_profiles">;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending}>
      Save Contact Info
    </Button>
  );
}

export function ContactSection({ profile }: ContactSectionProps) {
  const [state, formAction] = useActionState(updateTherapistProfileAction, {
    success: false,
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Contact Information
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        How potential clients can reach you.
      </p>

      <form action={formAction} className="space-y-4">
        {state.error && <Alert type="error" message={state.error} />}
        {state.success && (
          <Alert type="success" message="Contact info updated successfully!" />
        )}

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          defaultValue={profile.phone || ""}
          placeholder="+44 123 456 7890"
        />

        <Input
          label="Website URL"
          type="url"
          name="website_url"
          defaultValue={profile.website_url || ""}
          placeholder="https://yourwebsite.com"
        />

        <div>
          <Input
            label="Booking URL"
            type="url"
            name="booking_url"
            defaultValue={profile.booking_url || ""}
            placeholder="https://calendly.com/yourname"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
            External booking link (if you use a different booking system)
          </p>
        </div>

        {/* Hidden fields to preserve other data */}
        <input type="hidden" name="professional_title" defaultValue={profile.professional_title || ""} />
        <input type="hidden" name="credentials" defaultValue={profile.credentials?.join(", ") || ""} />
        <input type="hidden" name="years_experience" defaultValue={profile.years_experience?.toString() || ""} />
        <input type="hidden" name="bio" defaultValue={profile.bio || ""} />
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
  );
}

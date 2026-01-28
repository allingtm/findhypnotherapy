"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateTherapistProfileAction } from "@/app/actions/therapist-profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import type { Tables } from "@/lib/types/database";

interface LocationSectionProps {
  profile: Tables<"therapist_profiles">;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending}>
      Save Location
    </Button>
  );
}

export function LocationSection({ profile }: LocationSectionProps) {
  const [state, formAction] = useActionState(updateTherapistProfileAction, {
    success: false,
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Practice Location
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Where you see clients in person.
      </p>

      <form action={formAction} className="space-y-4">
        {state.error && <Alert type="error" message={state.error} />}
        {state.success && (
          <Alert type="success" message="Location updated successfully!" />
        )}

        <Input
          label="Address Line 1"
          type="text"
          name="address_line1"
          defaultValue={profile.address_line1 || ""}
          placeholder="123 Main Street"
        />

        <Input
          label="Address Line 2"
          type="text"
          name="address_line2"
          defaultValue={profile.address_line2 || ""}
          placeholder="Suite 100"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            type="text"
            name="city"
            defaultValue={profile.city || ""}
            placeholder="London"
          />

          <Input
            label="County/State"
            type="text"
            name="state_province"
            defaultValue={profile.state_province || ""}
            placeholder="Greater London"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Postal Code"
            type="text"
            name="postal_code"
            defaultValue={profile.postal_code || ""}
            placeholder="SW1A 1AA"
          />

          <Input
            label="Country"
            type="text"
            name="country"
            defaultValue={profile.country || "United Kingdom"}
            placeholder="United Kingdom"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address Visibility on Public Profile
          </label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
              <input
                type="radio"
                name="address_visibility"
                value="full"
                defaultChecked={
                  !profile.address_visibility ||
                  profile.address_visibility === "full"
                }
                className="mt-0.5 w-4 h-4 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Show full address
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Display your complete address on your public profile
                </span>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
              <input
                type="radio"
                name="address_visibility"
                value="city_only"
                defaultChecked={profile.address_visibility === "city_only"}
                className="mt-0.5 w-4 h-4 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Show city/county only
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Only display your city, county/state, and country
                </span>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
              <input
                type="radio"
                name="address_visibility"
                value="hidden"
                defaultChecked={profile.address_visibility === "hidden"}
                className="mt-0.5 w-4 h-4 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Hide location
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Do not display any location information on your profile
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Hidden fields to preserve other data */}
        <input type="hidden" name="professional_title" defaultValue={profile.professional_title || ""} />
        <input type="hidden" name="credentials" defaultValue={profile.credentials?.join(", ") || ""} />
        <input type="hidden" name="years_experience" defaultValue={profile.years_experience?.toString() || ""} />
        <input type="hidden" name="bio" defaultValue={profile.bio || ""} />
        <input type="hidden" name="phone" defaultValue={profile.phone || ""} />
        <input type="hidden" name="website_url" defaultValue={profile.website_url || ""} />
        <input type="hidden" name="booking_url" defaultValue={profile.booking_url || ""} />
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

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateTherapistProfileAction,
  togglePublishProfileAction,
} from "@/app/actions/therapist-profile";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { OgImageUpload } from "../OgImageUpload";
import type { Tables } from "@/lib/types/database";

interface PublishSectionProps {
  profile: Tables<"therapist_profiles">;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending}>
      {children}
    </Button>
  );
}

function PublishButton({ isPublished }: { isPublished: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={isPublished ? "secondary" : "primary"}
      loading={pending}
    >
      {isPublished ? "Unpublish" : "Publish Profile"}
    </Button>
  );
}

export function PublishSection({ profile }: PublishSectionProps) {
  const [seoState, seoAction] = useActionState(updateTherapistProfileAction, {
    success: false,
  });
  const [publishState, publishAction] = useActionState(
    togglePublishProfileAction,
    { success: false }
  );

  return (
    <div className="space-y-6">
      {/* Profile Status Banner */}
      <div
        className={`rounded-lg p-4 ${
          profile.is_published
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3
              className={`font-medium ${
                profile.is_published
                  ? "text-green-800 dark:text-green-200"
                  : "text-yellow-800 dark:text-yellow-200"
              }`}
            >
              {profile.is_published ? "Profile Published" : "Profile Not Published"}
            </h3>
            <p
              className={`text-sm ${
                profile.is_published
                  ? "text-green-600 dark:text-green-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {profile.is_published
                ? `Your profile is visible in the directory at /directory/${profile.slug}`
                : "Your profile is hidden from the public directory. Publish it when ready."}
            </p>
          </div>
          <form action={publishAction} className="flex-shrink-0">
            <input
              type="hidden"
              name="publish"
              value={profile.is_published ? "false" : "true"}
            />
            <PublishButton isPublished={profile.is_published || false} />
          </form>
        </div>
        {publishState.error && (
          <div className="mt-3">
            <Alert type="error" message={publishState.error} />
          </div>
        )}
        {publishState.success && (
          <div className="mt-3">
            <Alert
              type="success"
              message={
                profile.is_published
                  ? "Profile unpublished successfully!"
                  : "Profile published successfully!"
              }
            />
          </div>
        )}
      </div>

      {/* Social Sharing Image */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Social Sharing Image
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This image appears when your profile is shared on Facebook, LinkedIn,
          Twitter and other social media platforms.
        </p>
        <OgImageUpload currentOgImageUrl={profile.og_image_url} />
      </div>

      {/* SEO Settings */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Search Engine Optimization (SEO)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Optimize how your profile appears in search engine results.
        </p>

        <form action={seoAction} className="space-y-4">
          {seoState.error && <Alert type="error" message={seoState.error} />}
          {seoState.success && (
            <Alert type="success" message="SEO settings updated successfully!" />
          )}

          <div>
            <label
              htmlFor="meta_description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              defaultValue={profile.meta_description || ""}
              placeholder="A brief description for search results (max 160 characters)"
              maxLength={160}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This description appears in search engine results. Keep it concise and
              compelling (max 160 characters).
            </p>
          </div>

          {/* Hidden fields to preserve other data */}
          <input
            type="hidden"
            name="professional_title"
            defaultValue={profile.professional_title || ""}
          />
          <input
            type="hidden"
            name="credentials"
            defaultValue={profile.credentials?.join(", ") || ""}
          />
          <input
            type="hidden"
            name="years_experience"
            defaultValue={profile.years_experience?.toString() || ""}
          />
          <input type="hidden" name="bio" defaultValue={profile.bio || ""} />
          <input type="hidden" name="phone" defaultValue={profile.phone || ""} />
          <input
            type="hidden"
            name="website_url"
            defaultValue={profile.website_url || ""}
          />
          <input
            type="hidden"
            name="booking_url"
            defaultValue={profile.booking_url || ""}
          />
          <input
            type="hidden"
            name="address_line1"
            defaultValue={profile.address_line1 || ""}
          />
          <input
            type="hidden"
            name="address_line2"
            defaultValue={profile.address_line2 || ""}
          />
          <input type="hidden" name="city" defaultValue={profile.city || ""} />
          <input
            type="hidden"
            name="state_province"
            defaultValue={profile.state_province || ""}
          />
          <input
            type="hidden"
            name="postal_code"
            defaultValue={profile.postal_code || ""}
          />
          <input
            type="hidden"
            name="country"
            defaultValue={profile.country || "United Kingdom"}
          />
          <input
            type="hidden"
            name="address_visibility"
            defaultValue={profile.address_visibility || "full"}
          />
          {profile.session_format?.map((format) => (
            <input key={format} type="hidden" name="session_format" value={format} />
          ))}
          <input
            type="hidden"
            name="offers_free_consultation"
            value={profile.offers_free_consultation ? "true" : ""}
          />
          <input
            type="hidden"
            name="availability_notes"
            defaultValue={profile.availability_notes || ""}
          />

          <div className="flex gap-3 pt-4">
            <SubmitButton>Save SEO Settings</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

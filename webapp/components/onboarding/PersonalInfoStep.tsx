"use client";

import { Input } from "@/components/ui/Input";
import type { OnboardingData } from "./OnboardingForm";
import type { OnboardingFieldRequirement } from "@/lib/types/database";

interface PersonalInfoStepProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string[]>;
  phoneRequirement?: OnboardingFieldRequirement;
}

export function PersonalInfoStep({ data, onChange, errors, phoneRequirement = "optional" }: PersonalInfoStepProps) {
  const phoneLabel = phoneRequirement === "required"
    ? "Phone Number *"
    : phoneRequirement === "hidden"
    ? null
    : "Phone Number (optional)";

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Please provide your contact details so your therapist can reach you.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name *"
          value={data.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          placeholder="John"
          error={errors.firstName?.[0]}
        />
        <Input
          label="Last Name *"
          value={data.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          placeholder="Smith"
          error={errors.lastName?.[0]}
        />
      </div>

      {phoneLabel && (
        <Input
          label={phoneLabel}
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="07123 456789"
          error={errors.phone?.[0]}
        />
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Your email address ({data.firstName ? "already on file" : "from your invitation"}) will be used for appointment notifications and correspondence.
        </p>
      </div>
    </div>
  );
}

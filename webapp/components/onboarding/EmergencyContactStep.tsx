"use client";

import { Input } from "@/components/ui/Input";
import type { OnboardingData } from "./OnboardingForm";
import type { OnboardingFieldRequirement } from "@/lib/types/database";

interface EmergencyContactStepProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string[]>;
  requirement?: OnboardingFieldRequirement;
}

export function EmergencyContactStep({ data, onChange, errors, requirement = "required" }: EmergencyContactStepProps) {
  const isRequired = requirement === "required";
  const suffix = isRequired ? " *" : " (optional)";

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {isRequired
          ? "Please provide details of someone we can contact in case of emergency."
          : "If you'd like, you can provide details of someone to contact in case of emergency."}
      </p>

      <Input
        label={`Contact Name${suffix}`}
        value={data.emergencyContactName}
        onChange={(e) => onChange({ emergencyContactName: e.target.value })}
        placeholder="Jane Smith"
        error={errors.emergencyContactName?.[0]}
      />

      <Input
        label={`Contact Phone${suffix}`}
        type="tel"
        value={data.emergencyContactPhone}
        onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
        placeholder="07123 456789"
        error={errors.emergencyContactPhone?.[0]}
      />

      <Input
        label="Relationship (optional)"
        value={data.emergencyContactRelationship}
        onChange={(e) => onChange({ emergencyContactRelationship: e.target.value })}
        placeholder="Partner, Parent, Friend, etc."
        error={errors.emergencyContactRelationship?.[0]}
      />

      {isRequired && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Important:</strong> Emergency contact details are required for your safety. This person will only be contacted if there is genuine concern for your wellbeing.
          </p>
        </div>
      )}

      {!isRequired && (
        <div className="bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Emergency contact details are optional. You can skip this step if you prefer.
          </p>
        </div>
      )}
    </div>
  );
}

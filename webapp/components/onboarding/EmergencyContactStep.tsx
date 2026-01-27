"use client";

import { Input } from "@/components/ui/Input";
import type { OnboardingData } from "./OnboardingForm";

interface EmergencyContactStepProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string[]>;
}

export function EmergencyContactStep({ data, onChange, errors }: EmergencyContactStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Please provide details of someone we can contact in case of emergency.
      </p>

      <Input
        label="Contact Name *"
        value={data.emergencyContactName}
        onChange={(e) => onChange({ emergencyContactName: e.target.value })}
        placeholder="Jane Smith"
        error={errors.emergencyContactName?.[0]}
      />

      <Input
        label="Contact Phone *"
        type="tel"
        value={data.emergencyContactPhone}
        onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
        placeholder="07123 456789"
        error={errors.emergencyContactPhone?.[0]}
      />

      <Input
        label="Relationship"
        value={data.emergencyContactRelationship}
        onChange={(e) => onChange({ emergencyContactRelationship: e.target.value })}
        placeholder="Partner, Parent, Friend, etc."
        error={errors.emergencyContactRelationship?.[0]}
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-6">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Important:</strong> Emergency contact details are required for your safety. This person will only be contacted if there is genuine concern for your wellbeing.
        </p>
      </div>
    </div>
  );
}

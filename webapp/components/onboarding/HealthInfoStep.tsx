"use client";

import { Input } from "@/components/ui/Input";
import type { OnboardingData } from "./OnboardingForm";

interface HealthInfoStepProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string[]>;
}

export function HealthInfoStep({ data, onChange, errors }: HealthInfoStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This information helps your therapist understand your health background and provide appropriate care.
      </p>

      <div>
        <label
          htmlFor="health-conditions"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Health Conditions
        </label>
        <textarea
          id="health-conditions"
          value={data.healthConditions}
          onChange={(e) => onChange({ healthConditions: e.target.value })}
          placeholder="Please list any medical conditions, mental health diagnoses, or ongoing health concerns..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.healthConditions && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.healthConditions[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="medications"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Current Medications
        </label>
        <textarea
          id="medications"
          value={data.medications}
          onChange={(e) => onChange({ medications: e.target.value })}
          placeholder="List any medications you are currently taking, including supplements..."
          rows={2}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.medications && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.medications[0]}
          </p>
        )}
      </div>

      <Input
        label="Allergies"
        value={data.allergies}
        onChange={(e) => onChange({ allergies: e.target.value })}
        placeholder="Any known allergies..."
        error={errors.allergies?.[0]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="GP / Doctor Name"
          value={data.gpName}
          onChange={(e) => onChange({ gpName: e.target.value })}
          placeholder="Dr. Sarah Jones"
          error={errors.gpName?.[0]}
        />
        <Input
          label="GP Practice"
          value={data.gpPractice}
          onChange={(e) => onChange({ gpPractice: e.target.value })}
          placeholder="City Health Centre"
          error={errors.gpPractice?.[0]}
        />
      </div>

      <div className="bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All health information is optional but helps your therapist provide the best possible care. This information is kept strictly confidential.
        </p>
      </div>
    </div>
  );
}

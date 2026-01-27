"use client";

import { Input } from "@/components/ui/Input";
import type { OnboardingData } from "./OnboardingForm";

interface AddressStepProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string[]>;
}

export function AddressStep({ data, onChange, errors }: AddressStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your address is optional but may be useful for home visits or correspondence.
      </p>

      <Input
        label="Address Line 1"
        value={data.addressLine1}
        onChange={(e) => onChange({ addressLine1: e.target.value })}
        placeholder="123 Main Street"
        error={errors.addressLine1?.[0]}
      />

      <Input
        label="Address Line 2"
        value={data.addressLine2}
        onChange={(e) => onChange({ addressLine2: e.target.value })}
        placeholder="Apartment 4B"
        error={errors.addressLine2?.[0]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="London"
          error={errors.city?.[0]}
        />
        <Input
          label="Postal Code"
          value={data.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
          placeholder="SW1A 1AA"
          error={errors.postalCode?.[0]}
        />
      </div>

      <Input
        label="Country"
        value={data.country}
        onChange={(e) => onChange({ country: e.target.value })}
        placeholder="United Kingdom"
        error={errors.country?.[0]}
      />

      <div className="bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All address fields are optional. You can skip this step if you prefer not to provide your address at this time.
        </p>
      </div>
    </div>
  );
}

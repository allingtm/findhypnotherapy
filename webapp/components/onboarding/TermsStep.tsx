"use client";

import type { OnboardingData } from "./OnboardingForm";

interface TermsStepProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string[]>;
  terms: {
    id: string;
    title: string;
    content: string;
  };
}

export function TermsStep({ data, onChange, errors, terms }: TermsStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Please read and accept the following terms and conditions to complete your registration.
      </p>

      {/* Terms Content */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 rounded-t-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {terms.title}
          </h3>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {terms.content}
          </div>
        </div>
      </div>

      {/* Accept Checkbox */}
      <div className="mt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.termsAccepted}
            onChange={(e) => onChange({ termsAccepted: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800"
          />
          <span className="text-gray-700 dark:text-gray-300">
            I have read, understood, and agree to the above Terms & Conditions. I understand that my information will be kept confidential and used only for the purpose of my therapy sessions.
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.termsAccepted[0]}
          </p>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          By completing this registration, you consent to your therapist storing and processing your personal data for the purpose of providing therapy services.
        </p>
      </div>
    </div>
  );
}

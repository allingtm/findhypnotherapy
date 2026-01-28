"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSpecializationsAction } from "@/app/actions/therapist-profile";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Specialization {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

interface SpecializationsSectionProps {
  specializations: Specialization[];
  selectedSpecializationIds: string[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" loading={pending}>
      Save Specialisations
    </Button>
  );
}

export function SpecializationsSection({
  specializations,
  selectedSpecializationIds,
}: SpecializationsSectionProps) {
  const [state, formAction] = useActionState(updateSpecializationsAction, {
    success: false,
  });

  // Group specializations by category
  const groupedSpecializations = specializations.reduce(
    (acc, spec) => {
      const category = spec.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(spec);
      return acc;
    },
    {} as Record<string, Specialization[]>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Specialisations
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select the issues and areas you specialise in treating. This helps
        clients find you when searching the directory.
      </p>

      <form action={formAction} className="space-y-6">
        {state.error && <Alert type="error" message={state.error} />}
        {state.success && (
          <Alert type="success" message="Specialisations updated successfully!" />
        )}

        {Object.entries(groupedSpecializations).map(([category, specs]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {specs.map((spec) => (
                <label
                  key={spec.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="specializations"
                    value={spec.id}
                    defaultChecked={selectedSpecializationIds.includes(spec.id)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {spec.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

"use client"

import { IconCheck } from "@tabler/icons-react"

interface WizardProgressProps {
  currentStep: number
  steps: { id: string; label: string }[]
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-neutral-700 dark:text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <IconCheck className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1 text-xs hidden sm:block ${
                  index <= currentStep
                    ? "text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 lg:w-16 h-1 mx-1 sm:mx-2 rounded ${
                  index < currentStep
                    ? "bg-green-500"
                    : "bg-gray-200 dark:bg-neutral-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

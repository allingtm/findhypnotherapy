"use client"

import { Button } from "@/components/ui/Button"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  isEditing: boolean
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-neutral-700">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
        >
          <IconChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {isLastStep ? (
          <Button type="button" onClick={onSubmit} loading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Service"}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={isSubmitting}>
            Next
            <IconChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}

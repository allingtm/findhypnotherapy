"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { AddressStep } from "./AddressStep";
import { EmergencyContactStep } from "./EmergencyContactStep";
import { HealthInfoStep } from "./HealthInfoStep";
import { TermsStep } from "./TermsStep";
import { completeClientOnboardingAction } from "@/app/actions/clients";
import { IconCheck, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { OnboardingFieldRequirement, OnboardingRequirements } from "@/lib/types/database";
import { DEFAULT_ONBOARDING_REQUIREMENTS } from "@/lib/types/database";

export interface ServiceInfo {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  durationMinutes: number | null;
  onboardingRequirements: OnboardingRequirements | null;
}

interface OnboardingFormProps {
  token: string;
  therapistName: string;
  clientEmail: string;
  prefillFirstName?: string | null;
  prefillLastName?: string | null;
  terms: {
    id: string;
    title: string;
    content: string;
  };
  service?: ServiceInfo | null;
}

export interface OnboardingData {
  // Personal Info
  firstName: string;
  lastName: string;
  phone: string;
  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  // Health Info
  healthConditions: string;
  medications: string;
  allergies: string;
  gpName: string;
  gpPractice: string;
  // Terms
  termsAccepted: boolean;
}

interface StepConfig {
  id: string;
  title: string;
  description: string;
  requirementKey?: keyof OnboardingRequirements;
}

const ALL_STEPS: StepConfig[] = [
  { id: "personal", title: "Personal Info", description: "Your contact details" },
  { id: "address", title: "Address", description: "Your postal address", requirementKey: "address" },
  { id: "emergency", title: "Emergency Contact", description: "In case of emergency", requirementKey: "emergency_contact" },
  { id: "health", title: "Health Info", description: "Relevant health information", requirementKey: "health_info" },
  { id: "terms", title: "Terms", description: "Review and accept" },
];

export function OnboardingForm({
  token,
  therapistName,
  clientEmail,
  prefillFirstName,
  prefillLastName,
  terms,
  service,
}: OnboardingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Get onboarding requirements - use service-specific if available, otherwise defaults
  const requirements: OnboardingRequirements = useMemo(() => {
    return service?.onboardingRequirements || DEFAULT_ONBOARDING_REQUIREMENTS;
  }, [service]);

  // Helper to get requirement level
  const getRequirement = (key: keyof OnboardingRequirements): OnboardingFieldRequirement => {
    return requirements[key] || "optional";
  };

  // Filter steps based on requirements (hide steps where requirement is "hidden")
  const activeSteps = useMemo(() => {
    const getReq = (key: keyof OnboardingRequirements): OnboardingFieldRequirement => {
      return requirements[key] || "optional";
    };
    return ALL_STEPS.filter((step) => {
      if (!step.requirementKey) return true; // Always show personal and terms
      // For health info, show if either health_info or gp_info is not hidden
      if (step.requirementKey === "health_info") {
        return getReq("health_info") !== "hidden" || getReq("gp_info") !== "hidden";
      }
      return getReq(step.requirementKey) !== "hidden";
    });
  }, [requirements]);

  const [formData, setFormData] = useState<OnboardingData>({
    firstName: prefillFirstName || "",
    lastName: prefillLastName || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    healthConditions: "",
    medications: "",
    allergies: "",
    gpName: "",
    gpPractice: "",
    termsAccepted: false,
  });

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string[]> = {};
    const currentStepConfig = activeSteps[currentStep];

    switch (currentStepConfig.id) {
      case "personal":
        // First and last name are always required
        if (!formData.firstName.trim()) {
          errors.firstName = ["First name is required"];
        }
        if (!formData.lastName.trim()) {
          errors.lastName = ["Last name is required"];
        }
        // Phone is required only if phone requirement is "required"
        if (getRequirement("phone") === "required" && !formData.phone.trim()) {
          errors.phone = ["Phone number is required"];
        }
        break;
      case "address":
        // Only validate if address requirement is "required"
        if (getRequirement("address") === "required") {
          if (!formData.addressLine1.trim()) {
            errors.addressLine1 = ["Address is required"];
          }
          if (!formData.city.trim()) {
            errors.city = ["City is required"];
          }
          if (!formData.postalCode.trim()) {
            errors.postalCode = ["Postal code is required"];
          }
        }
        break;
      case "emergency":
        // Only validate if emergency_contact requirement is "required"
        if (getRequirement("emergency_contact") === "required") {
          if (!formData.emergencyContactName.trim()) {
            errors.emergencyContactName = ["Emergency contact name is required"];
          }
          if (!formData.emergencyContactPhone.trim()) {
            errors.emergencyContactPhone = ["Emergency contact phone is required"];
          }
        }
        break;
      case "health":
        // Health info and GP info can each be required independently
        if (getRequirement("health_info") === "required") {
          // We don't strictly require health fields as they're typically just informational
          // But we could add validation here if needed
        }
        if (getRequirement("gp_info") === "required") {
          if (!formData.gpName.trim()) {
            errors.gpName = ["GP name is required"];
          }
          if (!formData.gpPractice.trim()) {
            errors.gpPractice = ["GP practice is required"];
          }
        }
        break;
      case "terms":
        if (!formData.termsAccepted) {
          errors.termsAccepted = ["You must accept the terms and conditions"];
        }
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await completeClientOnboardingAction({
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        addressLine1: formData.addressLine1 || undefined,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
        healthConditions: formData.healthConditions || undefined,
        medications: formData.medications || undefined,
        allergies: formData.allergies || undefined,
        gpName: formData.gpName || undefined,
        gpPractice: formData.gpPractice || undefined,
        termsAccepted: true,
      });

      if (result.success) {
        router.push("/client-onboard/complete");
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setError(result.error || "Failed to complete onboarding");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === activeSteps.length - 1;
  const currentStepConfig = activeSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Client Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome! {therapistName} has invited you to complete your profile.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {clientEmail}
          </p>
        </div>

        {/* Service Info Banner */}
        {service && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{service.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-blue-600 dark:text-blue-400">
              {service.durationMinutes && (
                <span>{service.durationMinutes} minutes</span>
              )}
              {service.price && (
                <span>£{service.price}</span>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {activeSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
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
                {index < activeSteps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 rounded ${
                      index < currentStep
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-neutral-700"
                    }`}
                    style={{ width: "60px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentStepConfig.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentStepConfig.description}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 p-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStepConfig.id === "personal" && (
              <PersonalInfoStep
                data={formData}
                onChange={updateFormData}
                errors={fieldErrors}
                phoneRequirement={getRequirement("phone")}
              />
            )}
            {currentStepConfig.id === "address" && (
              <AddressStep
                data={formData}
                onChange={updateFormData}
                errors={fieldErrors}
                requirement={getRequirement("address")}
              />
            )}
            {currentStepConfig.id === "emergency" && (
              <EmergencyContactStep
                data={formData}
                onChange={updateFormData}
                errors={fieldErrors}
                requirement={getRequirement("emergency_contact")}
              />
            )}
            {currentStepConfig.id === "health" && (
              <HealthInfoStep
                data={formData}
                onChange={updateFormData}
                errors={fieldErrors}
                healthRequirement={getRequirement("health_info")}
                gpRequirement={getRequirement("gp_info")}
              />
            )}
            {currentStepConfig.id === "terms" && (
              <TermsStep
                data={formData}
                onChange={updateFormData}
                errors={fieldErrors}
                terms={terms}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              <IconChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {isLastStep ? (
              <Button onClick={handleSubmit} loading={isSubmitting}>
                Complete Registration
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <IconChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Your information is kept confidential and will only be shared with your therapist.
        </p>
      </div>
    </div>
  );
}

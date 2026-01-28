import { notFound } from "next/navigation";
import { getInvitationByTokenAction } from "@/app/actions/clients";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import Link from "next/link";

export const metadata = {
  title: "Complete Your Profile | Find Hypnotherapy",
  description: "Complete your client profile to start your therapy journey",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ClientOnboardPage({ params }: PageProps) {
  const { token } = await params;

  const result = await getInvitationByTokenAction(token);

  if (!result.success || !result.data) {
    // Show error state for expired/invalid tokens
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid or Expired Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {result.error || "This invitation link is no longer valid. Please contact your therapist for a new invitation."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const invitation = result.data as {
    invitationId: string;
    clientId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    therapistName: string;
    terms: {
      id: string;
      title: string;
      content: string;
    };
    service: {
      id: string;
      name: string;
      description: string | null;
      price: number | null;
      durationMinutes: number | null;
      onboardingRequirements: Record<string, string> | null;
    } | null;
  };

  return (
    <OnboardingForm
      token={token}
      therapistName={invitation.therapistName}
      clientEmail={invitation.email}
      prefillFirstName={invitation.firstName}
      prefillLastName={invitation.lastName}
      terms={invitation.terms}
      service={invitation.service}
    />
  );
}

import { Metadata } from "next";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Error | Find Hypnotherapy",
  description: "Unable to process your request",
};

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function SessionRsvpErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason;

  const getErrorMessage = (reason: string | undefined): string => {
    switch (reason) {
      case "invalid_token":
        return "The link you used is invalid. Please check your email for the correct link.";
      case "invalid_action":
        return "Invalid action specified.";
      case "This RSVP link has expired. Please contact your therapist directly.":
      case "expired":
        return "This RSVP link has expired. Please contact your therapist directly to respond.";
      case "This session has been cancelled":
      case "cancelled":
        return "This session has been cancelled.";
      default:
        return reason || "An unexpected error occurred. Please try again or contact your therapist directly.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconAlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Unable to Process Request
        </h1>

        <p className="text-gray-600 mb-6">
          {getErrorMessage(reason)}
        </p>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
            <p className="text-sm text-amber-800">
              <strong>What you can do:</strong>
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>Check your email for the latest session invitation</li>
              <li>Log in to your client portal if you have an account</li>
              <li>Contact your therapist directly</li>
            </ul>
          </div>

          <Link
            href="/portal/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Client Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

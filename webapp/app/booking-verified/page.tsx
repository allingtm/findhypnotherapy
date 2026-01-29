import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ token?: string; already?: string }>;
}

export const metadata = {
  title: "Intro Call Confirmed | Find Hypnotherapy",
  description: "Your intro call request has been confirmed",
};

export default async function BookingVerifiedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const alreadyVerified = params.already === "true";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {alreadyVerified ? "Already Verified" : "Intro Call Request Sent!"}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {alreadyVerified
              ? "Your intro call has already been verified. The therapist will contact you to confirm your appointment."
              : "Your intro call request has been verified and sent to the therapist. They will review your request and confirm your appointment."}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h2 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              What happens next?
            </h2>
            <ul className="text-sm text-blue-800 dark:text-blue-200 text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span>The therapist will review your intro call request</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span>You&apos;ll receive an email when they confirm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span>Add the appointment to your calendar</span>
              </li>
            </ul>
          </div>

          <Link
            href="/directory"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse More Therapists
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

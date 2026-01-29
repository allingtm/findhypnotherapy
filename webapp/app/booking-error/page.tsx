import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

export const metadata = {
  title: "Booking Error | Find Hypnotherapy",
  description: "There was an error with your booking",
};

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  "missing-token": {
    title: "Invalid Link",
    message: "The verification link is missing required information. Please check your email for the correct link.",
  },
  "expired": {
    title: "Link Expired",
    message: "This verification link has expired. Please submit a new intro call request.",
  },
  "verification-failed": {
    title: "Verification Failed",
    message: "We couldn't verify your booking. The link may be invalid or already used.",
  },
  "server-error": {
    title: "Something Went Wrong",
    message: "We encountered an unexpected error. Please try again later or contact support.",
  },
};

export default async function BookingErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason || "verification-failed";
  const errorInfo = ERROR_MESSAGES[reason] || ERROR_MESSAGES["verification-failed"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {errorInfo.title}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorInfo.message}
          </p>

          <div className="space-y-3">
            <Link
              href="/directory"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Find a Therapist
            </Link>

            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors font-medium"
            >
              Go to Homepage
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need help?{" "}
            <a
              href="mailto:support@findhypnotherapy.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

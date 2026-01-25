import Link from "next/link";
import { IconAlertCircle } from "@tabler/icons-react";

const errorMessages: Record<string, { title: string; description: string }> = {
  "missing-token": {
    title: "Invalid Link",
    description:
      "The verification link appears to be incomplete. Please check the link in your email and try again.",
  },
  "invalid-token": {
    title: "Link Not Found",
    description:
      "This verification link is not valid. It may have already been used or the link may be incorrect.",
  },
  expired: {
    title: "Link Expired",
    description:
      "This verification link has expired. Please send your message again to receive a new verification email.",
  },
  "server-error": {
    title: "Something Went Wrong",
    description:
      "We encountered an error while verifying your email. Please try again later.",
  },
};

export default async function VerificationErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const errorInfo = errorMessages[reason || ""] || errorMessages["server-error"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <IconAlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {errorInfo.title}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {errorInfo.description}
          </p>

          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Find a Therapist
          </Link>
        </div>
      </div>
    </div>
  );
}

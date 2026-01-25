import Link from "next/link";
import { IconCircleCheck, IconMessage } from "@tabler/icons-react";

export default async function VerificationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <IconCircleCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Email Verified!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your message has been sent successfully. The therapist will be
            notified and can respond to your message.
          </p>

          {token && (
            <Link
              href={`/conversation/${token}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <IconMessage className="w-5 h-5" />
              View Conversation
            </Link>
          )}

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            You&apos;ll receive an email when the therapist replies.
          </p>
        </div>
      </div>
    </div>
  );
}

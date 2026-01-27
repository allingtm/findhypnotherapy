import Link from "next/link";
import { IconCheck, IconMail, IconCalendarEvent } from "@tabler/icons-react";

export const metadata = {
  title: "Registration Complete | Find Hypnotherapy",
  description: "Your client registration has been completed successfully",
};

export default function OnboardingCompletePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <IconCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Registration Complete!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Thank you for completing your profile. Your therapist has been notified and will be in touch soon.
        </p>

        {/* What's Next */}
        <div className="bg-gray-50 dark:bg-neutral-900/50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            What happens next?
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <IconMail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You&apos;ll receive email updates about your upcoming sessions
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <IconCalendarEvent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Session Scheduling
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your therapist will schedule sessions and you&apos;ll receive calendar invites
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Return to Homepage
        </Link>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          You can close this page now. All communications will be sent to your email address.
        </p>
      </div>
    </div>
  );
}

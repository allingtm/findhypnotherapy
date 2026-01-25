"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { requestAccountDeletionAction } from "@/app/actions/account";
import { useRouter } from "next/navigation";

interface DeleteAccountSectionProps {
  userEmail: string;
}

export function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await requestAccountDeletionAction(confirmEmail);

      if (!result.success) {
        setError(result.error || "Failed to delete account");
        return;
      }

      // Redirect to home page after successful deletion
      router.push("/?deleted=true");
    });
  };

  if (!showConfirmation) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
          Delete Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. Your profile
          will be unpublished and your personal data will be removed.
        </p>
        <Button
          variant="outline"
          onClick={() => setShowConfirmation(true)}
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete My Account
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-700">
      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
        Confirm Account Deletion
      </h2>

      {error && <Alert type="error" message={error} />}

      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
          This action will:
        </h3>
        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
          <li>Cancel your subscription (if any)</li>
          <li>Remove your profile from the directory</li>
          <li>Delete your personal information</li>
          <li>Disconnect your calendar integrations</li>
          <li>Delete your profile photos and videos</li>
        </ul>
        <p className="text-sm text-red-700 dark:text-red-300 mt-3">
          Your booking history will be retained for legal compliance but will be
          anonymized.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="confirm-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Type your email to confirm:{" "}
            <span className="font-mono text-gray-500">{userEmail}</span>
          </label>
          <input
            type="email"
            id="confirm-email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirmation(false);
              setConfirmEmail("");
              setError(null);
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            loading={isPending}
            disabled={confirmEmail.toLowerCase() !== userEmail.toLowerCase()}
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 dark:disabled:bg-red-900"
          >
            {isPending ? "Deleting..." : "Permanently Delete Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

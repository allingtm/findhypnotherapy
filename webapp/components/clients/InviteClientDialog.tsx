"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { sendClientInvitationAction } from "@/app/actions/clients";
import { getActiveTermsAction } from "@/app/actions/therapist-terms";
import { IconX, IconMail, IconAlertTriangle } from "@tabler/icons-react";

interface InviteClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefillEmail?: string;
  prefillFirstName?: string;
}

export function InviteClientDialog({
  isOpen,
  onClose,
  onSuccess,
  prefillEmail = "",
  prefillFirstName = "",
}: InviteClientDialogProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [firstName, setFirstName] = useState(prefillFirstName);
  const [lastName, setLastName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [hasTerms, setHasTerms] = useState<boolean | null>(null);
  const [checkingTerms, setCheckingTerms] = useState(true);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setEmail(prefillEmail);
      setFirstName(prefillFirstName);
      setLastName("");
      setPersonalMessage("");
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, prefillEmail, prefillFirstName]);

  // Check if therapist has terms set up
  useEffect(() => {
    async function checkTerms() {
      if (!isOpen) return;
      setCheckingTerms(true);
      try {
        const result = await getActiveTermsAction();
        setHasTerms(result.success && !!result.data);
      } catch {
        setHasTerms(false);
      } finally {
        setCheckingTerms(false);
      }
    }
    checkTerms();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await sendClientInvitationAction({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        personalMessage: personalMessage || undefined,
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setError(result.error || "Failed to send invitation");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Invite Client
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Terms Warning */}
          {!checkingTerms && !hasTerms && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <IconAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Terms & Conditions Required
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  You need to set up your Terms & Conditions before inviting clients.
                  Go to{" "}
                  <a
                    href="/dashboard/settings"
                    className="underline hover:no-underline"
                  >
                    Settings
                  </a>{" "}
                  to create them.
                </p>
              </div>
            </div>
          )}

          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            required
            error={fieldErrors.email?.[0]}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              error={fieldErrors.firstName?.[0]}
              disabled={isSubmitting}
            />
            <Input
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              error={fieldErrors.lastName?.[0]}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="personal-message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Personal Message (optional)
            </label>
            <textarea
              id="personal-message"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add a personal message to include in the invitation email..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {personalMessage.length}/500 characters
            </p>
            {fieldErrors.personalMessage && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.personalMessage[0]}
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              An email will be sent to the client with a link to complete their
              onboarding. They will need to provide their details and accept your
              Terms & Conditions.
            </p>
          </div>
        </form>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!hasTerms || checkingTerms || !email.trim()}
          >
            Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}

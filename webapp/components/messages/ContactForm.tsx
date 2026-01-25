"use client";

import { useActionState, useState } from "react";
import { submitContactFormAction } from "@/app/actions/messages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconSend, IconCircleCheck, IconMail } from "@tabler/icons-react";

interface ContactFormProps {
  memberProfileId: string;
  therapistName: string;
}

export function ContactForm({ memberProfileId, therapistName }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(submitContactFormAction, {
    success: false,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  if (state.success) {
    const isPreVerified = (state as { preVerified?: boolean }).preVerified;

    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IconCircleCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200">
              {isPreVerified ? "Message sent!" : "Check your email"}
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {isPreVerified ? (
                <>Your message has been sent to {therapistName}. They will receive it shortly.</>
              ) : (
                <>We&apos;ve sent a verification email to confirm your message. Please
                click the link in the email to send your message to {therapistName}.</>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <IconMail className="w-5 h-5" />
        Send Message
      </button>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        Send a message to {therapistName}
      </h3>

      <form action={formAction}>
        <input type="hidden" name="memberProfileId" value={memberProfileId} />

        {/* Honeypot field - hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <Input
          label="Your Name"
          name="visitorName"
          type="text"
          placeholder="Enter your first name"
          required
          maxLength={50}
          error={state.fieldErrors?.visitorName?.[0]}
        />

        <Input
          label="Your Email"
          name="visitorEmail"
          type="email"
          placeholder="Enter your email address"
          required
          maxLength={255}
          error={state.fieldErrors?.visitorEmail?.[0]}
        />

        <div className="mb-4">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder={`Tell ${therapistName} how they can help you...`}
            required
            minLength={10}
            maxLength={2000}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              state.fieldErrors?.message
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-600"
            }`}
          />
          {state.fieldErrors?.message && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {state.fieldErrors.message[0]}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum 10 characters, maximum 2000 characters
          </p>
        </div>

        {state.error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsExpanded(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={isPending} className="flex-1">
            <IconSend className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          You&apos;ll receive an email to verify your address before your message
          is sent.
        </p>
      </form>
    </div>
  );
}

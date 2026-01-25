import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getConversationByTokenAction,
  visitorReplyAction,
} from "@/app/actions/messages";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { MessageInput } from "@/components/messages/MessageInput";
import { IconMessage, IconAlertCircle } from "@tabler/icons-react";

export default async function VisitorConversationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { conversation, error } = await getConversationByTokenAction(token);

  if (error || !conversation) {
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
              Conversation Not Found
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || "This conversation link is invalid or has expired."}
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

  if (!conversation.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <IconMessage className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Verification Required
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please check your email and click the verification link to access
              this conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <IconMessage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                Conversation with {conversation.memberName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                via Find Hypnotherapy
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conversation */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-12rem)]">
          <ConversationThread
            messages={conversation.messages}
            visitorName={conversation.visitorName}
          />
          <MessageInput
            action={visitorReplyAction}
            conversationToken={token}
            placeholder={`Reply to ${conversation.memberName}...`}
          />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Keep this link to access the conversation later.
          <br />
          You&apos;ll also receive email notifications when {conversation.memberName}{" "}
          replies.
        </p>
      </div>
    </div>
  );
}

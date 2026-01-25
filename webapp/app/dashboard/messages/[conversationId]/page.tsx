import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getConversationAction,
  memberReplyAction,
  blockVisitorAction,
  reportConversationAction,
} from "@/app/actions/messages";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { MessageInput } from "@/components/messages/MessageInput";
import { BlockReportButtons } from "@/components/messages/BlockReportButtons";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { conversation, error } = await getConversationAction(conversationId);

  if (error || !conversation) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/dashboard/messages"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <IconArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {conversation.visitor_name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
            <IconMail className="w-4 h-4" />
            {conversation.visitor_email}
          </p>
        </div>

        <BlockReportButtons
          conversationId={conversationId}
          blockAction={blockVisitorAction}
          reportAction={reportConversationAction}
          isBlocked={conversation.is_blocked}
          isReported={conversation.is_reported}
        />
      </div>

      {/* Conversation container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100%-4rem)]">
        {conversation.is_blocked ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                This conversation has been blocked.
              </p>
              <Link
                href="/dashboard/messages"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
              >
                Return to messages
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ConversationThread
              messages={conversation.messages}
              visitorName={conversation.visitor_name}
            />
            <MessageInput
              action={memberReplyAction}
              conversationId={conversationId}
              placeholder={`Reply to ${conversation.visitor_name}...`}
            />
          </>
        )}
      </div>
    </div>
  );
}

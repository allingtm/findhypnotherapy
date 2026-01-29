"use client";

import { useState, useEffect, useCallback } from "react";
import { IconMail, IconLoader2, IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { MessageInput } from "@/components/messages/MessageInput";
import { getOrCreateClientConversationAction } from "@/app/actions/messages";
import { memberReplyAction } from "@/app/actions/messages";

interface Message {
  id: string;
  content: string;
  sender_type: string;
  is_read: boolean;
  created_at: string;
  deliveryStatus?: "sent" | "delivered" | "opened" | "failed";
}

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  is_blocked: boolean;
  messages: Message[];
}

interface ClientMessagesProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

export function ClientMessages({ clientId, clientName, clientEmail }: ClientMessagesProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getOrCreateClientConversationAction(clientId);

    if (result.success && result.conversation) {
      setConversation(result.conversation);
    } else {
      setError(result.error || "Failed to load conversation");
    }

    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Refresh conversation after sending a message
  const handleMessageSent = useCallback(() => {
    // Small delay to allow the server to process the message
    setTimeout(() => {
      loadConversation();
    }, 500);
  }, [loadConversation]);

  // Wrap memberReplyAction to refresh after success
  const wrappedReplyAction = async (prevState: unknown, formData: FormData) => {
    const result = await memberReplyAction(prevState, formData);
    if (result.success) {
      handleMessageSent();
    }
    return result;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center py-12">
          <IconAlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to Load Messages
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            {error}
          </p>
          <button
            onClick={loadConversation}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <IconRefresh className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center py-12">
          <IconMail className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Messages
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Unable to start a conversation with this client.
          </p>
        </div>
      </div>
    );
  }

  if (conversation.is_blocked) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center py-12">
          <IconAlertCircle className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Conversation Blocked
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            This conversation has been blocked.
          </p>
        </div>
      </div>
    );
  }

  const hasMessages = conversation.messages.length > 0;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {clientName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {clientEmail}
          </p>
        </div>
        <button
          onClick={loadConversation}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh messages"
        >
          <IconRefresh className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="h-[400px] flex flex-col">
        {hasMessages ? (
          <ConversationThread
            messages={conversation.messages}
            visitorName={clientName}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900/50">
            <div className="text-center">
              <IconMail className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No messages yet. Send a message to start the conversation.
              </p>
            </div>
          </div>
        )}

        {/* Message input */}
        <MessageInput
          action={wrappedReplyAction}
          conversationId={conversation.id}
          placeholder="Type a message..."
        />
      </div>

      {/* Info footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {clientName} will receive an email notification when you send a message.
        </p>
      </div>
    </div>
  );
}

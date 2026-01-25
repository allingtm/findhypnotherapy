"use client";

import Link from "next/link";
import { IconMail, IconMailOpened, IconInbox } from "@tabler/icons-react";

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  created_at: string;
  updated_at: string;
  unreadCount: number;
  lastMessage: {
    content: string;
    senderType: string;
    createdAt: string;
  } | null;
  totalMessages: number;
  messagesLast30Days: number;
  needsAttention: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatConversationAge(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays < 1) return "Started today";
  if (diffDays === 1) return "Started yesterday";
  if (diffDays < 7) return `Started ${diffDays}d ago`;
  if (diffWeeks < 4) return `Started ${diffWeeks}w ago`;
  if (diffMonths < 12) return `Started ${diffMonths}mo ago`;
  return `Started ${Math.floor(diffMonths / 12)}y ago`;
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <IconInbox className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
          No messages yet
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          When visitors contact you through your profile, their messages will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/dashboard/messages/${conversation.id}`}
          className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors"
        >
          <div className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {conversation.unreadCount > 0 ? (
                  <div className="relative">
                    <IconMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                    </span>
                  </div>
                ) : (
                  <IconMailOpened className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-medium truncate ${
                      conversation.unreadCount > 0
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {conversation.visitor_name}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {formatDate(conversation.updated_at)}
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {conversation.visitor_email}
                </p>

                {conversation.lastMessage && (
                  <p
                    className={`mt-1.5 text-sm truncate ${
                      conversation.unreadCount > 0
                        ? "text-gray-700 dark:text-gray-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {conversation.lastMessage.senderType === "member" && (
                      <span className="text-gray-400 dark:text-gray-500">You: </span>
                    )}
                    {conversation.lastMessage.content}
                  </p>
                )}

                {/* Stats row */}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                  {conversation.needsAttention && (
                    <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Needs reply</span>
                    </span>
                  )}
                  <span>{conversation.totalMessages} msgs</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>{conversation.messagesLast30Days}/30d</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>{formatConversationAge(conversation.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

import { IconMessage, IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"
import { getClientConversationsAction } from "@/app/actions/client-portal"

export default async function PortalMessagesPage() {
  const result = await getClientConversationsAction()
  const conversations = result.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your conversations with therapists.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-12 text-center">
          <IconMessage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No messages yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your conversations with therapists will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 divide-y divide-gray-200 dark:divide-neutral-700">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/portal/messages/${conversation.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                {conversation.therapistPhotoUrl ? (
                  <img
                    src={conversation.therapistPhotoUrl}
                    alt={conversation.therapistName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {conversation.therapistName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {conversation.therapistName}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(conversation.lastMessageAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                  {conversation.lastMessageContent}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {conversation.unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
                <IconArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

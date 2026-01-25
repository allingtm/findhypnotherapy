import { getConversationsAction } from "@/app/actions/messages";
import { ConversationList } from "@/components/messages/ConversationList";
import { IconMail } from "@tabler/icons-react";

export default async function MessagesPage() {
  const { conversations, error } = await getConversationsAction();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <IconMail className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 dark:text-gray-300" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
      </div>

      {error && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ConversationList conversations={conversations || []} />
      </div>
    </div>
  );
}

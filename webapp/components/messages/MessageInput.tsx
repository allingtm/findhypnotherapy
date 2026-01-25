"use client";

import { useActionState, useRef, useEffect } from "react";
import { IconSend } from "@tabler/icons-react";

interface MessageInputProps {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
  conversationId?: string;
  conversationToken?: string;
  placeholder?: string;
}

export function MessageInput({
  action,
  conversationId,
  conversationToken,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clear textarea on successful send
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [state.success]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // Handle Ctrl/Cmd + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-t border-gray-200 dark:border-gray-700 p-4"
    >
      {conversationId && (
        <input type="hidden" name="conversationId" value={conversationId} />
      )}
      {conversationToken && (
        <input type="hidden" name="conversationToken" value={conversationToken} />
      )}

      {state.error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            name="message"
            rows={1}
            placeholder={placeholder}
            required
            maxLength={2000}
            disabled={isPending}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full transition-colors"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IconSend className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
        Press Ctrl+Enter to send
      </p>
    </form>
  );
}

"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { z } from "zod";
import { IconSend } from "@tabler/icons-react";

const messageSchema = z
  .string()
  .min(1, "Message is required")
  .max(2000, "Message must be 2000 characters or less");

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
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);

  const validateMessage = (value: string) => {
    try {
      messageSchema.parse(value);
      setMessageError(null);
    } catch (err: any) {
      const errorMessage = err.issues?.[0]?.message || "Invalid message";
      setMessageError(errorMessage);
    }
  };

  // Clear textarea on successful send
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setMessage("");
      setMessageError(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [state.success]);

  // Auto-resize textarea and track value
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    setMessage(textarea.value);
    // Clear error while typing if under limit
    if (textarea.value.length <= 2000 && messageError) {
      setMessageError(null);
    }
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
            onBlur={(e) => e.target.value && validateMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-2.5 border rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 ${
              messageError
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {messageError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {messageError}
            </p>
          )}
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

      <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Press Ctrl+Enter to send</span>
        <span className={message.length > 1900 ? "text-orange-500" : ""}>
          {message.length}/2000
        </span>
      </div>
    </form>
  );
}

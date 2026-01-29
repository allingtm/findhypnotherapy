"use client";

import { useRef, useEffect } from "react";
import { IconCheck, IconChecks, IconEye, IconAlertCircle } from "@tabler/icons-react";

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  deliveryStatus?: "sent" | "delivered" | "opened" | "failed";
}

interface ConversationThreadProps {
  messages: Message[];
  visitorName: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) {
    return timeStr;
  }

  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${dateStr}, ${timeStr}`;
}

function DeliveryIndicator({ status }: { status?: Message["deliveryStatus"] }) {
  if (!status) return null;

  switch (status) {
    case "sent":
      return (
        <IconCheck
          className="w-3 h-3 text-emerald-100 dark:text-emerald-200"
          title="Sent"
        />
      );
    case "delivered":
      return (
        <IconChecks
          className="w-3 h-3 text-emerald-100 dark:text-emerald-200"
          title="Delivered"
        />
      );
    case "opened":
      return (
        <IconEye
          className="w-3 h-3 text-blue-200"
          title="Opened"
        />
      );
    case "failed":
      return (
        <IconAlertCircle
          className="w-3 h-3 text-red-300"
          title="Failed to deliver"
        />
      );
    default:
      return null;
  }
}

export function ConversationThread({
  messages,
  visitorName,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 dark:bg-gray-900/50">
      {messages.map((message) => {
        const isVisitor = message.sender_type === "visitor";

        return (
          <div
            key={message.id}
            className={`flex ${isVisitor ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`relative max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                isVisitor
                  ? "bg-white dark:bg-gray-700 rounded-tl-none"
                  : "bg-emerald-500 dark:bg-emerald-700 rounded-tr-none"
              }`}
            >
              {isVisitor && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                  {visitorName}
                </p>
              )}
              <p
                className={`text-sm whitespace-pre-wrap break-words ${
                  isVisitor
                    ? "text-gray-800 dark:text-gray-100"
                    : "text-white dark:text-gray-100"
                }`}
              >
                {message.content}
              </p>
              <div
                className={`flex items-center justify-end gap-1 mt-1 ${
                  isVisitor
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-emerald-100 dark:text-emerald-200"
                }`}
              >
                <span className="text-[10px]">{formatTime(message.created_at)}</span>
                {!isVisitor && <DeliveryIndicator status={message.deliveryStatus} />}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

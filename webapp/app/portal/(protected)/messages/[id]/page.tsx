"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconLoader2,
  IconSend,
  IconAlertCircle,
} from "@tabler/icons-react"
import Link from "next/link"
import {
  getClientConversationAction,
  clientSendMessageAction,
} from "@/app/actions/client-portal"

interface Message {
  id: string
  content: string
  senderType: string
  createdAt: string
  isRead: boolean
}

export default function PortalConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [therapistName, setTherapistName] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadConversation() {
      const result = await getClientConversationAction(conversationId)
      if (result.success && result.data) {
        setTherapistName(result.data.therapistName)
        setMessages(result.data.messages)
      } else {
        setError(result.error || "Conversation not found")
      }
      setIsLoading(false)
    }
    loadConversation()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    const result = await clientSendMessageAction(conversationId, newMessage.trim())

    if (result.success) {
      // Add message to local state
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          content: newMessage.trim(),
          senderType: "client",
          createdAt: new Date().toISOString(),
          isRead: false,
        },
      ])
      setNewMessage("")
    } else {
      setError(result.error || "Failed to send message")
    }

    setIsSending(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/portal/messages"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <IconArrowLeft className="w-5 h-5" />
          Back to messages
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <IconAlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-neutral-700">
        <Link
          href="/portal/messages"
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <IconArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {therapistName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Conversation</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderType === "client" || message.senderType === "visitor"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-lg ${
                message.senderType === "client" || message.senderType === "visitor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.senderType === "client" || message.senderType === "visitor"
                    ? "text-blue-200"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" • "}
                {new Date(message.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSend}
        className="pt-4 border-t border-gray-200 dark:border-neutral-700"
      >
        {error && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isSending ? (
              <IconLoader2 className="w-5 h-5 animate-spin" />
            ) : (
              <IconSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

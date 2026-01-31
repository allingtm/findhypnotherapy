"use client"

import { useState, useEffect } from "react"
import { IconCalendar, IconClock, IconVideo, IconMapPin, IconLoader2 } from "@tabler/icons-react"
import { getClientSessionsAction } from "@/app/actions/client-portal"

type SessionFilter = "upcoming" | "past" | "all"

interface Session {
  id: string
  title: string
  sessionDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: string
  sessionFormat: string | null
  meetingUrl: string | null
  location: string | null
  therapistName: string
  therapistPhotoUrl: string | null
  serviceName: string | null
}

export default function PortalSessionsPage() {
  const [filter, setFilter] = useState<SessionFilter>("upcoming")
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true)
      const result = await getClientSessionsAction(filter)
      if (result.success && result.data) {
        setSessions(result.data)
      }
      setIsLoading(false)
    }
    loadSessions()
  }, [filter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            Scheduled
          </span>
        )
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Sessions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your scheduled and past therapy sessions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["upcoming", "past", "all"] as SessionFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-12 text-center">
          <IconCalendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sessions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === "upcoming"
              ? "You don't have any upcoming sessions scheduled."
              : filter === "past"
              ? "You don't have any past sessions."
              : "You don't have any sessions yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      with {session.therapistName}
                      {session.serviceName && ` • ${session.serviceName}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <IconCalendar className="w-4 h-4" />
                        {new Date(session.sessionDate).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconClock className="w-4 h-4" />
                        {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
                      </span>
                      {session.sessionFormat === "online" && (
                        <span className="flex items-center gap-1">
                          <IconVideo className="w-4 h-4" />
                          Online
                        </span>
                      )}
                      {session.location && (
                        <span className="flex items-center gap-1">
                          <IconMapPin className="w-4 h-4" />
                          {session.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {session.status === "scheduled" && session.meetingUrl && (
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <IconVideo className="w-4 h-4" />
                    Join Session
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

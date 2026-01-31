import { createClient } from "@/lib/supabase/server"
import { IconCalendar, IconMessage, IconUsers, IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"
import {
  getClientSessionsAction,
  getClientTherapistsAction,
  getClientConversationsAction,
} from "@/app/actions/client-portal"

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch data in parallel
  const [sessionsResult, therapistsResult, conversationsResult] = await Promise.all([
    getClientSessionsAction("upcoming"),
    getClientTherapistsAction(),
    getClientConversationsAction(),
  ])

  const upcomingSessions = sessionsResult.data?.slice(0, 3) || []
  const therapists = therapistsResult.data || []
  const conversations = conversationsResult.data || []
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  // Get client name
  const { data: clientAccount } = await supabase
    .from("client_accounts")
    .select(`
      clients (
        first_name
      )
    `)
    .eq("user_id", user?.id)
    .single()

  const clients = clientAccount?.clients as Array<{ first_name: string | null }> | null
  const firstName = clients?.[0]?.first_name || "there"

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here&apos;s an overview of your therapy journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/portal/sessions"
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <IconCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {upcomingSessions.length}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Upcoming Sessions
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/messages"
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <IconMessage className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {unreadMessages}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Unread Messages
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/therapists"
          className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <IconUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {therapists.length}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                My Therapists
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Sessions
          </h2>
          <Link
            href="/portal/sessions"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            View all <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-neutral-700">
          {upcomingSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No upcoming sessions scheduled.
            </div>
          ) : (
            upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <IconCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      with {session.therapistName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(session.sessionDate).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.startTime.slice(0, 5)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Therapists */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Therapists
          </h2>
          <Link
            href="/portal/therapists"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            View all <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-neutral-700">
          {therapists.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No therapists connected yet.
            </div>
          ) : (
            therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                  {therapist.photoUrl ? (
                    <img
                      src={therapist.photoUrl}
                      alt={therapist.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {therapist.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {therapist.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {therapist.professionalTitle || "Hypnotherapist"}
                    {therapist.city && ` • ${therapist.city}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

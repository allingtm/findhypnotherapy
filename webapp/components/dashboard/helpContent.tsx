import React from "react";

export const DASHBOARD_HELP = {
  stats: {
    title: "Dashboard Overview",
    content: (
      <>
        <p className="mb-3">
          These cards show your key practice metrics at a glance:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Today&apos;s Sessions</strong> - Total client sessions and
            confirmed bookings scheduled for today
          </li>
          <li>
            <strong>Pending Intro Calls</strong> - Intro call requests awaiting your
            confirmation
          </li>
          <li>
            <strong>Unread Messages</strong> - New messages from potential
            clients that need your response
          </li>
          <li>
            <strong>Active Clients</strong> - Clients currently working with you
            (plus invited clients awaiting onboarding)
          </li>
        </ul>
      </>
    ),
  },

  schedule: {
    title: "Today's Schedule",
    content: (
      <>
        <p className="mb-3">
          This section shows all your appointments for today, including:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Confirmed bookings from new clients</li>
          <li>Scheduled sessions with existing clients</li>
          <li>Session format (online, in-person, or phone)</li>
          <li>Start and end times for each appointment</li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Click &quot;View Calendar&quot; to see your full weekly schedule.
        </p>
      </>
    ),
  },

  sessionsChart: {
    title: "Sessions Over Time",
    content: (
      <>
        <p className="mb-3">
          This chart tracks your practice activity over the last 30 days:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-green-600 dark:text-green-400">
              Client Sessions
            </strong>{" "}
            - Sessions scheduled with your existing clients
          </li>
          <li>
            <strong className="text-blue-600 dark:text-blue-400">
              Bookings
            </strong>{" "}
            - New bookings from potential clients
          </li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Use this to identify trends and busy periods in your practice.
        </p>
      </>
    ),
  },

  clientStatus: {
    title: "Client Distribution",
    content: (
      <>
        <p className="mb-3">
          This chart shows the breakdown of your clients by status:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-blue-600 dark:text-blue-400">Invited</strong>{" "}
            - Clients you&apos;ve invited who haven&apos;t completed onboarding
          </li>
          <li>
            <strong className="text-yellow-600 dark:text-yellow-400">
              Onboarding
            </strong>{" "}
            - Clients currently completing their intake forms
          </li>
          <li>
            <strong className="text-green-600 dark:text-green-400">Active</strong>{" "}
            - Clients actively working with you
          </li>
          <li>
            <strong className="text-gray-600 dark:text-gray-400">Archived</strong>{" "}
            - Past clients no longer in active care
          </li>
        </ul>
      </>
    ),
  },

  servicePopularity: {
    title: "Popular Services",
    content: (
      <>
        <p className="mb-3">
          This chart shows which of your services are most frequently booked
          over the last 90 days.
        </p>
        <p className="mb-3">
          Use this insight to:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Understand client preferences</li>
          <li>Optimize your service offerings</li>
          <li>Consider promoting less popular services</li>
          <li>Adjust pricing based on demand</li>
        </ul>
      </>
    ),
  },

  sessionFormats: {
    title: "Session Formats",
    content: (
      <>
        <p className="mb-3">
          This chart shows how your sessions are delivered:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-blue-600 dark:text-blue-400">Online</strong>{" "}
            - Video sessions via Zoom or other platforms
          </li>
          <li>
            <strong className="text-green-600 dark:text-green-400">
              In-Person
            </strong>{" "}
            - Face-to-face sessions at your practice location
          </li>
          <li>
            <strong className="text-purple-600 dark:text-purple-400">Phone</strong>{" "}
            - Audio-only telephone sessions
          </li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Based on the last 30 days of sessions and bookings.
        </p>
      </>
    ),
  },

  actionItems: {
    title: "Action Items",
    content: (
      <>
        <p className="mb-3">
          This section highlights tasks that need your attention:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Pending Intro Calls</strong> - New intro call requests to review
            and confirm
          </li>
          <li>
            <strong>Unread Messages</strong> - Messages from potential clients
            awaiting your reply
          </li>
          <li>
            <strong>Awaiting Verification</strong> - Intro calls where visitors
            haven&apos;t verified their email yet
          </li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Items are sorted by priority - address high priority items first.
        </p>
      </>
    ),
  },

  quickActions: {
    title: "Quick Actions",
    content: (
      <>
        <p className="mb-3">
          Shortcuts to common tasks you perform regularly:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Invite Client</strong> - Send an onboarding invitation to a
            new client
          </li>
          <li>
            <strong>Block Time</strong> - Mark time slots as unavailable in your
            calendar
          </li>
          <li>
            <strong>View Profile</strong> - See your public therapist profile as
            visitors see it
          </li>
        </ul>
      </>
    ),
  },

  activityFeed: {
    title: "Activity Feed",
    content: (
      <>
        <p className="mb-3">
          A timeline of recent activity in your practice over the last 7 days:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>New intro call requests received</li>
          <li>Intro calls you&apos;ve confirmed</li>
          <li>Cancellations</li>
          <li>New messages from potential clients</li>
          <li>Clients who completed onboarding</li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Click on any activity to go to the relevant page.
        </p>
      </>
    ),
  },
};

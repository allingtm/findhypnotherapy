import React from "react";

export const CLIENTS_HELP = {
  allClients: {
    title: "All Clients",
    content: (
      <>
        <p className="mb-3">
          Your complete client database, organized by status:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-blue-600 dark:text-blue-400">Invited</strong>{" "}
            - Clients you&apos;ve sent an onboarding invitation to
          </li>
          <li>
            <strong className="text-yellow-600 dark:text-yellow-400">
              Onboarding
            </strong>{" "}
            - Clients currently completing their intake forms
          </li>
          <li>
            <strong className="text-green-600 dark:text-green-400">Active</strong>{" "}
            - Clients you&apos;re currently working with
          </li>
          <li>
            <strong className="text-gray-600 dark:text-gray-400">Archived</strong>{" "}
            - Past clients no longer in active care
          </li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Click on any client to view their full profile, session history, and
          notes.
        </p>
      </>
    ),
  },

  enquiries: {
    title: "Enquiries",
    content: (
      <>
        <p className="mb-3">
          Messages from potential clients who found you through the directory:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>New enquiries</strong> - People interested in your services
            who want to learn more
          </li>
          <li>
            <strong>Ongoing conversations</strong> - Discussions with potential
            clients before they book
          </li>
          <li>
            <strong>Response tracking</strong> - See which messages need your
            reply
          </li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Responding promptly to enquiries increases your booking rate. Aim to
          reply within 24 hours.
        </p>
      </>
    ),
  },

  bookingRequests: {
    title: "Intro Calls",
    content: (
      <>
        <p className="mb-3">
          Introductory call requests from visitors who found you in the directory:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Verified</strong> - Requests from people who confirmed their
            email address
          </li>
          <li>
            <strong>Pending verification</strong> - Awaiting email confirmation
            from the visitor
          </li>
          <li>
            <strong>Confirm or decline</strong> - Review each request and accept
            or decline
          </li>
        </ul>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          When you confirm an intro call, both you and the visitor receive email
          confirmation with the session details.
        </p>
      </>
    ),
  },
};

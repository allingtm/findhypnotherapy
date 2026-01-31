"use client";

import { useState } from "react";
import { CreateSessionDialog } from "@/components/sessions/CreateSessionDialog";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  IconCalendarEvent,
  IconCalendarPlus,
  IconClock,
  IconMapPin,
  IconVideo,
  IconPhone,
  IconUser,
  IconPlus,
  IconCheck,
  IconX,
  IconDots,
} from "@tabler/icons-react";
import {
  markSessionCompleteAction,
  markSessionNoShowAction,
  cancelClientSessionAction,
} from "@/app/actions/client-sessions";
import { respondToRescheduleProposalAction } from "@/app/actions/session-rsvp";

interface Session {
  id: string;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  session_format: string | null;
  location: string | null;
  meeting_url: string | null;
  therapist_notes: string | null;
  created_at: string;
  rsvp_status: string | null;
  rsvp_message: string | null;
  proposed_date: string | null;
  proposed_start_time: string | null;
  proposed_end_time: string | null;
}

interface Service {
  id: string;
  title: string;
  duration_minutes: number;
  price: number | null;
  session_format: string | null;
}

interface ClientSessionsListProps {
  clientId: string;
  clientName: string;
  sessions: Session[];
  services?: Service[];
  onUpdate: () => void;
  showAddDialog?: boolean;
  onCloseAddDialog?: () => void;
}

export function ClientSessionsList({
  clientId,
  clientName,
  sessions,
  services = [],
  onUpdate,
  showAddDialog: externalShowDialog,
  onCloseAddDialog: externalCloseDialog,
}: ClientSessionsListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [internalShowDialog, setInternalShowDialog] = useState(false);
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);

  // Support both internal and external dialog control
  const showDialog = externalShowDialog || internalShowDialog;
  const closeDialog = () => {
    setInternalShowDialog(false);
    externalCloseDialog?.();
  };

  // Sort sessions by date (most recent first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );

  const upcomingSessions = sortedSessions.filter(
    (s) =>
      s.status === "scheduled" &&
      new Date(`${s.session_date}T${s.start_time}`) >= new Date()
  );

  const pastSessions = sortedSessions.filter(
    (s) =>
      s.status !== "scheduled" ||
      new Date(`${s.session_date}T${s.start_time}`) < new Date()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <IconCheck className="w-3 h-3 inline mr-1" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <IconX className="w-3 h-3 inline mr-1" />
            Cancelled
          </span>
        );
      case "no_show":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            No Show
          </span>
        );
      default:
        return null;
    }
  };

  const getRsvpStatusBadge = (rsvpStatus: string | null) => {
    switch (rsvpStatus) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Awaiting RSVP
          </span>
        );
      case "accepted":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <IconCheck className="w-3 h-3 inline mr-1" />
            Confirmed
          </span>
        );
      case "declined":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <IconX className="w-3 h-3 inline mr-1" />
            Declined
          </span>
        );
      case "reschedule_requested":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            Reschedule Requested
          </span>
        );
      default:
        return null;
    }
  };

  const getFormatIcon = (format: string | null) => {
    switch (format) {
      case "online":
        return <IconVideo className="w-4 h-4" />;
      case "phone":
        return <IconPhone className="w-4 h-4" />;
      case "in-person":
        return <IconUser className="w-4 h-4" />;
      default:
        return <IconCalendarEvent className="w-4 h-4" />;
    }
  };

  const handleMarkComplete = async (sessionId: string) => {
    setIsLoading(sessionId);
    setMenuOpenId(null);
    try {
      await markSessionCompleteAction(sessionId);
      onUpdate();
    } catch (error) {
      console.error("Failed to mark complete:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleMarkNoShow = async (sessionId: string) => {
    setIsLoading(sessionId);
    setMenuOpenId(null);
    try {
      await markSessionNoShowAction(sessionId);
      onUpdate();
    } catch (error) {
      console.error("Failed to mark no-show:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancelClick = (sessionId: string) => {
    setCancelSessionId(sessionId);
    setMenuOpenId(null);
  };

  const handleCancelConfirm = async () => {
    if (!cancelSessionId) return;
    setIsLoading(cancelSessionId);
    setCancelSessionId(null);
    try {
      await cancelClientSessionAction({
        sessionId: cancelSessionId,
        sendNotification: true,
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to cancel session:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRescheduleResponse = async (sessionId: string, accept: boolean) => {
    setIsLoading(sessionId);
    try {
      await respondToRescheduleProposalAction({
        sessionId,
        accept,
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to respond to reschedule:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const SessionCard = ({ session }: { session: Session }) => {
    const isPast = new Date(`${session.session_date}T${session.end_time}`) < new Date();
    const canTakeAction = session.status === "scheduled" && isPast;

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                {getFormatIcon(session.session_format)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {session.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <IconCalendarEvent className="w-4 h-4" />
                  {new Date(session.session_date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  <span className="mx-1">|</span>
                  <IconClock className="w-4 h-4" />
                  {session.start_time} - {session.end_time}
                </div>
              </div>
            </div>
            {session.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 ml-11">
                <IconMapPin className="w-4 h-4" />
                {session.location}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(session.status)}
            {session.status === "scheduled" && session.rsvp_status && getRsvpStatusBadge(session.rsvp_status)}
            {session.status === "scheduled" && (
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === session.id ? null : session.id)
                  }
                  disabled={isLoading === session.id}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
                >
                  {isLoading === session.id ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IconDots className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {menuOpenId === session.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-20 min-w-[140px]">
                      {canTakeAction && (
                        <>
                          <button
                            onClick={() => handleMarkComplete(session.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                          >
                            <IconCheck className="w-4 h-4 text-green-600" />
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleMarkNoShow(session.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                          >
                            <IconX className="w-4 h-4 text-amber-600" />
                            Mark No-Show
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCancelClick(session.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                      >
                        <IconX className="w-4 h-4" />
                        Cancel Session
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Reschedule Proposal Section */}
        {session.rsvp_status === "reschedule_requested" && session.proposed_date && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="font-medium text-orange-800 dark:text-orange-300 text-sm mb-2">
                Client requested to reschedule
              </p>
              <div className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                <p>
                  <span className="font-medium">Proposed:</span>{" "}
                  {new Date(session.proposed_date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {session.proposed_start_time} - {session.proposed_end_time}
                </p>
                {session.rsvp_message && (
                  <p className="mt-2 italic">&quot;{session.rsvp_message}&quot;</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRescheduleResponse(session.id, true)}
                  disabled={isLoading === session.id}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Accept New Time
                </button>
                <button
                  onClick={() => handleRescheduleResponse(session.id, false)}
                  disabled={isLoading === session.id}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
        {session.therapist_notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {session.therapist_notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sessions
        </h2>
        <Button onClick={() => setInternalShowDialog(true)}>
          <IconCalendarPlus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
          <IconCalendarEvent className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Sessions Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Schedule your first session with this client to get started.
          </p>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Upcoming Sessions ({upcomingSessions.length})
          </h3>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Past Sessions ({pastSessions.length})
          </h3>
          <div className="space-y-3">
            {pastSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Create Session Dialog */}
      <CreateSessionDialog
        isOpen={showDialog}
        onClose={closeDialog}
        onSuccess={onUpdate}
        clientId={clientId}
        clientName={clientName}
        services={services}
      />

      {/* Cancel Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancelSessionId}
        onClose={() => setCancelSessionId(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Session"
        message="Are you sure you want to cancel this session? The client will be notified."
        confirmText="Cancel Session"
        cancelText="Keep Session"
        variant="danger"
      />
    </div>
  );
}

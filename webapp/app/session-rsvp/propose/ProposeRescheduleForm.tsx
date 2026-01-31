"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCalendar, IconClock, IconMessage, IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import { proposeSessionRescheduleAction } from "@/app/actions/session-rsvp";

interface ProposeRescheduleFormProps {
  token: string;
  sessionData: {
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    therapistName: string;
    clientName: string;
  };
}

export default function ProposeRescheduleForm({ token, sessionData }: ProposeRescheduleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [proposedDate, setProposedDate] = useState("");
  const [proposedStartTime, setProposedStartTime] = useState("");
  const [message, setMessage] = useState("");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!proposedDate || !proposedStartTime) {
      setError("Please select a date and time");
      return;
    }

    // Validate date is in the future
    const proposedDateTime = new Date(`${proposedDate}T${proposedStartTime}`);
    if (proposedDateTime <= new Date()) {
      setError("Please select a future date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const proposedEndTime = calculateEndTime(proposedStartTime, sessionData.durationMinutes);

      const result = await proposeSessionRescheduleAction({
        token,
        proposedDate,
        proposedStartTime,
        proposedEndTime,
        message: message.trim() || undefined,
      });

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || "Failed to submit your request");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCircleCheck className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Request Submitted
        </h1>

        <p className="text-gray-600 mb-6">
          Your reschedule request has been sent to {sessionData.therapistName}.
          They will review your proposal and get back to you.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <p className="font-semibold text-green-900 text-sm">Proposed Time</p>
          <p className="text-green-700 mt-1">
            {formatDate(proposedDate)} at {formatTime(proposedStartTime)}
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-amber-500 px-6 py-4">
        <h1 className="text-xl font-bold text-white">
          Propose New Time
        </h1>
        <p className="text-amber-100 text-sm mt-1">
          Can&apos;t make the scheduled time? Suggest an alternative.
        </p>
      </div>

      <div className="p-6">
        {/* Current Session Info */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-red-900 text-sm mb-2">Current Session</p>
          <div className="flex items-start gap-3">
            <IconCalendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">{sessionData.title}</p>
              <p className="text-sm text-red-700 mt-1">
                {formatDate(sessionData.sessionDate)}
              </p>
              <p className="text-sm text-red-700">
                {formatTime(sessionData.startTime)} - {formatTime(sessionData.endTime)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Proposed Date */}
          <div>
            <label htmlFor="proposedDate" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date
            </label>
            <div className="relative">
              <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="proposedDate"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                min={today}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Proposed Time */}
          <div>
            <label htmlFor="proposedStartTime" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Start Time
            </label>
            <div className="relative">
              <IconClock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                id="proposedStartTime"
                value={proposedStartTime}
                onChange={(e) => setProposedStartTime(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            {proposedStartTime && (
              <p className="text-sm text-gray-500 mt-1">
                Session will end at {formatTime(calculateEndTime(proposedStartTime, sessionData.durationMinutes))} ({sessionData.durationMinutes} minutes)
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <div className="relative">
              <IconMessage className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let your therapist know why you'd like to reschedule..."
                rows={3}
                maxLength={500}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              />
            </div>
            <p className="text-xs text-gray-400 text-right mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Proposal"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

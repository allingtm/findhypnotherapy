import { Metadata } from "next";
import { IconCircleCheck, IconCalendar } from "@tabler/icons-react";
import { getSessionByRsvpTokenAction } from "@/app/actions/session-rsvp";

export const metadata: Metadata = {
  title: "Session Confirmed | Find Hypnotherapy",
  description: "Your session has been confirmed",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SessionConfirmedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  let sessionData: Record<string, unknown> | null = null;

  if (token) {
    const result = await getSessionByRsvpTokenAction(token);
    if (result.success && result.data) {
      sessionData = result.data;
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCircleCheck className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Session Confirmed!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for confirming your attendance. We look forward to seeing you.
        </p>

        {sessionData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <IconCalendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">
                  {sessionData.title as string}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {formatDate(sessionData.sessionDate as string)}
                </p>
                <p className="text-sm text-green-700">
                  {formatTime(sessionData.startTime as string)} - {formatTime(sessionData.endTime as string)}
                </p>
                {typeof sessionData.therapistName === 'string' && sessionData.therapistName && (
                  <p className="text-sm text-green-700 mt-1">
                    with {sessionData.therapistName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to you with all the details.
          </p>
          <p className="text-sm text-gray-500">
            If you need to make any changes, please contact your therapist directly.
          </p>
        </div>
      </div>
    </div>
  );
}

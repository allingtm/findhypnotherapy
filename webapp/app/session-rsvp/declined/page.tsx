import { Metadata } from "next";
import { IconCircleX, IconCalendar } from "@tabler/icons-react";
import { getSessionByRsvpTokenAction } from "@/app/actions/session-rsvp";

export const metadata: Metadata = {
  title: "Response Recorded | Find Hypnotherapy",
  description: "Your response has been recorded",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SessionDeclinedPage({ searchParams }: PageProps) {
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
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCircleX className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Response Recorded
        </h1>

        <p className="text-gray-600 mb-6">
          We&apos;ve noted that you won&apos;t be able to attend this session. Your therapist has been notified.
        </p>

        {sessionData && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <IconCalendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">
                  {sessionData.title as string}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {formatDate(sessionData.sessionDate as string)}
                </p>
                <p className="text-sm text-red-700">
                  {formatTime(sessionData.startTime as string)} - {formatTime(sessionData.endTime as string)}
                </p>
                {typeof sessionData.therapistName === 'string' && sessionData.therapistName && (
                  <p className="text-sm text-red-700 mt-1">
                    with {sessionData.therapistName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {typeof sessionData?.therapistName === 'string' && sessionData.therapistName
              ? `${sessionData.therapistName} may reach out to reschedule if needed.`
              : "Your therapist may reach out to reschedule if needed."}
          </p>
        </div>
      </div>
    </div>
  );
}

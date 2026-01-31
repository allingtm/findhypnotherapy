import { Metadata } from "next";
import { getSessionByRsvpTokenAction } from "@/app/actions/session-rsvp";
import { redirect } from "next/navigation";
import ProposeRescheduleForm from "./ProposeRescheduleForm";

export const metadata: Metadata = {
  title: "Propose New Time | Find Hypnotherapy",
  description: "Propose an alternative time for your session",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ProposeReschedulePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token || token.length !== 64) {
    redirect("/session-rsvp/error?reason=invalid_token");
  }

  const result = await getSessionByRsvpTokenAction(token);

  if (!result.success || !result.data) {
    redirect(`/session-rsvp/error?reason=${encodeURIComponent(result.error || "unknown")}`);
  }

  const sessionData = result.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <ProposeRescheduleForm
          token={token}
          sessionData={{
            title: sessionData.title as string,
            sessionDate: sessionData.sessionDate as string,
            startTime: sessionData.startTime as string,
            endTime: sessionData.endTime as string,
            durationMinutes: sessionData.durationMinutes as number,
            therapistName: sessionData.therapistName as string,
            clientName: sessionData.clientName as string,
          }}
        />
      </div>
    </div>
  );
}

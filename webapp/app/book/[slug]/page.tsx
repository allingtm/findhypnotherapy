import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTherapistBySlug } from "@/app/actions/bookings";
import { getActiveTermsForBooking } from "@/app/actions/therapist-terms";
import { BookingPageContent } from "./BookingPageContent";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { profile } = await getTherapistBySlug(slug);

  if (!profile) {
    return {
      title: "Booking Not Available | Find Hypnotherapy",
    };
  }

  const therapistUser = profile.users as unknown as { name?: string };
  const therapistName = therapistUser?.name || "Therapist";

  return {
    title: `Book with ${therapistName} | Find Hypnotherapy`,
    description: `Book a free consultation with ${therapistName} on Find Hypnotherapy.`,
  };
}

export default async function BookingPage({ params }: PageProps) {
  const { slug } = await params;
  const { profile, error } = await getTherapistBySlug(slug);

  if (error || !profile) {
    notFound();
  }

  const therapistUser = profile.users as unknown as { name?: string };
  const therapistName = therapistUser?.name || "Therapist";
  const professionalTitle = (profile as { professional_title?: string }).professional_title;

  const settings = profile.therapist_booking_settings as unknown as {
    id: string;
    slot_duration_minutes: number;
    buffer_minutes: number | null;
    min_booking_notice_hours: number | null;
    max_booking_days_ahead: number | null;
    timezone: string;
    requires_approval: boolean | null;
    accepts_online_booking: boolean | null;
  } | null;

  // Fetch therapist's active terms
  const { data: therapistTerms } = await getActiveTermsForBooking(profile.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Therapist Header */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                <span className="text-2xl text-gray-500 dark:text-gray-400">
                  {therapistName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Book with {therapistName}
                </h1>
                {professionalTitle && (
                  <p className="text-gray-600 dark:text-gray-400">{professionalTitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 mb-6">
            <h2 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Free Consultation
            </h2>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Duration: {settings?.slot_duration_minutes || 30} minutes
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              Select a date and time that works for you. After booking, you&apos;ll
              receive an email to confirm your appointment.
            </p>
          </div>

          {/* Booking Content */}
          <BookingPageContent
            therapistProfileId={profile.id}
            therapistName={therapistName}
            maxDaysAhead={settings?.max_booking_days_ahead || 30}
            therapistTerms={therapistTerms || null}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

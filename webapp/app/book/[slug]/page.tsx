import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTherapistBySlug, getServicesForBooking } from "@/app/actions/bookings";
import { getActiveTermsForBooking } from "@/app/actions/therapist-terms";
import { BookingPageContent } from "./BookingPageContent";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string }>;
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
    title: `Schedule a call with ${therapistName} | Find Hypnotherapy`,
    description: `Schedule a free consultation call with ${therapistName} on Find Hypnotherapy.`,
  };
}

export default async function BookingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { serviceId: requestedServiceId } = await searchParams;
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

  // Fetch therapist's active terms and services in parallel
  const [{ data: therapistTerms }, { services }] = await Promise.all([
    getActiveTermsForBooking(profile.id),
    getServicesForBooking(profile.id),
  ]);

  // Validate the requested serviceId - only use it if it's in the services list
  const validServiceId = requestedServiceId && services.some((s) => s.id === requestedServiceId)
    ? requestedServiceId
    : null;

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
                  Schedule a call with {therapistName}
                </h1>
                {professionalTitle && (
                  <p className="text-gray-600 dark:text-gray-400">{professionalTitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Content */}
          <BookingPageContent
            therapistProfileId={profile.id}
            therapistName={therapistName}
            maxDaysAhead={settings?.max_booking_days_ahead || 30}
            therapistTerms={therapistTerms || null}
            services={services}
            initialServiceId={validServiceId}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

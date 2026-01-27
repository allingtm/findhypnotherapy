import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ServiceType, PriceDisplayMode } from '@/lib/types/database'
import { SERVICE_TYPE_LABELS } from '@/lib/types/services'
import { formatServicePrice, formatSessionCount } from '@/lib/utils/price-display'

interface ServiceDetailPageProps {
  params: Promise<{ slug: string; serviceId: string }>
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug, serviceId } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('therapist_services')
    .select(`
      name,
      short_description,
      therapist_profiles!inner(
        slug,
        users!inner(name)
      )
    `)
    .eq('id', serviceId)
    .single()

  if (!service) {
    return { title: 'Service Not Found | Find Hypnotherapy' }
  }

  const profile = service.therapist_profiles as unknown as { slug: string; users: { name: string } }
  const therapistName = profile.users.name

  return {
    title: `${service.name} - ${therapistName} | Find Hypnotherapy`,
    description: service.short_description || `${service.name} offered by ${therapistName}`,
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug, serviceId } = await params
  const supabase = await createClient()

  // Fetch service with therapist profile
  const { data: service, error } = await supabase
    .from('therapist_services')
    .select(`
      *,
      therapist_profiles!inner(
        id,
        slug,
        professional_title,
        users!inner(name, photo_url)
      )
    `)
    .eq('id', serviceId)
    .eq('is_active', true)
    .single()

  if (error || !service) {
    notFound()
  }

  const profile = service.therapist_profiles as unknown as {
    id: string
    slug: string
    professional_title: string | null
    users: { name: string; photo_url: string | null }
  }

  // Verify the service belongs to the therapist with this slug
  if (profile.slug !== slug) {
    notFound()
  }

  const therapistName = profile.users.name
  const therapistPhoto = profile.users.photo_url

  const priceDisplay = formatServicePrice({
    price: service.price,
    price_min: service.price_min,
    price_max: service.price_max,
    price_display_mode: service.price_display_mode as PriceDisplayMode,
    session_count: service.session_count,
    show_per_session_price: service.show_per_session_price,
  })

  const sessionDisplay = formatSessionCount({
    service_type: service.service_type as ServiceType,
    session_count: service.session_count,
    session_count_min: service.session_count_min,
    session_count_max: service.session_count_max,
    duration_minutes: service.duration_minutes,
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href={`/directory/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {therapistName}'s profile
          </Link>

          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow overflow-hidden">
            {/* Service Image */}
            {service.image_url ? (
              <div className="w-full aspect-video bg-gray-100 dark:bg-neutral-800">
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-blue-300 dark:text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {service.name}
                </h1>
                {service.is_featured && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                    Featured
                  </span>
                )}
              </div>

              {/* Service type badge */}
              <span className="inline-block px-2 py-1 text-sm bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded mb-4">
                {SERVICE_TYPE_LABELS[service.service_type as ServiceType]}
              </span>

              {/* Outcome focus */}
              {service.show_outcome_focus !== false && service.outcome_focus && (
                <p className="text-lg text-blue-600 dark:text-blue-400 mb-4">
                  {service.outcome_focus}
                </p>
              )}

              {/* Price and session details */}
              <div className="flex flex-wrap gap-6 py-4 border-t border-b border-gray-100 dark:border-neutral-800 mb-6">
                {service.show_price !== false && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                    <p className={`text-xl font-semibold ${
                      priceDisplay.mode === 'free'
                        ? 'text-green-600 dark:text-green-400'
                        : priceDisplay.mode === 'contact'
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {priceDisplay.formatted}
                    </p>
                    {priceDisplay.perSessionFormatted && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {priceDisplay.perSessionFormatted}
                      </p>
                    )}
                  </div>
                )}

                {service.show_session_details !== false && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {sessionDisplay}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {service.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    About this service
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>
              )}

              {/* What's Included */}
              {service.show_includes !== false && service.includes && service.includes.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    What's included
                  </h2>
                  <ul className="space-y-2">
                    {(service.includes as string[]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Therapist mini-card */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Offered by</p>
                <Link
                  href={`/directory/${slug}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  {therapistPhoto ? (
                    <img
                      src={therapistPhoto}
                      alt={therapistName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                        {getInitials(therapistName)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{therapistName}</p>
                    {profile.professional_title && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{profile.professional_title}</p>
                    )}
                  </div>
                </Link>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/book/${slug}`}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Book Now
                </Link>
                <Link
                  href={`/directory/${slug}#contact`}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium rounded-lg transition-colors"
                >
                  Contact {therapistName.split(' ')[0]}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

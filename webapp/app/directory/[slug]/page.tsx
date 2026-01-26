import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { ContactForm } from '@/components/messages/ContactForm'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ServiceType, PriceDisplayMode } from '@/lib/types/database'
import { SERVICE_TYPE_LABELS } from '@/lib/types/services'
import { formatServicePrice, formatSessionCount } from '@/lib/utils/price-display'

interface TherapistProfilePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TherapistProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select(`
      *,
      users!inner(name, photo_url)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!profile) {
    return { title: 'Therapist Not Found | Find Hypnotherapy' }
  }

  const userName = (profile.users as { name: string; photo_url: string | null }).name
  const title = `${userName} - ${profile.professional_title || 'Hypnotherapist'} | Find Hypnotherapy`
  const description = profile.meta_description || profile.bio?.slice(0, 160) || `View ${userName}'s hypnotherapy profile`

  return {
    title,
    description,
    openGraph: {
      title: `${userName} - ${profile.professional_title || 'Hypnotherapist'}`,
      description,
      type: 'profile',
    },
  }
}

export default async function TherapistProfilePage({ params }: TherapistProfilePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch profile with user info, specializations, services, and booking settings
  const { data: profile, error } = await supabase
    .from('therapist_profiles')
    .select(`
      *,
      users!inner(name, photo_url, email),
      therapist_specializations(
        specializations(name, slug)
      ),
      therapist_services(*),
      therapist_booking_settings(accepts_online_booking, slot_duration_minutes)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !profile) {
    notFound()
  }

  const userData = profile.users as { name: string; photo_url: string | null; email: string }
  const specializations = (profile.therapist_specializations as Array<{
    specializations: { name: string; slug: string }
  }>).map(ts => ts.specializations)

  // Get active services, sorted by featured first then display order
  const services = (profile.therapist_services as Array<{
    id: string
    name: string
    description: string | null
    short_description: string | null
    image_url: string | null
    service_type: ServiceType
    price_display_mode: PriceDisplayMode
    price: number | null
    price_min: number | null
    price_max: number | null
    currency: string | null
    duration_minutes: number
    session_count: number
    session_count_min: number | null
    session_count_max: number | null
    includes: string[] | null
    outcome_focus: string | null
    is_active: boolean | null
    is_featured: boolean | null
    show_per_session_price: boolean | null
    show_price: boolean | null
    show_session_details: boolean | null
    show_includes: boolean | null
    show_outcome_focus: boolean | null
    display_order: number | null
    directory_price: number | null
  }> || [])
    .filter(s => s.is_active !== false)
    .sort((a, b) => {
      // Featured first
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      // Then by display order
      return (a.display_order || 0) - (b.display_order || 0)
    })

  // Check if online booking is available
  const bookingSettings = profile.therapist_booking_settings as unknown as {
    accepts_online_booking: boolean | null;
    slot_duration_minutes: number | null;
  } | null;
  const acceptsOnlineBooking = bookingSettings?.accepts_online_booking === true;
  const consultationDuration = bookingSettings?.slot_duration_minutes || 30;

  // Calculate min price for header display (using directory_price, excludes contact-for-pricing)
  const pricedServices = services.filter(s => s.directory_price !== null)
  const minPrice = pricedServices.length > 0 ? Math.min(...pricedServices.map(s => s.directory_price!)) : null
  const hasFreeService = services.some(s => s.price_display_mode === 'free')
  const hasContactPricing = services.some(s => s.price_display_mode === 'contact')

  const formatPrice = (amount: number | null) => {
    if (!amount) return null
    return `\u00A3${amount}`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-neutral-950">
        {/* Profile Banner */}
        {profile.banner_url ? (
          <div className="relative w-full h-48 md:h-64 lg:h-72 overflow-hidden">
            <img
              src={profile.banner_url}
              alt={`${userData.name}'s banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-neutral-900/60 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-24 md:h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
        )}

        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
          <div className={`container mx-auto px-4 py-8 ${profile.banner_url ? '-mt-16 relative z-10' : ''}`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              {userData.photo_url ? (
                <img
                  src={userData.photo_url}
                  alt={userData.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-4 border-white dark:border-neutral-800 shadow-lg">
                  <span className="text-4xl font-semibold text-blue-600 dark:text-blue-300">
                    {getInitials(userData.name)}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    {userData.name}
                    {profile.is_verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Verified
                      </span>
                    )}
                  </h1>
                  {profile.professional_title && (
                    <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">{profile.professional_title}</p>
                  )}

                  {/* Location */}
                  {profile.address_visibility !== 'hidden' && (profile.city || profile.state_province || profile.country) && (
                    <p className="text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {[profile.city, profile.state_province, profile.country].filter(Boolean).join(', ')}
                    </p>
                  )}

                  {/* Credentials */}
                  {profile.credentials && profile.credentials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.credentials.map((cred: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Card */}
                <div className="hidden md:block bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 text-right">
                  {minPrice !== null && (
                    <>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {services.length > 1 ? 'From ' : ''}{formatPrice(minPrice)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {services.length === 1 ? `per ${services[0].duration_minutes} min session` : `${services.length} services available`}
                      </p>
                    </>
                  )}
                  {profile.offers_free_consultation && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Free initial consultation
                    </p>
                  )}
                </div>
              </div>

              {/* Session Formats */}
              {profile.session_format && profile.session_format.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {profile.session_format.map((format: string) => (
                    <span
                      key={format}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About - Collapsible, default open */}
            {profile.bio && (
              <CollapsibleSection title="About" defaultOpen={true}>
                <ExpandableText
                  text={profile.bio}
                  maxLength={200}
                  className="prose dark:prose-invert max-w-none"
                />
              </CollapsibleSection>
            )}

            {/* Specializations - Collapsible, default closed */}
            {specializations.length > 0 && (
              <CollapsibleSection title="Specialisations" defaultOpen={false}>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <Link
                      key={spec.slug}
                      href={`/directory?specialization=${spec.slug}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {spec.name}
                    </Link>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Experience - Collapsible, default closed */}
            {profile.years_experience && (
              <CollapsibleSection title="Experience" defaultOpen={false}>
                <p className="text-gray-700 dark:text-gray-300">
                  {profile.years_experience} years of professional experience
                </p>
              </CollapsibleSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact</h2>

              <div className="space-y-4">
                {/* Mobile Price Display */}
                <div className="md:hidden mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700">
                  {minPrice !== null && (
                    <>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {services.length > 1 ? 'From ' : ''}{formatPrice(minPrice)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {services.length === 1 ? `per ${services[0].duration_minutes} min session` : `${services.length} services available`}
                      </p>
                    </>
                  )}
                  {profile.offers_free_consultation && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Free initial consultation
                    </p>
                  )}
                </div>

                {/* Book Free Consultation - only shown if online booking is enabled */}
                {acceptsOnlineBooking && (
                  <Link
                    href={`/book/${profile.slug}`}
                    className="block w-full px-4 py-3 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Book Free Consultation
                  </Link>
                )}

                {/* External booking link - shown if they have one and either no online booking or as secondary option */}
                {profile.booking_url && (
                  <a
                    href={profile.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full px-4 py-3 text-center rounded-lg transition-colors font-medium ${
                      acceptsOnlineBooking
                        ? 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {acceptsOnlineBooking ? 'View External Calendar' : 'Book an Appointment'}
                  </a>
                )}

                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profile.phone}
                  </a>
                )}

                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </a>
                )}

                {/* Send Message Form */}
                <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <ContactForm
                    memberProfileId={profile.id}
                    therapistName={userData.name}
                  />
                </div>
              </div>
            </div>

            {/* Location Card */}
            {profile.address_visibility !== 'hidden' && (profile.address_line1 || profile.city) && (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Location</h2>
                <address className="not-italic text-gray-700 dark:text-gray-300">
                  {profile.address_visibility === 'full' && (
                    <>
                      {profile.address_line1 && <>{profile.address_line1}<br /></>}
                      {profile.address_line2 && <>{profile.address_line2}<br /></>}
                    </>
                  )}
                  {profile.city}{profile.city && profile.state_province && ', '}{profile.state_province}
                  {(profile.city || profile.state_province) && <br />}
                  {profile.address_visibility === 'full' && profile.postal_code && <>{profile.postal_code}<br /></>}
                  {profile.country}
                </address>
              </div>
            )}

            {/* Availability */}
            {profile.availability_notes && (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Availability</h2>
                <p className="text-gray-700 dark:text-gray-300">{profile.availability_notes}</p>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Services</h2>
                <div className="space-y-4">
                  {services.map((service) => {
                    const priceDisplay = formatServicePrice({
                      price: service.price,
                      price_min: service.price_min,
                      price_max: service.price_max,
                      price_display_mode: service.price_display_mode,
                      session_count: service.session_count,
                      show_per_session_price: service.show_per_session_price,
                    })

                    const sessionDisplay = formatSessionCount({
                      service_type: service.service_type,
                      session_count: service.session_count,
                      session_count_min: service.session_count_min,
                      session_count_max: service.session_count_max,
                      duration_minutes: service.duration_minutes,
                    })

                    return (
                      <div
                        key={service.id}
                        className={`pb-4 border-b border-gray-100 dark:border-neutral-800 last:border-0 last:pb-0 ${
                          service.is_featured ? 'bg-blue-50 dark:bg-blue-900/10 -mx-2 px-2 py-2 rounded-lg' : ''
                        }`}
                      >
                        {/* Service Image */}
                        {service.image_url && (
                          <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                            <img
                              src={service.image_url}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{service.name}</h3>
                              {service.is_featured && (
                                <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                                  Featured
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded">
                                {SERVICE_TYPE_LABELS[service.service_type]}
                              </span>
                            </div>

                            {service.show_outcome_focus !== false && service.outcome_focus && (
                              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                {service.outcome_focus}
                              </p>
                            )}

                            {service.show_session_details !== false && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {sessionDisplay}
                              </p>
                            )}
                          </div>
                          {service.show_price !== false && (
                            <div className="text-right ml-4">
                              <span className={`font-semibold ${
                                priceDisplay.mode === 'free'
                                  ? 'text-green-600 dark:text-green-400'
                                  : priceDisplay.mode === 'contact'
                                  ? 'text-gray-600 dark:text-gray-400 text-sm'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {priceDisplay.formatted}
                              </span>
                              {priceDisplay.perSessionFormatted && (
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {priceDisplay.perSessionFormatted}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {service.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{service.description}</p>
                        )}

                        {/* What's Included */}
                        {service.show_includes !== false && service.includes && service.includes.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {service.includes.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                  {(profile.offers_free_consultation || hasFreeService) && !services.some(s => s.price_display_mode === 'free') && (
                    <p className="text-sm text-green-600 dark:text-green-400 pt-2">
                      Free initial consultation available
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      <Footer />
    </div>
  )
}

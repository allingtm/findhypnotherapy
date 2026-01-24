import Link from 'next/link'
import type { Json } from '@/lib/types/database'

interface Specialization {
  name: string
  slug: string
}

interface TherapistCardProps {
  therapist: {
    id: string
    name: string | null
    professional_title: string | null
    bio: string | null
    city: string | null
    state_province: string | null
    session_format: string[] | null
    session_fee: number | null
    currency: string | null
    offers_free_consultation: boolean | null
    slug: string | null
    is_verified: boolean | null
    photo_url: string | null
    specializations: Json
  }
}

export function TherapistCard({ therapist }: TherapistCardProps) {
  const specializations = (therapist.specializations as Specialization[] | null) || []
  const displayedSpecializations = specializations.slice(0, 4)
  const remainingCount = specializations.length - 4

  const formatPrice = (amount: number) => `\u00A3${amount}`

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Link
      href={`/directory/${therapist.slug}`}
      className="block bg-white dark:bg-neutral-900 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-neutral-700 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            {therapist.photo_url ? (
              <img
                src={therapist.photo_url}
                alt={therapist.name || 'Therapist'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                  {getInitials(therapist.name)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {therapist.name || 'Therapist'}
                  {therapist.is_verified && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      Verified
                    </span>
                  )}
                </h3>
                {therapist.professional_title && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{therapist.professional_title}</p>
                )}
              </div>

              {/* Price */}
              {therapist.session_fee && (
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    From {formatPrice(therapist.session_fee)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">per session</p>
                </div>
              )}
            </div>

            {/* Location */}
            {(therapist.city || therapist.state_province) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {[therapist.city, therapist.state_province].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Session formats */}
            {therapist.session_format && therapist.session_format.length > 0 && (
              <div className="flex gap-2 mt-2">
                {therapist.session_format.map(format => (
                  <span
                    key={format}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 capitalize"
                  >
                    {format}
                  </span>
                ))}
                {therapist.offers_free_consultation && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Free consultation
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio excerpt */}
        {therapist.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 line-clamp-2">
            {therapist.bio}
          </p>
        )}

        {/* Specializations */}
        {displayedSpecializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {displayedSpecializations.map((spec) => (
              <span
                key={spec.slug}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                {spec.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

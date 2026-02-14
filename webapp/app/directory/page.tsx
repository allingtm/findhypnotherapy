import { createClient } from '@/lib/supabase/server'
import { SearchFilters } from '@/components/directory/SearchFilters'
import { TherapistCard } from '@/components/directory/TherapistCard'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { TrackSearchImpressions } from '@/components/analytics/TrackSearchImpressions'

type TherapistSearchResult = Database['public']['Functions']['search_therapists']['Returns'][number]

export const metadata = {
  title: 'Find a Hypnotherapist | Find Hypnotherapy',
  description: 'Search our directory of qualified hypnotherapists. Filter by location, specialisation, and session format to find the right therapist for you.',
}

interface DirectoryPageProps {
  searchParams: Promise<{
    q?: string
    location?: string
    specialization?: string
    format?: string
    page?: string
  }>
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = parseInt(params.page || '1', 10)
  const pageSize = 20

  // Fetch specializations for filter dropdown
  const { data: specializations } = await supabase
    .from('specializations')
    .select('id, name, slug, category')
    .eq('is_active', true)
    .order('display_order')

  // Search therapists using RPC function
  const { data: results, error } = await supabase.rpc('search_therapists', {
    search_query: params.q || null,
    location_filter: params.location || null,
    specialization_slugs: params.specialization ? [params.specialization] : null,
    session_format_filter: params.format || null,
    page_number: currentPage,
    page_size: pageSize,
  })

  const totalCount = results?.[0]?.total_count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-neutral-950">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Find a Hypnotherapist</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse our directory of qualified hypnotherapists
            </p>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SearchFilters specializations={specializations || []} />

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalCount === 0
              ? 'No therapists found'
              : `Showing ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} therapist${totalCount === 1 ? '' : 's'}`}
          </p>
        </div>

        {/* Results grid */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Unable to load therapists. Please try again later.
            </p>
          </div>
        ) : results && results.length > 0 ? (
          <>
            <TrackSearchImpressions
              impressions={results.map((t: TherapistSearchResult, idx: number) => ({
                therapistProfileId: t.id,
                position: ((currentPage - 1) * pageSize) + idx + 1,
              }))}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((therapist: TherapistSearchResult) => (
                <TherapistCard key={therapist.id} therapist={therapist} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No therapists found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search filters or browse all therapists.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link
                href={{
                  pathname: '/directory',
                  query: { ...params, page: currentPage - 1 },
                }}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Previous
              </Link>
            )}

            <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={{
                  pathname: '/directory',
                  query: { ...params, page: currentPage + 1 },
                }}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
      </div>

      <Footer />
    </div>
  )
}

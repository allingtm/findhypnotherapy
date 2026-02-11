'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Specialization {
  id: string
  name: string
  slug: string
  category: string | null
}

interface VideoFeedFiltersProps {
  specializations: Specialization[]
}

export function VideoFeedFilters({ specializations }: VideoFeedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '')

  // Group specializations by category
  const groupedSpecializations = specializations.reduce((acc, spec) => {
    const category = spec.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(spec)
    return acc
  }, {} as Record<string, Specialization[]>)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    if (specialization) params.set('specialization', specialization)

    startTransition(() => {
      router.push(`/videos?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setQuery('')
    setLocation('')
    setSpecialization('')

    startTransition(() => {
      router.push('/videos')
    })
  }

  const hasFilters = query || location || specialization

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search query */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full h-10 px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or postal code..."
            className="w-full h-10 px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
          />
        </div>

        {/* Specialization */}
        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Specialisation
          </label>
          <select
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full h-10 px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
          >
            <option value="">All specialisations</option>
            {Object.entries(groupedSpecializations).map(([category, specs]) => (
              <optgroup key={category} label={category}>
                {specs.map((spec) => (
                  <option key={spec.slug} value={spec.slug}>
                    {spec.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="h-10 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

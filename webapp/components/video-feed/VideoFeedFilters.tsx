'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export function VideoFeedFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [format, setFormat] = useState(searchParams.get('format') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (format) params.set('format', format)

    startTransition(() => {
      router.push(`/videos?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setQuery('')
    setFormat('')

    startTransition(() => {
      router.push('/videos')
    })
  }

  const hasFilters = query || format

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search query */}
        <div className="flex-1">
          <label htmlFor="query" className="sr-only">
            Search videos
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
          />
        </div>

        {/* Session Format */}
        <div className="sm:w-48">
          <label htmlFor="format" className="sr-only">
            Session Format
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600"
          >
            <option value="">All formats</option>
            <option value="in-person">Face to Face</option>
            <option value="online">Online</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

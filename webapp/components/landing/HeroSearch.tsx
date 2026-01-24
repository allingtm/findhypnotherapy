'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Specialization {
  id: string
  name: string
  slug: string
  category: string | null
}

interface HeroSearchProps {
  specializations: Specialization[]
}

export function HeroSearch({ specializations }: HeroSearchProps) {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [specialization, setSpecialization] = useState('')

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
    if (location) params.set('location', location)
    if (specialization) params.set('specialization', specialization)
    router.push(`/directory?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950 overflow-hidden py-12 md:py-0">
      {/* Floating decorative elements - pastels (light) / muted tones (dark) */}
      {/* Mobile: show 6 shapes, Desktop: show all 14 */}

      {/* Top left - 2 visible on mobile */}
      <div className="absolute top-16 left-[5%] w-14 h-14 md:w-20 md:h-20 bg-[#FEF3C7] dark:bg-amber-900/50 rounded-3xl rotate-12 opacity-70" />
      <div className="hidden md:block absolute top-36 left-[12%] w-10 h-10 bg-[#BFDBFE] dark:bg-blue-900/50 rounded-xl -rotate-6 opacity-60" />
      <div className="absolute top-40 left-[3%] w-10 h-10 md:top-56 md:left-[5%] md:w-14 md:h-14 bg-[#E9D5FF] dark:bg-purple-900/50 rounded-2xl rotate-3 opacity-65" />

      {/* Top right - 2 visible on mobile */}
      <div className="absolute top-20 right-[5%] w-16 h-16 md:w-24 md:h-24 bg-[#DBEAFE] dark:bg-blue-800/50 rounded-[2rem] -rotate-6 opacity-75" />
      <div className="absolute top-44 right-[8%] w-10 h-10 md:top-40 md:right-[18%] md:w-12 md:h-12 bg-[#FECACA] dark:bg-rose-900/50 rounded-xl rotate-8 opacity-65" />
      <div className="hidden md:block absolute top-20 right-[28%] w-8 h-8 bg-[#D1FAE5] dark:bg-emerald-900/50 rounded-lg rotate-12 opacity-60" />

      {/* Middle area (sides) - desktop only */}
      <div className="hidden md:block absolute top-1/2 left-[2%] w-16 h-16 bg-[#FDE68A] dark:bg-amber-800/50 rounded-3xl -rotate-12 opacity-70" />
      <div className="hidden md:block absolute top-1/2 right-[3%] w-16 h-16 bg-[#DDD6FE] dark:bg-violet-900/50 rounded-[2rem] rotate-6 opacity-70" />

      {/* Bottom left - 1 visible on mobile */}
      <div className="absolute bottom-32 left-[5%] w-12 h-12 md:w-14 md:h-14 bg-[#D1FAE5] dark:bg-emerald-800/50 rounded-3xl rotate-6 opacity-70" />
      <div className="hidden md:block absolute bottom-20 left-[15%] w-10 h-10 bg-[#FECACA] dark:bg-rose-800/50 rounded-xl -rotate-8 opacity-65" />
      <div className="hidden md:block absolute bottom-56 left-[2%] w-8 h-8 bg-[#BFDBFE] dark:bg-blue-800/50 rounded-lg rotate-[15deg] opacity-55" />

      {/* Bottom right - 1 visible on mobile */}
      <div className="absolute bottom-28 right-[5%] w-14 h-14 md:w-20 md:h-20 bg-[#FECACA] dark:bg-rose-900/50 rounded-[2rem] -rotate-12 opacity-70" />
      <div className="hidden md:block absolute bottom-48 right-[12%] w-16 h-16 bg-[#A7F3D0] dark:bg-emerald-800/50 rounded-3xl rotate-8 opacity-70" />
      <div className="hidden md:block absolute bottom-16 right-[20%] w-12 h-12 bg-[#E9D5FF] dark:bg-purple-800/50 rounded-2xl -rotate-3 opacity-65" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6 leading-tight">
          Find a Hypnotherapist
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
          Your trusted directory for qualified hypnotherapists across the UK
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4 md:px-0">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl md:rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 md:p-3">
            <div className="flex flex-col md:flex-row gap-3 md:gap-2">
              {/* Location Input */}
              <div className="flex-1">
                <label htmlFor="location" className="sr-only">Location</label>
                <input
                  type="text"
                  id="location"
                  placeholder="Enter your location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-5 py-3.5 md:px-6 md:py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl md:rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all text-base"
                />
              </div>

              {/* Specialization Dropdown */}
              <div className="flex-1">
                <label htmlFor="specialization" className="sr-only">What do you need help with?</label>
                <select
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-5 py-3.5 md:px-6 md:py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl md:rounded-full text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all appearance-none cursor-pointer text-base"
                >
                  <option value="">What do you need help with?</option>
                  {Object.entries(groupedSpecializations).map(([category, specs]) => (
                    <optgroup key={category} label={category}>
                      {specs.map((spec) => (
                        <option key={spec.id} value={spec.slug}>
                          {spec.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full md:w-auto px-10 py-3.5 md:py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-2xl md:rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Browse all link */}
        <p className="mt-6 text-gray-500 dark:text-gray-400">
          or{' '}
          <Link href="/directory" className="text-gray-900 dark:text-gray-100 underline hover:no-underline font-medium">
            browse all hypnotherapists
          </Link>
        </p>
      </div>
    </section>
  )
}

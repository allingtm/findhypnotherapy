'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'

// Dynamically import BackgroundBeams to avoid hydration issues
const BackgroundBeams = dynamic(
  () => import('@/components/ui/background-beams').then(mod => mod.BackgroundBeams),
  { ssr: false }
)

interface HomeContentProps {
  user: any
}

export function HomeContent({ user }: HomeContentProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        {/* Main Heading with Gradient */}
        <h1 className="relative z-10 text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 text-center font-bold mb-6 leading-tight pb-2">
          Find Hypnotherapy
        </h1>

        {/* Animated Subheading */}
        <TextGenerateEffect
          words="Your trusted directory for qualified hypnotherapists across the UK"
          className="text-xl md:text-2xl text-center text-gray-700 mb-8"
        />

        {/* Coming Soon Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 text-purple-700 backdrop-blur-sm shadow-sm">
            <svg
              className="w-4 h-4 mr-2 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="10" cy="10" r="4" />
            </svg>
            Coming Soon
          </span>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-700 text-center text-base md:text-lg mb-4 leading-relaxed">
            We&apos;re building a platform to connect people seeking help with qualified,
            vetted hypnotherapists. Search by location, specialism, and session type
            to find the perfect practitioner for your needs.
          </p>

          <p className="text-gray-600 text-center text-sm md:text-base mb-8">
            For hypnotherapists: Join our directory to reach more clients, build your
            authority through content, and track your enquiries—all from £10/month for
            founding members.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          {user ? (
            <Link
              href="/dashboard"
              className="relative px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="relative px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join as a Practitioner
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 rounded-lg bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-white/80 border border-gray-200 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-sm text-gray-600">Find practitioners by location, specialisms, and session preferences</p>
          </div>

          <div className="p-6 rounded-lg bg-white/80 border border-gray-200 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Profiles</h3>
            <p className="text-sm text-gray-600">All practitioners are vetted and qualified professionals</p>
          </div>

          <div className="p-6 rounded-lg bg-white/80 border border-gray-200 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Authority</h3>
            <p className="text-sm text-gray-600">Practitioners can publish content and showcase expertise</p>
          </div>
        </div>
      </div>

      {/* Background Beams Effect */}
      <BackgroundBeams />
    </div>
  )
}

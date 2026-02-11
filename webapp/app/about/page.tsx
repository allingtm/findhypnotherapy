import Link from "next/link"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Find Hypnotherapy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Connecting people with qualified hypnotherapists across the UK to help transform lives through the power of the mind.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We believe everyone deserves access to quality hypnotherapy services. Our mission is to make it easy for people to find qualified, vetted practitioners who can help them overcome challenges and achieve their goals.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Whether you&apos;re looking to quit smoking, manage anxiety, improve confidence, or address other concerns, we&apos;re here to help you find the right therapist for your needs.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Verified and qualified practitioners</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Easy search by location and specialism</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Trusted reviews and ratings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Practitioners Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-neutral-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              For Practitioners
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join our growing community of hypnotherapists. Build your online presence, reach more clients, and grow your practice with our affordable membership plans.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Professional Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Showcase your qualifications, specialisms, and experience</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Increased Visibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get found by clients searching for hypnotherapy services</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Track Enquiries</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage and respond to client enquiries easily</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Join Find Hypnotherapy today and start your journey to better mental wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/waitlist"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg"
              >
                Join the Waiting List
              </Link>
              <Link
                href="/"
                className="px-8 py-3 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-neutral-600 font-medium transition-all"
              >
                Find a Therapist
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

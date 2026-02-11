import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WaitlistForm } from './WaitlistForm'

export default async function WaitlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Join Our Waiting List</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Be the first to know when registration opens for practitioners
          </p>
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="font-semibold">Foundation Member Offer</span>
            </div>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              Join the waitlist now and receive an exclusive discount code for just <strong>£5/month</strong> for the lifetime of your plan
            </p>
          </div>
        </div>
        <WaitlistForm />
      </div>
    </div>
  )
}

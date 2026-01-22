import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Find Hypnotherapy
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover qualified hypnotherapists in the UK
        </p>

        <div className="flex gap-4 justify-center">
          {user ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 rounded-lg font-medium transition-colors duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

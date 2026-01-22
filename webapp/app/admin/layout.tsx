import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/auth/permissions'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Check admin role
  const isAdmin = await checkIsAdmin(supabase)
  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8 items-center">
              <Link href="/admin" className="text-xl font-bold text-indigo-600">
                Admin Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Users
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                Admin
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

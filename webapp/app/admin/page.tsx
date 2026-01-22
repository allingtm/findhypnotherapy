import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import Link from 'next/link'

// Cache the admin stats query for performance
const getAdminStats = cache(async () => {
  const supabase = await createClient()

  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get users with admin role
  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('user_id, roles!inner(name)')
    .eq('roles.name', 'Admin')

  // Get users with member role
  const { data: memberRoles } = await supabase
    .from('user_roles')
    .select('user_id, roles!inner(name)')
    .eq('roles.name', 'Member')

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    totalUsers: totalUsers || 0,
    adminCount: adminRoles?.length || 0,
    memberCount: memberRoles?.length || 0,
    recentUsers: recentUsers || [],
  }
})

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalUsers}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Admins</div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">
            {stats.adminCount}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Members</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {stats.memberCount}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <Link
            href="/admin/users"
            className="block px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 font-medium transition-colors"
          >
            Manage Users →
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
        {stats.recentUsers.length > 0 ? (
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {user.name || 'No name'}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No users yet</p>
        )}
      </div>
    </div>
  )
}

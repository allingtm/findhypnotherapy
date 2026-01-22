import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { RoleManagement } from '@/components/admin/RoleManagement'

// Fetch all users with their roles
const getAllUsersWithRoles = cache(async () => {
  const supabase = await createClient()

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return { users: [], availableRoles: [] }
  }

  // Get all user roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      roles (
        id,
        name
      )
    `)

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError)
    return {
      users: users.map(user => ({ ...user, roles: [] })),
      availableRoles: []
    }
  }

  // Get all available roles
  const { data: availableRoles, error: availableRolesError } = await supabase
    .from('roles')
    .select('id, name')

  if (availableRolesError) {
    console.error('Error fetching available roles:', availableRolesError)
  }

  // Map roles to users
  const usersWithRoles = users.map(user => {
    const roles = userRoles
      ?.filter(ur => ur.user_id === user.id)
      .map(ur => ur.roles)
      .filter(Boolean)
      .flat() || []

    return {
      ...user,
      roles,
    }
  })

  return { users: usersWithRoles, availableRoles: availableRoles || [] }
})

export default async function AdminUsersPage() {
  const { users, availableRoles } = await getAllUsersWithRoles()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'No name'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {user.roles.map((role: any) => (
                        <span
                          key={role.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            role.name === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <RoleManagement
                      userId={user.id}
                      currentRoles={user.roles}
                      availableRoles={availableRoles}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}

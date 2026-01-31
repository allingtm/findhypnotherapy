'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Role {
  id: string
  name: string
}

interface RoleManagementProps {
  userId: string
  currentRoles: Role[]
  availableRoles: Role[]
}

export function RoleManagement({
  userId,
  currentRoles,
  availableRoles,
}: RoleManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentRoleIds = currentRoles.map(r => r.id)

  const handleToggleRole = async (roleId: string, isCurrentlyAssigned: boolean) => {
    setIsLoading(true)

    try {
      if (isCurrentlyAssigned) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role_id', roleId)

        if (error) throw error
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleId,
          })

        if (error) throw error
      }

      // Refresh the page to show updated roles
      router.refresh()
      setIsOpen(false)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-indigo-600 hover:text-indigo-900 font-medium"
        disabled={isLoading}
      >
        Manage Roles
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Assign Roles
              </div>
              {availableRoles.map((role) => {
                const isAssigned = currentRoleIds.includes(role.id)
                return (
                  <button
                    key={role.id}
                    onClick={() => handleToggleRole(role.id, isAssigned)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between disabled:opacity-50"
                  >
                    <span>{role.name}</span>
                    {isAssigned && (
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

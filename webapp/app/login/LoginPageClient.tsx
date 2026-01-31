'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RoleSelector } from './RoleSelector'
import { ClientLoginSection } from './ClientLoginSection'
import { TherapistLoginSection } from './TherapistLoginSection'

interface LoginPageClientProps {
  initialRole?: 'client' | 'therapist' | null
}

export function LoginPageClient({ initialRole = null }: LoginPageClientProps) {
  const [selectedRole, setSelectedRole] = useState<'client' | 'therapist' | null>(initialRole)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
        {!selectedRole && (
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        )}

        {!selectedRole ? (
          <RoleSelector onSelect={setSelectedRole} />
        ) : selectedRole === 'client' ? (
          <ClientLoginSection onBack={() => setSelectedRole(null)} />
        ) : (
          <TherapistLoginSection onBack={() => setSelectedRole(null)} />
        )}
      </div>
    </div>
  )
}

'use client'

import { IconUser, IconBriefcase } from '@tabler/icons-react'

interface RoleSelectorProps {
  onSelect: (role: 'client' | 'therapist') => void
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome Back
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        How would you like to sign in?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client Card */}
        <button
          onClick={() => onSelect('client')}
          className="p-6 rounded-lg border-2 border-gray-200 dark:border-neutral-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 mx-auto">
            <IconUser className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-center">
            I&apos;m a Client
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Access your client portal
          </p>
        </button>

        {/* Therapist Card */}
        <button
          onClick={() => onSelect('therapist')}
          className="p-6 rounded-lg border-2 border-gray-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
            <IconBriefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-center">
            I&apos;m a Therapist
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Manage your practice
          </p>
        </button>
      </div>
    </div>
  )
}

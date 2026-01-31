'use client'

import { IconArrowLeft, IconBriefcase } from '@tabler/icons-react'
import { LoginForm } from './LoginForm'

interface TherapistLoginSectionProps {
  onBack: () => void
}

export function TherapistLoginSection({ onBack }: TherapistLoginSectionProps) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <IconArrowLeft className="w-4 h-4 mr-2" />
        Back to options
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <IconBriefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Therapist Login
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sign in to manage your practice
        </p>
      </div>

      <LoginForm />
    </div>
  )
}

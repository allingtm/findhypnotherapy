'use client'

import { useMemo } from 'react'
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

// Configure zxcvbn with English dictionary
zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  dictionary: {
    ...zxcvbnEnPackage.dictionary,
  },
})

interface PasswordStrengthBarProps {
  password: string
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const result = useMemo(() => {
    if (!password) return null
    return zxcvbn(password)
  }, [password])

  if (!password || !result) return null

  const score = result.score // 0-4
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const textColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500']
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-start mt-1">
        <span className={`text-xs font-medium ${textColors[score]}`}>
          {labels[score]}
        </span>
        {result.feedback.warning && (
          <span className="text-xs text-gray-500 dark:text-gray-400 text-right ml-2">
            {result.feedback.warning}
          </span>
        )}
      </div>
    </div>
  )
}

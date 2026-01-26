'use client'

import { useState } from 'react'

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export function ExpandableText({
  text,
  maxLength = 200,
  className = '',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldTruncate = text.length > maxLength
  const displayText = isExpanded || !shouldTruncate
    ? text
    : text.slice(0, maxLength).trim() + '...'

  return (
    <div className={className}>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          {isExpanded ? 'Show less' : 'Read more...'}
        </button>
      )}
    </div>
  )
}

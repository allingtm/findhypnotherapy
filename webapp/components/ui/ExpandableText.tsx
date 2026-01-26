'use client'

import { useState } from 'react'

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

// Find the best truncation point by finishing at a sentence boundary
function findTruncationPoint(text: string, targetLength: number): number {
  // If text is shorter than target, no truncation needed
  if (text.length <= targetLength) {
    return text.length
  }

  // Look for sentence endings (.!?) after the target length
  // Search up to 100 characters beyond target to find a sentence end
  const searchEnd = Math.min(text.length, targetLength + 100)
  const searchText = text.slice(targetLength, searchEnd)

  // Find the first sentence-ending punctuation followed by a space or end of text
  const sentenceEndMatch = searchText.match(/[.!?](?:\s|$)/)

  if (sentenceEndMatch && sentenceEndMatch.index !== undefined) {
    // Include the punctuation mark
    return targetLength + sentenceEndMatch.index + 1
  }

  // If no sentence end found ahead, look backwards from target for the last sentence end
  const textBeforeTarget = text.slice(0, targetLength)
  const lastSentenceEnd = Math.max(
    textBeforeTarget.lastIndexOf('. '),
    textBeforeTarget.lastIndexOf('! '),
    textBeforeTarget.lastIndexOf('? ')
  )

  // If we found a sentence end in the first half, use it (but not if too short)
  if (lastSentenceEnd > targetLength * 0.5) {
    return lastSentenceEnd + 1 // Include the punctuation
  }

  // Fallback: just cut at target length
  return targetLength
}

export function ExpandableText({
  text,
  maxLength = 200,
  className = '',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const truncationPoint = findTruncationPoint(text, maxLength)
  const shouldTruncate = truncationPoint < text.length
  const displayText = isExpanded || !shouldTruncate
    ? text
    : text.slice(0, truncationPoint).trim() + '...'

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

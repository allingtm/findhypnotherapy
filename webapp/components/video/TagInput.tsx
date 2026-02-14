'use client'

import { useState, useCallback, useRef } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  maxLength?: number
}

export function TagInput({ tags, onChange, maxTags = 5, maxLength = 50 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim().replace(/[<>]/g, '')
      if (!trimmed) return
      if (trimmed.length > maxLength) return
      if (tags.length >= maxTags) return
      if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) return

      onChange([...tags, trimmed])
      setInputValue('')
    },
    [tags, onChange, maxTags, maxLength]
  )

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index))
    },
    [tags, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1)
      }
    },
    [inputValue, tags, addTag, removeTag]
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tags (optional)
      </label>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-neutral-700 dark:text-gray-300 rounded-full"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue)
          }}
          maxLength={maxLength}
          placeholder={tags.length === 0 ? 'Type a tag and press Enter' : 'Add another tag...'}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 text-sm"
        />
      )}

      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
        {tags.length}/{maxTags} tags. Press Enter or comma to add.
      </p>
    </div>
  )
}

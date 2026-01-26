'use client'

import { useState, useEffect } from 'react'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  defaultOpenMobile?: boolean // Override for mobile (< md breakpoint)
  children: React.ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  defaultOpenMobile,
  children,
  className = '',
}: CollapsibleSectionProps) {
  // Use defaultOpen initially, then adjust for mobile on mount
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Only run once on mount to set responsive default
    if (!hasInitialized && defaultOpenMobile !== undefined) {
      const isMobile = window.innerWidth < 768 // md breakpoint
      setIsOpen(isMobile ? defaultOpenMobile : defaultOpen)
      setHasInitialized(true)
    }
  }, [hasInitialized, defaultOpen, defaultOpenMobile])

  return (
    <section className={`bg-white dark:bg-neutral-900 rounded-lg shadow overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </section>
  )
}

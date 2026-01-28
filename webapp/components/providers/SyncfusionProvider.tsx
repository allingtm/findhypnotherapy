'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { registerLicense } from '@syncfusion/ej2-base'

let licensed = false

// Base CSS dependencies (theme-independent)
import '@syncfusion/ej2-base/styles/tailwind.css'
import '@syncfusion/ej2-buttons/styles/tailwind.css'
import '@syncfusion/ej2-calendars/styles/tailwind.css'
import '@syncfusion/ej2-dropdowns/styles/tailwind.css'
import '@syncfusion/ej2-inputs/styles/tailwind.css'
import '@syncfusion/ej2-lists/styles/tailwind.css'
import '@syncfusion/ej2-navigations/styles/tailwind.css'
import '@syncfusion/ej2-popups/styles/tailwind.css'
import '@syncfusion/ej2-schedule/styles/tailwind.css'

// Base tab styles that apply to all themes
const baseTabStyles = `
  .e-tab .e-tab-header {
    overflow: visible !important;
  }

  .e-tab .e-tab-header .e-scroll-nav,
  .e-tab .e-tab-header .e-scroll-left-nav,
  .e-tab .e-tab-header .e-scroll-right-nav {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 32px !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .e-tab .e-tab-header .e-scroll-nav .e-icons,
  .e-tab .e-tab-header .e-scroll-left-nav .e-icons,
  .e-tab .e-tab-header .e-scroll-right-nav .e-icons {
    font-size: 12px !important;
  }
`

// Dark mode specific styles
const darkModeStyles = `
  /* Syncfusion dark mode overrides */
  .e-schedule,
  .e-schedule-toolbar,
  .e-schedule .e-schedule-toolbar,
  .e-schedule .e-toolbar,
  .e-schedule .e-toolbar-items {
    background-color: #171717 !important;
    color: #e5e5e5 !important;
  }

  .e-schedule .e-header-cells,
  .e-schedule .e-all-day-cells,
  .e-schedule .e-work-cells,
  .e-schedule .e-time-cells,
  .e-schedule .e-content-table,
  .e-schedule .e-content-table td,
  .e-schedule .e-content-table tbody td,
  .e-schedule td.e-work-cells,
  .e-schedule td.e-work-hours,
  .e-schedule .e-content-wrap table td {
    background-color: #171717 !important;
    border-color: #404040 !important;
    color: #e5e5e5 !important;
  }

  .e-schedule .e-work-cells.e-work-hours,
  .e-schedule td.e-work-cells.e-work-hours,
  .e-schedule .e-content-table td.e-work-hours {
    background-color: #262626 !important;
  }

  /* Alternate row styling */
  .e-schedule .e-content-table tr:nth-child(even) td,
  .e-schedule .e-content-table tr:nth-child(odd) td {
    background-color: #171717 !important;
  }

  .e-schedule .e-content-table tr td.e-work-hours {
    background-color: #262626 !important;
  }

  .e-schedule .e-time-slots {
    border-color: #404040 !important;
  }

  .e-schedule .e-date-header-wrap,
  .e-schedule .e-schedule-table {
    border-color: #404040 !important;
  }

  .e-schedule .e-header-date,
  .e-schedule .e-header-day,
  .e-schedule .e-time-cells-wrap .e-schedule-table td,
  .e-schedule .e-time-slots,
  .e-schedule .e-time-cells,
  .e-schedule .e-time-cells span,
  .e-schedule .e-time-slots span,
  .e-schedule .e-schedule-table td span,
  .e-schedule .e-time-cells-wrap span {
    color: #a3a3a3 !important;
  }

  .e-schedule .e-current-day .e-header-date,
  .e-schedule .e-current-day .e-header-day {
    color: #60a5fa !important;
  }

  .e-schedule .e-left-indent,
  .e-schedule .e-content-wrap,
  .e-schedule .e-time-cells-wrap,
  .e-schedule .e-table-container,
  .e-schedule .e-outer-table,
  .e-schedule .e-schedule-table,
  .e-schedule .e-content-table,
  .e-schedule table,
  .e-schedule tbody,
  .e-schedule .e-date-header-container {
    background-color: #171717 !important;
  }

  .e-schedule .e-current-time {
    border-top-color: #ef4444 !important;
  }

  .e-schedule .e-current-time::before {
    background-color: #ef4444 !important;
  }

  /* Popup/dialog dark mode */
  .e-schedule-dialog,
  .e-quick-popup-wrapper,
  .e-popup {
    background-color: #262626 !important;
    color: #e5e5e5 !important;
  }

  .e-popup .e-header,
  .e-quick-popup-wrapper .e-header {
    background-color: #171717 !important;
    color: #e5e5e5 !important;
  }

  .e-popup .e-cell-popup .e-field,
  .e-quick-popup-wrapper .e-popup-content {
    background-color: #262626 !important;
    color: #e5e5e5 !important;
  }

  /* Toolbar buttons */
  .e-schedule .e-toolbar .e-tbar-btn,
  .e-schedule .e-toolbar .e-btn {
    background-color: transparent !important;
    color: #e5e5e5 !important;
  }

  .e-schedule .e-toolbar .e-tbar-btn:hover,
  .e-schedule .e-toolbar .e-btn:hover {
    background-color: #404040 !important;
  }

  /* View navigation active state */
  .e-schedule .e-toolbar .e-active-view .e-tbar-btn {
    background-color: #3b82f6 !important;
    color: white !important;
  }

  /* Catch-all for any remaining text */
  .e-schedule span,
  .e-schedule .e-text-ellipsis,
  .e-schedule .e-resource-text {
    color: #e5e5e5 !important;
  }

  /* Time column specifically */
  .e-schedule .e-time-cells-wrap .e-time-cells,
  .e-schedule .e-time-cells-wrap td {
    color: #a3a3a3 !important;
  }

  /* Aggressive catch-all for any missed backgrounds */
  .e-schedule *:not(.e-appointment):not([class*="e-appointment"]) {
    background-color: inherit;
  }

  .e-schedule .e-schedule-table td,
  .e-schedule .e-schedule-table tr td,
  .e-schedule .e-content-wrap td {
    background-color: #171717 !important;
  }

  .e-schedule .e-schedule-table td.e-work-hours,
  .e-schedule .e-content-wrap td.e-work-hours {
    background-color: #262626 !important;
  }

  /* Syncfusion Tab dark mode */
  .e-tab {
    background-color: transparent !important;
  }

  .e-tab .e-tab-header {
    background-color: transparent !important;
    border-bottom-color: #404040 !important;
  }

  .e-tab .e-tab-header .e-toolbar-items {
    background-color: transparent !important;
  }

  .e-tab .e-tab-header .e-toolbar-item {
    background-color: transparent !important;
  }

  .e-tab .e-tab-header .e-toolbar-item .e-tab-wrap {
    color: #a3a3a3 !important;
    background-color: transparent !important;
  }

  .e-tab .e-tab-header .e-toolbar-item .e-tab-wrap:hover {
    color: #e5e5e5 !important;
    background-color: #262626 !important;
  }

  .e-tab .e-tab-header .e-toolbar-item.e-active {
    background-color: transparent !important;
  }

  .e-tab .e-tab-header .e-toolbar-item.e-active .e-tab-wrap {
    color: #60a5fa !important;
    background-color: transparent !important;
  }

  .e-tab .e-tab-header .e-indicator {
    background-color: #60a5fa !important;
  }

  .e-tab .e-tab-header .e-tab-text {
    color: inherit !important;
  }

  .e-tab .e-tab-header .e-tab-icon {
    color: inherit !important;
  }

  .e-tab .e-content {
    background-color: transparent !important;
  }

  /* Tab scroll navigation dark mode */
  .e-tab .e-tab-header .e-hor-nav,
  .e-tab .e-tab-header .e-scroll-nav,
  .e-tab .e-tab-header .e-scroll-left-nav,
  .e-tab .e-tab-header .e-scroll-right-nav {
    background-color: #262626 !important;
    color: #e5e5e5 !important;
    border-color: #404040 !important;
  }

  .e-tab .e-tab-header .e-hor-nav:hover,
  .e-tab .e-tab-header .e-scroll-nav:hover,
  .e-tab .e-tab-header .e-scroll-left-nav:hover,
  .e-tab .e-tab-header .e-scroll-right-nav:hover,
  .e-tab .e-tab-header .e-hor-nav:focus,
  .e-tab .e-tab-header .e-scroll-nav:focus,
  .e-tab .e-tab-header .e-scroll-left-nav:focus,
  .e-tab .e-tab-header .e-scroll-right-nav:focus,
  .e-tab .e-tab-header .e-hor-nav:active,
  .e-tab .e-tab-header .e-scroll-nav:active,
  .e-tab .e-tab-header .e-scroll-left-nav:active,
  .e-tab .e-tab-header .e-scroll-right-nav:active {
    background-color: #404040 !important;
  }

  /* Nav button and all children */
  .e-tab .e-tab-header .e-hor-nav *,
  .e-tab .e-tab-header .e-scroll-nav *,
  .e-tab .e-tab-header .e-scroll-left-nav *,
  .e-tab .e-tab-header .e-scroll-right-nav *,
  .e-tab .e-tab-header .e-nav-left-arrow,
  .e-tab .e-tab-header .e-nav-right-arrow {
    background-color: transparent !important;
  }

  /* Nav button icons */
  .e-tab .e-tab-header .e-hor-nav .e-icons,
  .e-tab .e-tab-header .e-scroll-nav .e-icons,
  .e-tab .e-tab-header .e-scroll-left-nav .e-icons,
  .e-tab .e-tab-header .e-scroll-right-nav .e-icons {
    color: #e5e5e5 !important;
  }

  /* Disable ripple effect in dark mode */
  .e-tab .e-tab-header .e-ripple-element {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  /* Ensure scroll buttons are visible */
  .e-tab .e-tab-header .e-hscroll-bar {
    background-color: transparent !important;
  }
`

export function SyncfusionProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!licensed) {
      const key = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY
      if (key) {
        registerLicense(key)
      }
      licensed = true
    }
  }, [])

  // Apply dark mode overrides via CSS custom properties
  useEffect(() => {
    const root = document.documentElement

    if (resolvedTheme === 'dark') {
      // Syncfusion dark theme colors
      root.style.setProperty('--color-sf-primary', '#60a5fa')
      root.style.setProperty('--color-sf-primary-dark', '#3b82f6')
    } else {
      // Remove custom properties in light mode
      root.style.removeProperty('--color-sf-primary')
      root.style.removeProperty('--color-sf-primary-dark')
    }
  }, [resolvedTheme])

  // Inject styles dynamically to avoid styled-jsx nesting issues
  useEffect(() => {
    // Remove any existing style elements we created
    const existingBase = document.getElementById('sf-base-styles')
    const existingDark = document.getElementById('sf-dark-styles')

    if (existingBase) existingBase.remove()
    if (existingDark) existingDark.remove()

    // Add base styles
    const baseStyle = document.createElement('style')
    baseStyle.id = 'sf-base-styles'
    baseStyle.textContent = baseTabStyles
    document.head.appendChild(baseStyle)

    // Add dark mode styles if needed
    if (resolvedTheme === 'dark') {
      const darkStyle = document.createElement('style')
      darkStyle.id = 'sf-dark-styles'
      darkStyle.textContent = darkModeStyles
      document.head.appendChild(darkStyle)
    }

    return () => {
      const base = document.getElementById('sf-base-styles')
      const dark = document.getElementById('sf-dark-styles')
      if (base) base.remove()
      if (dark) dark.remove()
    }
  }, [resolvedTheme])

  return <>{children}</>
}

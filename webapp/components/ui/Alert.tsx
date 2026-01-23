import React from 'react'

interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
  onDismiss?: () => void
}

export function Alert({ type, message, onDismiss }: AlertProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
  }

  const icons = {
    error: '✕',
    success: '✓',
    info: 'ℹ'
  }

  return (
    <div className={`border rounded-lg p-4 mb-4 ${styles[type]} flex items-start justify-between`}>
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold">{icons[type]}</span>
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}

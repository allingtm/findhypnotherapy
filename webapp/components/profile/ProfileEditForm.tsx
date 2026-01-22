'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileEditFormProps {
  initialName: string
  initialEmail: string
}

export function ProfileEditForm({ initialName, initialEmail }: ProfileEditFormProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      // Update name in users table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('users')
          .update({ name })
          .eq('id', user.id)

        // Update email if changed
        if (email !== initialEmail) {
          const { error: emailError } = await supabase.auth.updateUser({ email })
          if (emailError) throw emailError
        }

        // Update password if provided
        if (password) {
          const { error: passwordError } = await supabase.auth.updateUser({ password })
          if (passwordError) throw passwordError
        }

        setMessage('Profile updated successfully!')
        setIsSuccess(true)
        setPassword('')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage(error instanceof Error ? error.message : 'Error updating profile')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border ${
          isSuccess
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        {email !== initialEmail && (
          <p className="text-sm text-gray-500 mt-1">
            You will receive a confirmation email to verify the new address.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          New Password (leave blank to keep current)
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter new password"
        />
        {password && (
          <p className="text-sm text-gray-500 mt-1">
            Password must be at least 8 characters long.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

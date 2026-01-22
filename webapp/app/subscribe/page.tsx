import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasActiveSubscription } from '@/lib/auth/subscriptions'
import { SubscribeButton } from '@/components/subscriptions/SubscribeButton'

export default async function SubscribePage({
  searchParams
}: {
  searchParams: Promise<{ canceled?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If already subscribed, redirect to dashboard
  const hasSubscription = await hasActiveSubscription(supabase)
  if (hasSubscription) {
    redirect('/dashboard')
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get full access to your hypnotherapy dashboard
          </p>
        </div>

        {params.canceled && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Subscription cancelled. You can try again when ready.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Professional Plan
            </h2>
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-5xl font-bold text-indigo-600">£29.99</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>
            <p className="text-sm text-green-600 font-medium">
              14-day free trial included!
            </p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Full dashboard access</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Profile management</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Directory listing</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Priority support</span>
            </li>
          </ul>

          <SubscribeButton />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Founder Member?
            </p>
            <p className="text-sm text-blue-700">
              Have a discount code? Enter it at checkout for special pricing (£9.99 or £4.99/month).
            </p>
          </div>

          <p className="text-sm text-gray-500 text-center mt-4">
            Cancel anytime. No long-term contracts.
          </p>
        </div>

        <div className="text-center mt-8">
          <a href="/profile" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Or manage your profile without subscribing →
          </a>
        </div>
      </div>
    </div>
  )
}

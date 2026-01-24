import Link from 'next/link'

export function PractitionerPricing() {
  const features = [
    'Full dashboard access',
    'Professional profile page',
    'Directory listing',
    'Video uploads',
    'Services & pricing management',
    'Multiple specialisation categories',
    'SEO-optimized profile',
    'Priority support',
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-[#FAFAFA] dark:bg-neutral-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-24 md:h-24 bg-[#DBEAFE] dark:bg-blue-900/30 rounded-3xl rotate-12 opacity-50" />
      <div className="absolute top-20 right-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#FEF3C7] dark:bg-amber-900/30 rounded-2xl -rotate-6 opacity-40" />
      <div className="absolute bottom-16 left-[8%] w-10 h-10 md:w-14 md:h-14 bg-[#E9D5FF] dark:bg-purple-900/30 rounded-xl rotate-3 opacity-40" />
      <div className="absolute bottom-12 right-[3%] w-14 h-14 md:w-20 md:h-20 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-3xl -rotate-8 opacity-50" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            One plan with everything you need. Start with a 14-day free trial.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-4">
                14-day free trial
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Professional Plan
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">£29.99</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              href="/register"
              className="block w-full py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-lg rounded-full text-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Your Free Trial
            </Link>

            {/* Founder discount note */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                <span className="font-medium">Founder Member?</span> Enter your discount code at checkout for special pricing.
              </p>
            </div>

            {/* Cancel note */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              Cancel anytime. No long-term contracts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

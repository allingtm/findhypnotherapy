import Link from 'next/link'

export function CTASection() {
  const trustIndicators = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      label: 'Verified qualifications',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      label: 'Client reviews',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: 'Book online',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      label: 'Free to search',
    },
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 overflow-hidden">
      {/* Floating decorative shapes - muted dark tones */}
      <div className="absolute top-12 left-[3%] w-20 h-20 md:w-28 md:h-28 bg-blue-900/30 rounded-3xl rotate-12 opacity-50" />
      <div className="absolute top-24 right-[5%] w-14 h-14 md:w-20 md:h-20 bg-purple-900/30 rounded-2xl -rotate-6 opacity-40" />
      <div className="absolute bottom-16 left-[5%] w-12 h-12 md:w-16 md:h-16 bg-emerald-900/30 rounded-xl rotate-6 opacity-40" />
      <div className="absolute bottom-12 right-[3%] w-16 h-16 md:w-24 md:h-24 bg-rose-900/30 rounded-3xl -rotate-8 opacity-50" />
      <div className="hidden md:block absolute top-1/2 left-[10%] w-10 h-10 bg-amber-900/30 rounded-xl rotate-3 opacity-35" />
      <div className="hidden md:block absolute top-1/3 right-[10%] w-14 h-14 bg-indigo-900/30 rounded-2xl -rotate-12 opacity-35" />

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-6">
          Ready to take the next step?
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Our directory connects you with qualified, experienced hypnotherapists across the UK. Search by location or specialisation to find someone right for you.
        </p>

        {/* CTA Button with glow effect */}
        <Link
          href="/directory"
          className="inline-flex items-center px-10 py-5 bg-white text-gray-900 font-semibold text-lg rounded-full hover:bg-gray-50 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
        >
          Search Hypnotherapists
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12">
          {trustIndicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                {indicator.icon}
              </div>
              <span className="text-sm font-medium">{indicator.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

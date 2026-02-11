import Link from 'next/link'

export function PractitionerHero() {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950 overflow-hidden py-12 md:py-0">
      {/* Floating decorative elements */}
      <div className="absolute top-16 left-[5%] w-14 h-14 md:w-20 md:h-20 bg-[#FEF3C7] dark:bg-amber-900/50 rounded-3xl rotate-12 opacity-70" />
      <div className="hidden md:block absolute top-36 left-[12%] w-10 h-10 bg-[#BFDBFE] dark:bg-blue-900/50 rounded-xl -rotate-6 opacity-60" />
      <div className="absolute top-40 left-[3%] w-10 h-10 md:top-56 md:left-[5%] md:w-14 md:h-14 bg-[#E9D5FF] dark:bg-purple-900/50 rounded-2xl rotate-3 opacity-65" />

      <div className="absolute top-20 right-[5%] w-16 h-16 md:w-24 md:h-24 bg-[#DBEAFE] dark:bg-blue-800/50 rounded-[2rem] -rotate-6 opacity-75" />
      <div className="absolute top-44 right-[8%] w-10 h-10 md:top-40 md:right-[18%] md:w-12 md:h-12 bg-[#FECACA] dark:bg-rose-900/50 rounded-xl rotate-8 opacity-65" />
      <div className="hidden md:block absolute top-20 right-[28%] w-8 h-8 bg-[#D1FAE5] dark:bg-emerald-900/50 rounded-lg rotate-12 opacity-60" />

      <div className="hidden md:block absolute top-1/2 left-[2%] w-16 h-16 bg-[#FDE68A] dark:bg-amber-800/50 rounded-3xl -rotate-12 opacity-70" />
      <div className="hidden md:block absolute top-1/2 right-[3%] w-16 h-16 bg-[#DDD6FE] dark:bg-violet-900/50 rounded-[2rem] rotate-6 opacity-70" />

      <div className="absolute bottom-32 left-[5%] w-12 h-12 md:w-14 md:h-14 bg-[#D1FAE5] dark:bg-emerald-800/50 rounded-3xl rotate-6 opacity-70" />
      <div className="hidden md:block absolute bottom-20 left-[15%] w-10 h-10 bg-[#FECACA] dark:bg-rose-800/50 rounded-xl -rotate-8 opacity-65" />

      <div className="absolute bottom-28 right-[5%] w-14 h-14 md:w-20 md:h-20 bg-[#FECACA] dark:bg-rose-900/50 rounded-[2rem] -rotate-12 opacity-70" />
      <div className="hidden md:block absolute bottom-48 right-[12%] w-16 h-16 bg-[#A7F3D0] dark:bg-emerald-800/50 rounded-3xl rotate-8 opacity-70" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6 leading-tight">
          Grow Your Hypnotherapy Practice
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
          Join the UK&apos;s trusted directory and connect with clients actively seeking your services
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="/waitlist"
            className="w-full sm:w-auto px-10 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
          >
            Join the Waiting List
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 font-semibold rounded-full border-2 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 transition-all duration-200 text-lg"
          >
            See How It Works
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}

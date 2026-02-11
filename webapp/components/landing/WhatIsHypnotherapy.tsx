export function WhatIsHypnotherapy() {
  return (
    <section className="relative py-20 lg:py-28 bg-[#E9D5FF] dark:bg-purple-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-20 md:h-20 bg-[#DDD6FE] dark:bg-purple-800/40 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-24 right-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#FECACA] dark:bg-rose-900/30 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-16 left-[5%] w-10 h-10 md:w-14 md:h-14 bg-[#DBEAFE] dark:bg-blue-900/30 rounded-xl rotate-6 opacity-50" />
      <div className="absolute bottom-12 right-[3%] w-14 h-14 md:w-18 md:h-18 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-3xl -rotate-8 opacity-50" />
      <div className="hidden md:block absolute top-1/2 right-[8%] w-10 h-10 bg-[#C4B5FD] dark:bg-violet-700/40 rounded-xl rotate-3 opacity-50" />
      <div className="hidden md:block absolute top-1/3 left-[8%] w-12 h-12 bg-[#FEF3C7] dark:bg-amber-900/30 rounded-2xl -rotate-12 opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100 mb-8">
              The science behind hypnotherapy
            </h2>

            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Hypnotherapy is a guided state of focused relaxation. During a session, your brain enters a natural state similar to daydreaming, where it becomes more open to positive suggestions.
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Research shows this state involves measurable changes in brain activity—altered brain wave patterns and neurotransmitter levels that help facilitate therapeutic change.
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                It&apos;s nothing like stage hypnosis. You remain aware and in control throughout. Your hypnotherapist simply guides you to access your mind&apos;s natural capacity for positive change.
              </p>
            </div>
          </div>

          {/* Decorative Visual */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              {/* Main decorative card */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] rotate-3 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
                    Natural brain state
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm mt-1">
                    Focused relaxation
                  </p>
                </div>
              </div>

              {/* Overlapping smaller card */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 md:w-40 md:h-40 bg-[#D1FAE5] dark:bg-emerald-900/50 rounded-2xl -rotate-6 shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-300">Safe</div>
                  <div className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400">& natural</div>
                </div>
              </div>

              {/* Another small decorative element */}
              <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-[#FEF3C7] dark:bg-amber-900/50 rounded-xl rotate-12 shadow-md flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

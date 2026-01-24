export function PractitionerPainPoints() {
  const painPoints = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Waiting for word-of-mouth referrals that rarely come',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      text: 'Struggling to build a professional online presence',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Paying high fees to directories that don\'t deliver results',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Finding it hard to showcase what makes you different',
    },
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-[#D1FAE5] dark:bg-emerald-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-8 left-[5%] w-16 h-16 md:w-20 md:h-20 bg-[#A7F3D0] dark:bg-emerald-800/50 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-12 right-[8%] w-12 h-12 md:w-16 md:h-16 bg-[#FEF3C7] dark:bg-amber-900/40 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-12 left-[10%] w-10 h-10 md:w-14 md:h-14 bg-[#DBEAFE] dark:bg-blue-900/40 rounded-xl rotate-6 opacity-50" />
      <div className="absolute bottom-8 right-[5%] w-14 h-14 md:w-18 md:h-18 bg-[#E9D5FF] dark:bg-purple-900/40 rounded-3xl -rotate-12 opacity-50" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            Tired of waiting for new clients?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            You&apos;re a qualified hypnotherapist with the skills to help people. But finding those people shouldn&apos;t be this hard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-white/60 dark:bg-neutral-900/40 rounded-2xl backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                {point.icon}
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium pt-2">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

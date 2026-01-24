export function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Initial Consultation',
      description:
        "Your hypnotherapist will discuss your goals and explain the process. This is your chance to ask questions and feel comfortable.",
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'The Session',
      description:
        "You'll be guided into deep relaxation while remaining fully aware. Your therapist uses carefully chosen suggestions tailored to your needs.",
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Building Progress',
      description:
        'Most people notice changes within a few sessions. You may learn self-hypnosis techniques to reinforce progress at home.',
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-[#DBEAFE] dark:bg-blue-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-24 md:h-24 bg-[#BFDBFE] dark:bg-blue-800/40 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-20 right-[5%] w-12 h-12 md:w-18 md:h-18 bg-[#E9D5FF] dark:bg-purple-900/30 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-16 left-[5%] w-14 h-14 md:w-20 md:h-20 bg-[#FEF3C7] dark:bg-amber-900/30 rounded-3xl rotate-6 opacity-50" />
      <div className="absolute bottom-12 right-[3%] w-10 h-10 md:w-16 md:h-16 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-2xl -rotate-8 opacity-50" />
      <div className="hidden md:block absolute top-1/2 left-[10%] w-10 h-10 bg-[#93C5FD] dark:bg-blue-700/40 rounded-xl rotate-3 opacity-50" />
      <div className="hidden md:block absolute top-1/3 right-[10%] w-14 h-14 bg-[#FECACA] dark:bg-rose-900/30 rounded-2xl -rotate-12 opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-16">
          What to expect
        </h2>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="relative bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
                {/* Step number badge */}
                <div className="absolute -top-4 left-8 w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon container */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mt-2">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

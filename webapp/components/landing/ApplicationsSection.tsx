export function ApplicationsSection() {
  const applications = [
    {
      title: 'Anxiety & Stress Relief',
      description:
        'Learn to quiet racing thoughts and find calm when you need it most. Hypnotherapy helps you access a deeply relaxed state where positive changes can take root.',
      bgColor: 'bg-[#FEF3C7]',
      darkBgColor: 'dark:bg-yellow-900/30',
      rotation: '-rotate-1',
      icon: (
        <svg
          className="w-8 h-8 text-yellow-700 dark:text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Pain Management',
      description:
        'Discover techniques to change how your mind processes pain signals. Many people find relief from conditions like fibromyalgia, migraines, and chronic discomfort.',
      bgColor: 'bg-[#DBEAFE]',
      darkBgColor: 'dark:bg-blue-900/30',
      rotation: 'rotate-1',
      icon: (
        <svg
          className="w-8 h-8 text-blue-700 dark:text-blue-400"
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
      title: 'Better Sleep',
      description:
        "Struggling to switch off at night? Hypnotherapy can help you develop healthier sleep patterns and finally get the restful nights you deserve.",
      bgColor: 'bg-[#D1FAE5]',
      darkBgColor: 'dark:bg-green-900/30',
      rotation: '-rotate-1',
      icon: (
        <svg
          className="w-8 h-8 text-green-700 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-16 left-[2%] w-20 h-20 md:w-28 md:h-28 bg-[#E9D5FF] dark:bg-purple-900/20 rounded-3xl rotate-12 opacity-40" />
      <div className="absolute top-24 right-[3%] w-14 h-14 md:w-20 md:h-20 bg-[#FECACA] dark:bg-rose-900/20 rounded-2xl -rotate-6 opacity-35" />
      <div className="absolute bottom-20 left-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#BFDBFE] dark:bg-blue-900/20 rounded-xl rotate-6 opacity-35" />
      <div className="absolute bottom-16 right-[2%] w-16 h-16 md:w-24 md:h-24 bg-[#A7F3D0] dark:bg-emerald-900/20 rounded-3xl -rotate-12 opacity-40" />
      <div className="hidden md:block absolute top-1/2 left-[8%] w-10 h-10 bg-[#FDE68A] dark:bg-amber-900/20 rounded-xl rotate-3 opacity-30" />
      <div className="hidden md:block absolute top-1/3 right-[8%] w-12 h-12 bg-[#DDD6FE] dark:bg-violet-900/20 rounded-2xl -rotate-8 opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-16">
          How hypnotherapy can help you
        </h2>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {applications.map((app, index) => (
            <div
              key={index}
              className={`${app.bgColor} ${app.darkBgColor} rounded-3xl p-8 ${app.rotation} shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:rotate-0 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center mb-6">
                {app.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {app.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {app.description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary applications */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-12">
          Also effective for: smoking cessation, weight management, phobias, confidence, and more.
        </p>
      </div>
    </section>
  )
}

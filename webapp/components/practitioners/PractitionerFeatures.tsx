export function PractitionerFeatures() {
  const features = [
    {
      title: 'Professional Profile',
      description:
        'Showcase your qualifications, specialisms, and experience with a beautiful profile page that builds trust with potential clients.',
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Video Marketing',
      description:
        'Upload videos to introduce yourself and build trust before clients even contact you. Let your personality shine through.',
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Get Found',
      description:
        'Appear in searches by location and specialisation. Your profile is SEO-optimized to help clients find you on Google.',
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
  ]

  const additionalFeatures = [
    'Service & pricing management',
    'Online, in-person, or phone sessions',
    'Free consultation badge',
    'Direct booking link integration',
    'Multiple specialisation categories',
    'Availability notes',
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-16 left-[2%] w-20 h-20 md:w-28 md:h-28 bg-[#E9D5FF] dark:bg-purple-900/20 rounded-3xl rotate-12 opacity-40" />
      <div className="absolute top-24 right-[3%] w-14 h-14 md:w-20 md:h-20 bg-[#FECACA] dark:bg-rose-900/20 rounded-2xl -rotate-6 opacity-35" />
      <div className="absolute bottom-20 left-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#BFDBFE] dark:bg-blue-900/20 rounded-xl rotate-6 opacity-35" />
      <div className="absolute bottom-16 right-[2%] w-16 h-16 md:w-24 md:h-24 bg-[#A7F3D0] dark:bg-emerald-900/20 rounded-3xl -rotate-12 opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Everything you need to grow your practice
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete platform designed specifically for hypnotherapists
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} ${feature.darkBgColor} rounded-3xl p-8 ${feature.rotation} shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:rotate-0 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional features */}
        <div className="bg-gray-50 dark:bg-neutral-800 rounded-3xl p-8 md:p-10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Plus all these features included
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

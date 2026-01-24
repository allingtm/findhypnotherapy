export function PractitionerHowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create Your Account',
      description:
        'Sign up in minutes with your email. No credit card required to start your 14-day free trial.',
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Build Your Profile',
      description:
        'Add your qualifications, specialisms, bio, services with pricing, and upload a video introduction.',
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Go Live',
      description:
        'Publish your profile and start appearing in client searches immediately. Track your enquiries from your dashboard.',
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ]

  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 bg-[#E9D5FF] dark:bg-purple-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-20 md:h-20 bg-[#DDD6FE] dark:bg-purple-800/40 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-24 right-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#FECACA] dark:bg-rose-900/30 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-16 left-[5%] w-10 h-10 md:w-14 md:h-14 bg-[#DBEAFE] dark:bg-blue-900/30 rounded-xl rotate-6 opacity-50" />
      <div className="absolute bottom-12 right-[3%] w-14 h-14 md:w-18 md:h-18 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-3xl -rotate-8 opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Get started in three easy steps
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            From sign-up to your first client enquiry, we make it simple
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="relative bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
                {/* Step number badge */}
                <div className="absolute -top-4 left-8 w-10 h-10 bg-purple-600 dark:bg-purple-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon container */}
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 mt-2">
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

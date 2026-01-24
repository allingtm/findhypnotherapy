export function PractitionerTestimonials() {
  const testimonials = [
    {
      quote:
        "Since joining, I've received 5 new client enquiries per month. The video feature really helps clients feel comfortable before reaching out.",
      name: 'Sarah M.',
      title: 'Clinical Hypnotherapist',
      location: 'London',
      rotation: '-rotate-1',
    },
    {
      quote:
        "Finally, a directory that doesn't charge extortionate fees. My profile looks professional and clients tell me they found me easily.",
      name: 'James T.',
      title: 'Hypnotherapist',
      location: 'Manchester',
      rotation: 'rotate-1',
    },
    {
      quote:
        'The setup was straightforward and I was live within an hour. Already seeing results and getting quality enquiries.',
      name: 'Emma R.',
      title: 'Solution Focused Hypnotherapist',
      location: 'Bristol',
      rotation: '-rotate-1',
    },
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-[#DBEAFE] dark:bg-blue-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-24 md:h-24 bg-[#BFDBFE] dark:bg-blue-800/40 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-20 right-[5%] w-12 h-12 md:w-18 md:h-18 bg-[#E9D5FF] dark:bg-purple-900/30 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-16 left-[5%] w-14 h-14 md:w-20 md:h-20 bg-[#FEF3C7] dark:bg-amber-900/30 rounded-3xl rotate-6 opacity-50" />
      <div className="absolute bottom-12 right-[3%] w-10 h-10 md:w-16 md:h-16 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-2xl -rotate-8 opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Trusted by hypnotherapists across the UK
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            See what practitioners are saying about Find Hypnotherapy
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${testimonial.rotation} hover:rotate-0 transition-all duration-300`}
            >
              {/* Quote icon */}
              <div className="mb-6">
                <svg className="w-10 h-10 text-blue-200 dark:text-blue-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.title}, {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

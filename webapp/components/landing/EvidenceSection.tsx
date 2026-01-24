export function EvidenceSection() {
  const stats = [
    {
      value: '79%',
      label: 'showed greater anxiety reduction than control groups',
      source: 'Meta-analysis of hypnosis for anxiety',
      rotation: '-rotate-1',
    },
    {
      value: '58%',
      label: 'of studies showed improved sleep outcomes',
      source: 'NIH systematic review',
      rotation: 'rotate-1',
    },
    {
      value: 'Proven',
      label: 'effective for fibromyalgia, migraines, and chronic pain',
      source: 'NIH chronic pain research',
      rotation: '-rotate-1',
    },
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-[#FAFAFA] dark:bg-neutral-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-24 md:h-24 bg-[#DBEAFE] dark:bg-blue-900/30 rounded-3xl rotate-12 opacity-50" />
      <div className="absolute top-20 right-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#FEF3C7] dark:bg-amber-900/30 rounded-2xl -rotate-6 opacity-40" />
      <div className="absolute bottom-16 left-[8%] w-10 h-10 md:w-14 md:h-14 bg-[#E9D5FF] dark:bg-purple-900/30 rounded-xl rotate-3 opacity-40" />
      <div className="absolute bottom-12 right-[3%] w-14 h-14 md:w-20 md:h-20 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-3xl -rotate-8 opacity-50" />
      <div className="hidden md:block absolute top-1/2 left-[15%] w-10 h-10 bg-[#FECACA] dark:bg-rose-900/30 rounded-xl rotate-12 opacity-35" />
      <div className="hidden md:block absolute top-1/3 right-[12%] w-12 h-12 bg-[#A7F3D0] dark:bg-emerald-800/30 rounded-2xl -rotate-6 opacity-35" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${stat.rotation} hover:rotate-0 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]`}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {stat.value}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {stat.label}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                {stat.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

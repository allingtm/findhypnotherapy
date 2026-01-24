export function EmpathyHook() {
  return (
    <section className="relative py-20 lg:py-28 bg-[#D1FAE5] dark:bg-emerald-950 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-8 left-[5%] w-16 h-16 md:w-20 md:h-20 bg-[#A7F3D0] dark:bg-emerald-800/50 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-12 right-[8%] w-12 h-12 md:w-16 md:h-16 bg-[#FEF3C7] dark:bg-amber-900/40 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-12 left-[10%] w-10 h-10 md:w-14 md:h-14 bg-[#DBEAFE] dark:bg-blue-900/40 rounded-xl rotate-6 opacity-50" />
      <div className="absolute bottom-8 right-[5%] w-14 h-14 md:w-18 md:h-18 bg-[#E9D5FF] dark:bg-purple-900/40 rounded-3xl -rotate-12 opacity-50" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          Tired of struggling with anxiety, pain, or sleepless nights?
        </h2>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          You&apos;ve tried everything. Hypnotherapy offers a different approach—one that works with your mind, not against it. And the research shows it works.
        </p>
      </div>
    </section>
  )
}

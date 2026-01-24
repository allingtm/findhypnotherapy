'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Is hypnotherapy safe?',
    answer:
      'Yes. Hypnotherapy is safe and non-invasive when conducted by a qualified practitioner. You remain aware and in control throughout, and cannot be made to do anything against your will.',
  },
  {
    question: 'Will I lose control?',
    answer:
      "No. Despite what stage shows suggest, you can't be hypnotised against your will or made to do things you don't want to. You'll be deeply relaxed but fully aware.",
  },
  {
    question: 'How many sessions will I need?',
    answer:
      'This varies. Some people see results after one or two sessions, while others benefit from a longer programme. Your hypnotherapist will discuss this during your initial consultation.',
  },
  {
    question: 'What does it feel like?',
    answer:
      'Most people describe it as pleasant deep relaxation, similar to daydreaming or the moments just before sleep. You\'ll feel calm, focused, and comfortable.',
  },
  {
    question: 'Can anyone be hypnotised?',
    answer:
      'Most people can experience hypnosis to some degree, and it often improves with practice. A good hypnotherapist will find the approach that works best for you.',
  },
  {
    question: 'Is it available on the NHS?',
    answer:
      'Occasionally, but availability varies by area. Most people access hypnotherapy privately. Some health insurance policies may cover treatment.',
  },
]

function FAQItemComponent({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-amber-200/50 dark:border-neutral-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100 pr-8 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          {question}
        </span>
        <span className="flex-shrink-0 ml-4 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg
            className={`w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed pr-12">
          {answer}
        </p>
      </div>
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="relative py-20 lg:py-28 bg-[#FEF3C7] dark:bg-amber-950/30 overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-12 left-[3%] w-16 h-16 md:w-20 md:h-20 bg-[#FDE68A] dark:bg-amber-800/40 rounded-3xl rotate-12 opacity-60" />
      <div className="absolute top-20 right-[5%] w-12 h-12 md:w-16 md:h-16 bg-[#E9D5FF] dark:bg-purple-900/30 rounded-2xl -rotate-6 opacity-50" />
      <div className="absolute bottom-16 left-[5%] w-10 h-10 md:w-14 md:h-14 bg-[#D1FAE5] dark:bg-emerald-900/30 rounded-xl rotate-6 opacity-50" />
      <div className="absolute bottom-12 right-[3%] w-14 h-14 md:w-18 md:h-18 bg-[#DBEAFE] dark:bg-blue-900/30 rounded-3xl -rotate-8 opacity-50" />
      <div className="hidden md:block absolute top-1/2 left-[8%] w-10 h-10 bg-[#FECACA] dark:bg-rose-900/30 rounded-xl rotate-3 opacity-40" />
      <div className="hidden md:block absolute top-1/3 right-[8%] w-12 h-12 bg-[#FCD34D] dark:bg-amber-700/40 rounded-2xl -rotate-12 opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
          Common questions
        </h2>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] px-6 md:px-8">
          {faqs.map((faq, index) => (
            <FAQItemComponent key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}

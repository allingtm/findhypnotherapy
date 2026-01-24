'use client'

import { Footer } from '@/components/ui/Footer'
import { Navbar } from '@/components/ui/Navbar'
import {
  HeroSearch,
  EmpathyHook,
  EvidenceSection,
  ApplicationsSection,
  HowItWorksSection,
  WhatIsHypnotherapy,
  CTASection,
  FAQSection,
} from '@/components/landing'

interface Specialization {
  id: string
  name: string
  slug: string
  category: string | null
}

interface HomeContentProps {
  user: any
  specializations: Specialization[]
}

export function HomeContent({ user, specializations }: HomeContentProps) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero with Search */}
        <HeroSearch specializations={specializations} />

        {/* Empathy Hook */}
        <EmpathyHook />

        {/* Evidence/Statistics */}
        <EvidenceSection />

        {/* Applications (What can it help with) */}
        <ApplicationsSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* What is Hypnotherapy */}
        <WhatIsHypnotherapy />

        {/* CTA Section */}
        <CTASection />

        {/* FAQs */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  )
}

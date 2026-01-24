'use client'

import { Footer } from '@/components/ui/Footer'
import { Navbar } from '@/components/ui/Navbar'
import {
  PractitionerHero,
  PractitionerPainPoints,
  PractitionerFeatures,
  PractitionerTestimonials,
  PractitionerHowItWorks,
  PractitionerPricing,
  PractitionerFAQ,
  PractitionerCTA,
} from '@/components/practitioners'

export function PractitionersContent() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero with CTA */}
        <PractitionerHero />

        {/* Pain Points / Empathy Hook */}
        <PractitionerPainPoints />

        {/* Features */}
        <PractitionerFeatures />

        {/* Testimonials */}
        <PractitionerTestimonials />

        {/* How It Works */}
        <PractitionerHowItWorks />

        {/* Pricing */}
        <PractitionerPricing />

        {/* FAQ */}
        <PractitionerFAQ />

        {/* Final CTA */}
        <PractitionerCTA />
      </main>

      <Footer />
    </div>
  )
}

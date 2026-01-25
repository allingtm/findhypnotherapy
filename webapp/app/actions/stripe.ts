'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any
})

/**
 * Create a Stripe checkout session for subscription
 * @param couponCode - Optional coupon code for discounts (e.g., "FOUNDER", "FIRSTFOUNDER")
 */
export async function createCheckoutSession(couponCode?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email!,
      metadata: {
        supabase_user_id: user.id
      }
    })
    customerId = customer.id

    // Update users table with Stripe customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create checkout session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?canceled=true`,
    allow_promotion_codes: !couponCode, // Allow manual entry if no code provided
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        user_id: user.id
      }
    }
  }

  // Apply coupon if provided
  if (couponCode) {
    sessionParams.discounts = [{ coupon: couponCode }]
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  redirect(session.url!)
}

/**
 * Create a Stripe billing portal session for managing subscriptions
 * Returns the portal URL for the user to manage their subscription
 */
export async function createBillingPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's Stripe customer ID
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    throw new Error('No subscription found. Please subscribe first.')
  }

  // Create billing portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  })

  redirect(session.url)
}

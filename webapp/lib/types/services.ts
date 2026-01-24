import type { ServiceType, PriceDisplayMode } from './database'

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  single_session: 'Single Session',
  package: 'Package',
  programme: 'Programme',
  consultation: 'Consultation',
  subscription: 'Subscription',
}

export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  single_session: 'A standard one-off therapy session',
  package: 'Multiple sessions bundled together at a discount',
  programme: 'A complete transformation journey with variable sessions',
  consultation: 'Initial discovery call or assessment',
  subscription: 'Ongoing monthly support',
}

export const PRICE_DISPLAY_LABELS: Record<PriceDisplayMode, string> = {
  exact: 'Show exact price',
  from: 'Show "From" price',
  range: 'Show price range',
  contact: 'Contact for pricing',
  free: 'Free / Complimentary',
}

export const PRICE_DISPLAY_DESCRIPTIONS: Record<PriceDisplayMode, string> = {
  exact: 'Display the exact price (e.g., "£80")',
  from: 'Display minimum price (e.g., "From £80")',
  range: 'Display price range (e.g., "£80-£150")',
  contact: 'Hide price, show "Enquire for pricing"',
  free: 'Display as free or complimentary',
}

export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  single_session: 'clock',
  package: 'package',
  programme: 'award',
  consultation: 'message-circle',
  subscription: 'repeat',
}

// Common "includes" suggestions by service type
export const INCLUDES_SUGGESTIONS: Record<ServiceType, string[]> = {
  single_session: [
    'Pre-session questionnaire',
    'Session recording',
    'Follow-up email',
    'Relaxation audio',
  ],
  package: [
    'All session recordings',
    'Email support between sessions',
    'Progress tracking',
    'Workbook materials',
    'Personalised audio',
  ],
  programme: [
    'Unlimited email support',
    'Phone support',
    'Custom recordings',
    'Workbook and materials',
    'Follow-up session',
    'Money-back guarantee',
    'Lifetime access to recordings',
  ],
  consultation: [
    'No obligation',
    'Treatment plan discussion',
    'Questions answered',
  ],
  subscription: [
    'Monthly sessions',
    'Priority booking',
    'Ongoing support',
    'Member resources',
  ],
}

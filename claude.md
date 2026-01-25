# Find Hypnotherapy - Project Documentation

## Project Overview

A Next.js web application for finding and booking hypnotherapy services. Therapists can create profiles, manage availability, and accept bookings. Visitors can search the directory, contact therapists, and book appointments.

**Tech Stack:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- Stripe (Subscriptions)
- SendGrid (Email)
- Google/Microsoft Calendar Integration

**Monorepo Structure:**
- Root package.json manages workspace commands
- `webapp/` contains the main Next.js application

## Project Structure

```
findhypnotherapy/
├── webapp/
│   ├── app/
│   │   ├── actions/        # Server actions (auth, bookings, messages, stripe, etc.)
│   │   ├── api/            # API routes (webhooks, OAuth callbacks)
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── dashboard/      # Member dashboard pages
│   │   ├── directory/      # Public therapist directory
│   │   ├── book/           # Public booking flow
│   │   └── conversation/   # Visitor message thread
│   ├── components/
│   │   ├── availability/   # Booking settings, calendar sync
│   │   ├── booking/        # Booking form, calendar, time slots
│   │   ├── bookings/       # Booking management cards
│   │   ├── dashboard/      # Dashboard sidebar, billing
│   │   ├── directory/      # Search filters, therapist cards
│   │   ├── messages/       # Contact form, conversation thread
│   │   └── ...
│   ├── lib/
│   │   ├── calendar/       # Google/Microsoft calendar integration
│   │   ├── email/          # SendGrid + email templates
│   │   ├── supabase/       # Supabase clients (browser, server, admin)
│   │   ├── validation/     # Zod schemas
│   │   └── types/          # TypeScript types including database.ts
│   └── middleware.ts       # Route protection
├── docs/                   # Additional documentation
└── .env                    # Environment variables
```

## Getting Started

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # Production build
```

## Environment Variables

Required in `.env` / `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=

# SendGrid
SENDGRID_API_KEY=

# Google Calendar (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft Calendar (optional)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Calendar token encryption
CALENDAR_TOKEN_ENCRYPTION_KEY=

# App URL
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_URL=
```

## Key Features

### For Therapists (Members)
- Professional profile with bio, credentials, specializations
- Service management (sessions, packages, programmes)
- Availability scheduling (weekly + date overrides)
- Google/Microsoft calendar sync
- Booking management (confirm/cancel)
- Messaging with potential clients
- Video content uploads
- Subscription billing via Stripe (14-day free trial)

### For Visitors
- Search directory by name, location, specialty, session format
- View therapist profiles and services
- Book appointments (with email verification)
- Contact therapists via messaging
- Receive email notifications

### Admin
- User management
- Role assignment (Member/Admin)
- Audit logging

## Key Server Actions

Located in `webapp/app/actions/`:

| File | Purpose |
|------|---------|
| `auth.ts` | Login, register, password reset |
| `profile.ts` | User profile, photo upload |
| `therapist-profile.ts` | Professional profile, specializations |
| `therapist-services.ts` | Service CRUD, reordering |
| `availability.ts` | Weekly schedule, overrides, calendar sync |
| `bookings.ts` | Booking flow, confirmation, cancellation |
| `messages.ts` | Contact form, conversations, replies |
| `stripe.ts` | Checkout session, billing portal |

## Roles & Permissions

**Member:** Default role for therapists
- Dashboard access
- Profile and service management
- Booking and messaging

**Admin:** System administrators
- All member permissions
- User management at `/admin`
- Role assignment

## Database

Types defined in `webapp/lib/types/database.ts`. Key tables:
- `users` - User accounts
- `therapist_profiles` - Professional profiles
- `therapist_services` - Service offerings
- `therapist_availability` - Weekly schedule
- `therapist_booking_settings` - Booking configuration
- `bookings` - Appointment bookings
- `conversations` / `messages` - Messaging
- `subscriptions` - Stripe subscriptions

## Email Templates

Located in `webapp/lib/email/templates.ts`:
- Email verification (contact form, booking)
- New message/booking notifications
- Booking confirmed/cancelled
- Reply notifications

## Development Notes

- Server actions use `'use server'` directive
- Supabase RLS policies enforce data access
- Calendar tokens encrypted at rest
- Email verification required for new visitors
- Rate limiting on messages (5 per email per hour)

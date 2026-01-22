# Find Hypnotherapy - WebApp Documentation

## WebApp Overview

Next.js 15 application with Supabase authentication and TypeScript.

**Key Technologies:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3
- Supabase (Auth & Database)

## Directory Structure

```
webapp/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes
│   │   └── callback/      # OAuth callback handler
│   ├── dashboard/         # Protected dashboard page
│   ├── login/             # Login page & form
│   ├── register/          # Registration page & form
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Auth-related components
│   │   └── LogoutButton.tsx
│   └── ui/               # UI components (Button, Input, Alert)
├── lib/                  # Utilities & configurations
│   ├── supabase/        # Supabase client & middleware
│   │   ├── client.ts    # Browser client
│   │   ├── server.ts    # Server-side client
│   │   └── middleware.ts # Middleware client
│   └── types/           # TypeScript type definitions
│       └── database.ts  # Database types
├── middleware.ts         # Route protection middleware
├── next.config.ts       # Next.js configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Key Files

- [middleware.ts](middleware.ts) - Protects routes, handles auth redirects
- [app/layout.tsx](app/layout.tsx) - Root layout with providers
- [lib/supabase/client.ts](lib/supabase/client.ts) - Browser Supabase client
- [lib/supabase/server.ts](lib/supabase/server.ts) - Server-side Supabase client
- [lib/supabase/middleware.ts](lib/supabase/middleware.ts) - Middleware Supabase client

## Development Workflows

**Running the app:**
```bash
npm run dev    # Start dev server (localhost:3000)
```

**Building:**
```bash
npm run build  # Production build
npm run start  # Run production server
```

**Linting:**
```bash
npm run lint   # Run ESLint
```

## Authentication Flow

1. User visits login/register pages
2. Form submission sends credentials to Supabase
3. Supabase returns session tokens
4. Middleware checks auth on protected routes
5. Protected routes (e.g., `/dashboard`) require valid session
6. Callback route at `/auth/callback` handles OAuth redirects

## Component Patterns

**UI Components:**
- Located in [components/ui/](components/ui/)
- Reusable Button, Input, Alert components
- Styled with Tailwind CSS

**Auth Components:**
- Located in [components/auth/](components/auth/)
- LogoutButton handles sign-out flow

**Form Components:**
- LoginForm in [app/login/](app/login/)
- RegisterForm in [app/register/](app/register/)
- Client-side validation and error handling

## Environment Variables

See [.env.local](.env.local) for configuration:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key (client-side)

## Coding Conventions

- TypeScript strict mode enabled
- Component files use PascalCase (e.g., `LoginForm.tsx`)
- Use `'use client'` directive for client components
- Server components by default (App Router)
- Async server components for data fetching
- Loading states with `loading.tsx` files

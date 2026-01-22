# Find Hypnotherapy - Project Documentation

## Project Overview

This is a Next.js web application for finding hypnotherapy services, built with Supabase authentication.

**Tech Stack:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)

**Monorepo Structure:**
- Root package.json manages workspace commands
- `webapp/` contains the main Next.js application

## Project Structure

```
findhypnotherapy/
├── webapp/              # Main Next.js application
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── lib/            # Utility functions and configs
│   └── middleware.ts   # Route protection middleware
├── .env                # Environment variables (Supabase config)
├── .mcp.json           # MCP configuration
└── package.json        # Monorepo workspace config
```

## Getting Started

**Installation:**
```bash
npm install
```

**Development:**
```bash
npm run dev    # Starts webapp on http://localhost:3000
```

**Build:**
```bash
npm run build  # Builds production bundle
npm run start  # Starts production server
```

## Environment Variables

Required variables in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_URL` - Server-side Supabase URL
- `SUPABASE_PUBLISHABLE_KEY` - Server-side publishable key

## Key Features

- User authentication (login/register)
- Protected dashboard routes
- Supabase integration for auth and database
- Middleware-based route protection
- Responsive UI with Tailwind CSS

## Development Notes

- Using Next.js 15 App Router architecture
- Supabase SSR package for server-side auth
- Protected routes configured in [middleware.ts](webapp/middleware.ts)
- Auth callback handler at [webapp/app/auth/callback/route.ts](webapp/app/auth/callback/route.ts)

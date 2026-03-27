# AI Context — Diamond Manager

## Overview
- **Purpose**: Web app for managing diamond business transactions, tracking money owed/receivable, and diamond stock across contacts
- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Auth + Database)
- **Status**: In Development
- **Version**: 1.0.0
- **Last Updated**: 2026-03-27

## File Structure
```
Diamond_Manager/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with AuthProvider + Toaster
│   │   ├── page.tsx             # Dashboard page (home)
│   │   ├── globals.css          # Complete design system
│   │   ├── login/page.tsx       # Google OAuth login page
│   │   ├── auth/callback/
│   │   │   └── route.ts         # OAuth callback handler
│   │   ├── transactions/
│   │   │   └── page.tsx         # Money & Diamond transactions page
│   │   └── settings/
│   │       └── page.tsx         # Diamond types management
│   ├── components/
│   │   ├── AppShell.tsx         # Auth guard + Sidebar wrapper
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── context/
│   │   └── AuthContext.tsx      # Auth context with Google OAuth
│   └── lib/
│       ├── supabase.ts          # Supabase client singleton
│       ├── supabase-browser.ts  # Browser Supabase client
│       └── types.ts             # TypeScript interfaces
├── supabase/
│   └── setup.sql                # Database migration SQL
├── .env.local                   # Environment variables
└── package.json
```

## Key Components
| Component | File | Purpose |
|-----------|------|---------|
| Dashboard | src/app/page.tsx | Overview with stats, charts, people grid |
| Transactions | src/app/transactions/page.tsx | Money & diamond transaction CRUD |
| Settings | src/app/settings/page.tsx | Diamond type management |
| Sidebar | src/components/Sidebar.tsx | Navigation with user info |
| AppShell | src/components/AppShell.tsx | Auth guard wrapper |
| AuthContext | src/context/AuthContext.tsx | Google OAuth via Supabase |

## Database Tables (Supabase)
| Table | Purpose |
|-------|---------|
| people | Contacts / business parties |
| diamond_types | Configurable diamond categories |
| money_transactions | Money owed/receivable records |
| diamond_transactions | Diamond stock movement records |

## Environment Variables
| Variable | Description | Required? |
|----------|-------------|-----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | Yes |

## Known Issues
- None yet

## Next Steps
- [ ] Run supabase/setup.sql in Supabase SQL Editor
- [ ] Enable Google OAuth in Supabase Dashboard
- [ ] Add export to CSV/PDF functionality
- [ ] Add pagination for large datasets

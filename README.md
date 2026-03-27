# Enish Ops Hub

Internal Progressive Web App scaffold for Enish Restaurant & Lounge Houston. Built with Next.js 15 App Router, Tailwind CSS, Supabase, next-pwa, jsPDF, html2canvas, and Framer Motion.

## What is included

- Cinematic landing page with canvas fire particles and double-door transition
- Role-aware login:
  - Magic link for `owner`, `gm`, `manager`
  - 4-digit PIN flow for `captain`, `bartender`, `host`, `kitchen`, `dishwasher`
- Dashboard, Checklists, Permits, Inventory, Audits, Certifications, Assistant, Admin, and POS routes
- Supabase SQL migration with:
  - full schema
  - RLS helpers and policies
  - storage buckets
  - seeded Houston location
  - seeded owner account for Liffort Hobley with PIN `2445`
  - exact inventory DDL including generated `variance`
- Supabase Edge Functions:
  - `gemini` for chat and vision
  - `pos-sync` for Toast primary / Square fallback
- PWA manifest, Workbox runtime caching, offline page, and checklist queue flush stub

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Required env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `TOAST_API_KEY`
- `TOAST_RESTAURANT_GUID`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `POS_SYSTEM`

## Supabase setup

1. Run the migration in [`supabase/migrations/20260327180000_enish_ops_hub.sql`](/C:/Users/Wayne/Documents/New%20project/supabase/migrations/20260327180000_enish_ops_hub.sql)
2. Deploy edge functions:

```bash
supabase functions deploy gemini
supabase functions deploy pos-sync
```

3. Set function secrets:

```bash
supabase secrets set GEMINI_API_KEY=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set TOAST_API_KEY=...
supabase secrets set TOAST_RESTAURANT_GUID=...
supabase secrets set SQUARE_ACCESS_TOKEN=...
supabase secrets set SQUARE_LOCATION_ID=...
supabase secrets set POS_SYSTEM=toast
```

4. Create Supabase Auth users for manager emails, then insert matching rows into `public.users`.

## Seeded local preview logins

- Owner PIN preview: `Liffort Hobley` + `2445`
- Staff PIN preview: `Samuel Reed` + `2445`
- Manager preview: any email in the magic-link form when Supabase env vars are not configured

## POS notes

- `pos-sync` currently writes sync logs and daily metrics, and includes a velocity update path for `inventory_items.expected_quantity`
- Toast is treated as the primary system when `POS_SYSTEM=toast`
- Square is the fallback when `POS_SYSTEM=square`
- The adapter returns preview metrics if provider credentials are missing, so the dashboard can still render during setup

## PWA notes

- `next-pwa` is configured to cache checklist and inventory shell routes
- Offline completions are queued in local storage and flushed to `/api/pwa/flush` on reconnect
- For production push notifications, add a cron-triggered notification function and Web Push key pair in Supabase

## Known scaffold assumptions

- The landing page uses a branded placeholder interior illustration at [`public/images/enish-interior.svg`](/C:/Users/Wayne/Documents/New%20project/public/images/enish-interior.svg). Replace it with a licensed Enish interior photo for production.
- Manager magic-link auth is fully wired for Supabase, but local preview mode creates a mock manager session if env vars are missing.
- Staff PIN auth is implemented via server routes and secure cookies for local scaffolding; in production you should align any PIN-based operational flows with your final Supabase auth/RLS strategy.

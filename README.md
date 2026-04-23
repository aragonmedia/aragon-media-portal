# Aragon Media Portal

Full-stack creator management platform for Aragon Media. Handles TikTok account verification orders, creator ↔ admin chat, contract signing, GMV tracking, and withdrawal payouts — all in one place.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Hosting:** Vercel (free tier)
- **Database:** Self-hosted Supabase (Postgres + Storage + Realtime) on Oracle Cloud Always Free VM
- **ORM:** Drizzle
- **File storage:** Cloudflare R2
- **Email:** Resend
- **Payments:** Square API
- **Creator analytics:** TikTok for Developers API (OAuth)
- **Auth:** Custom email-code (15-min one-time codes, signed JWT session cookies)

**Monthly infrastructure cost: $0**

## Status

Foundation phase. See project root for the full data model spec and contract:
- `data-model-spec.md` — complete data model (v0.3, locked)
- `contract-v1.0.md` — Operations Agreement (revised for incremental pricing)

## Folder structure

```
src/
  app/              Next.js App Router pages and API routes
  components/       Reusable UI components
  db/               Drizzle schema and migration files
  lib/
    auth/           Custom email-code auth (session handling, JWT signing)
    crypto/         AES-256-GCM helpers for credential encryption
    email/          Resend wrapper for transactional email
    r2/             Cloudflare R2 upload / signed URL helpers
    square/         Square API client + webhook handlers
    tiktok/         TikTok OAuth + GMV fetching
```

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Pushes to `main` auto-deploy to Vercel. Environment variables are managed in the Vercel dashboard under Project Settings > Environment Variables.

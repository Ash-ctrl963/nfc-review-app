# NFC + QR Customer Review App (CSE Major Project)

A single-business prototype: customers tap an NFC tag or scan a QR code near
the billing counter, rate their experience 1–5 stars, and — for 4–5 star
ratings only — get AI-assisted help drafting a genuine Google review based on
their own words, then get redirected to leave it publicly.

Ratings of 1–3 stars end with a private thank-you message; nothing is stored.

## Status

 Under active development, built in stages. Currently: **Stage 1 — project
setup complete.**

## Tech Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Supabase (Postgres) for the single `events` table
- Google Gemini API for review draft generation (server-side only)
- Vitest for testing

## Project Structure

```
app/
  review/           the one public customer-facing route
  api/               server-side route handlers
  internal/stats/    simple internal testing/analytics view
components/          React UI components
lib/                 config, rating policy, validation, db, AI service
types/               shared TypeScript types
tests/               unit tests
```

See `lib/config.ts` for the single source of truth for all configuration,
and `lib/reviewPolicy.ts` for the isolated rating-routing logic.

## Local Setup

**Requirements:** Node.js 18.18+ (or 20+), npm.

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in real values
cp .env.example .env.local
# then edit .env.local — see "Environment Variables" below

# 3. Run the dev server
npm run dev
# visit http://localhost:3000/review
```

## Environment Variables

All variables are documented in `.env.example`. At minimum, for local dev
you need:

- `GOOGLE_REVIEW_URL` — required at all times (app throws a clear startup
  error if missing).
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — required at all times as
  of Stage 5 (see "Database setup" below).
- `GEMINI_API_KEY` — required at all times as of Stage 6. Get a free key from
  [Google AI Studio](https://aistudio.google.com/apikey). `GEMINI_MODEL`
  is optional and defaults to `gemini-flash-latest` (an alias Google keeps
  pointed at a current, non-deprecated Flash model).

## Database Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project dashboard, go to **SQL Editor -> New query**, paste the
   contents of `supabase/schema.sql`, and run it. This creates the single
   `events` table (no other tables — see Section 9 of the project spec).
3. Go to **Project Settings -> API** and copy:
   - **Project URL** -> `SUPABASE_URL` (if you already have this saved as
     `NEXT_PUBLIC_SUPABASE_URL` from Supabase's own quickstart, that name
     works too - no need to duplicate it)
   - **service_role key** (not the `anon`/publishable key — this app uses
     the service-role key server-side only, and Row Level Security is
     enabled with no policies, so the anon/publishable key would have
     zero access anyway) -> `SUPABASE_SERVICE_ROLE_KEY`
4. Paste both into `.env.local`.

Never commit `.env.local` — it's already in `.gitignore`.

## Running Tests

```bash
npm run test
```

Stage 1 includes one test file (`tests/reviewPolicy.test.ts`) covering the
rating-routing module. More are added per-stage per the project's testing
plan (Section 15 of the spec).

## Stages

1.  Project setup and architecture
2.  Mobile review interface
3.  Rating logic
4.  Backend/API
5.  Database
6.  AI review generation
7. Validation/security/error handling
8. Event tracking/testing view
9. Deployment prep

## Deployment / NFC / QR

Instructions for deployment, NFC tag programming, and QR code generation
are added in Stage 9, once the app is feature-complete.

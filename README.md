# NFC + QR Customer Review App 

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

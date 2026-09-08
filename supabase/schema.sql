-- Run this once in the Supabase SQL Editor for your project
-- (Project -> SQL Editor -> New query -> paste -> Run).
--
-- Single-table design, per the project spec: no business/tenant tables,
-- no accounts, no user PII. Each customer interaction writes one or more
-- append-only rows here.

-- Supabase enables this by default, but requesting it explicitly means
-- this script works even on a project where it isn't.
create extension if not exists pgcrypto;

create table if not exists events (
  id             uuid primary key default gen_random_uuid(),
  event_type     text not null,
  -- Nullable: 'page_opened' fires before any rating exists.
  rating         smallint check (rating is null or rating between 1 and 5),
  ai_used        boolean not null default false,
  google_clicked boolean not null default false,
  -- Only ever populated for 4-5 star flows, on 'review_selected'/'google_clicked'.
  -- 1-3 star feedback text is never stored anywhere, by design.
  review_text    text,
  created_at     timestamptz not null default now(),

  constraint chk_event_type check (
    event_type in (
      'page_opened',
      'rating_selected',
      'ai_requested',
      'ai_success',
      'ai_failure',
      'review_selected',
      'google_clicked'
    )
  )
);

create index if not exists idx_events_created_at on events (created_at);
create index if not exists idx_events_event_type on events (event_type);

-- Row Level Security is enabled with no policies, so only the service-role
-- key (used exclusively server-side in lib/db.ts) can read or write. The
-- anon/public key, if you ever add one, would get zero access by default.
alter table events enable row level security;

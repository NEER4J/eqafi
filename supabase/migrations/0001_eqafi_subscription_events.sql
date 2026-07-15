-- Subscription activity log.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table public.eqafi_subscription_events (
  id bigint generated always as identity primary key,
  event_id text unique,               -- Chargebee webhook event id (null for app-side logs); unique for idempotent retries
  event_type text not null,           -- e.g. subscription_created, payment_succeeded, checkout_created
  source text not null default 'chargebee_webhook',  -- 'chargebee_webhook' or 'app'
  subscription_id text,
  customer_id text,
  customer_email text,
  plan_id text,
  status text,
  amount_cents bigint,
  currency text,
  occurred_at timestamptz,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index eqafi_subscription_events_subscription_id_idx on public.eqafi_subscription_events (subscription_id);
create index eqafi_subscription_events_customer_email_idx on public.eqafi_subscription_events (customer_email);
create index eqafi_subscription_events_event_type_idx on public.eqafi_subscription_events (event_type);

-- Only the service role key (used by the server) can touch this table.
alter table public.eqafi_subscription_events enable row level security;

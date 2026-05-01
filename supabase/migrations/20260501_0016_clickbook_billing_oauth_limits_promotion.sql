-- ClickBook — billing/subscription state, limits, OAuth-ready schema
-- Run after previous migrations.

begin;

create extension if not exists pgcrypto;

create table if not exists public.sloty_workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.sloty_workspaces(id) on delete cascade,
  plan_id text not null default 'start' check (plan_id in ('start', 'pro', 'studio', 'premium')),
  status text not null default 'free' check (status in ('free', 'trialing', 'active', 'past_due', 'cancelled', 'expired')),
  billing_period text not null default 'monthly' check (billing_period in ('monthly', 'yearly')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id)
);

create table if not exists public.sloty_subscription_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.sloty_workspaces(id) on delete set null,
  subscription_id uuid references public.sloty_workspace_subscriptions(id) on delete set null,
  provider text,
  provider_event_id text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_event_id)
);

create table if not exists public.sloty_marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.sloty_workspaces(id) on delete cascade,
  title text not null,
  channel text not null default 'link' check (channel in ('link', 'telegram', 'vk', 'instagram', 'qr', 'referral')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'finished')),
  goal text,
  public_url text,
  clicks integer not null default 0,
  leads integer not null default 0,
  bookings integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sloty_workspace_subscriptions_workspace_idx
  on public.sloty_workspace_subscriptions (workspace_id);

create index if not exists sloty_marketing_campaigns_workspace_idx
  on public.sloty_marketing_campaigns (workspace_id, created_at desc);

create or replace function public.sloty_touch_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_touch_sloty_workspace_subscriptions_updated_at on public.sloty_workspace_subscriptions;
create trigger trg_touch_sloty_workspace_subscriptions_updated_at
before update on public.sloty_workspace_subscriptions
for each row execute function public.sloty_touch_subscription_updated_at();

drop trigger if exists trg_touch_sloty_marketing_campaigns_updated_at on public.sloty_marketing_campaigns;
create trigger trg_touch_sloty_marketing_campaigns_updated_at
before update on public.sloty_marketing_campaigns
for each row execute function public.sloty_touch_subscription_updated_at();

alter table public.sloty_workspace_subscriptions enable row level security;
alter table public.sloty_subscription_events enable row level security;
alter table public.sloty_marketing_campaigns enable row level security;

drop policy if exists "service role manages workspace subscriptions" on public.sloty_workspace_subscriptions;
create policy "service role manages workspace subscriptions" on public.sloty_workspace_subscriptions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "workspace members read subscriptions" on public.sloty_workspace_subscriptions;
create policy "workspace members read subscriptions" on public.sloty_workspace_subscriptions
for select using (public.sloty_can_access_workspace(workspace_id));

drop policy if exists "service role manages subscription events" on public.sloty_subscription_events;
create policy "service role manages subscription events" on public.sloty_subscription_events
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role manages marketing campaigns" on public.sloty_marketing_campaigns;
create policy "service role manages marketing campaigns" on public.sloty_marketing_campaigns
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "workspace members read marketing campaigns" on public.sloty_marketing_campaigns;
create policy "workspace members read marketing campaigns" on public.sloty_marketing_campaigns
for select using (public.sloty_can_access_workspace(workspace_id));

drop policy if exists "workspace managers manage marketing campaigns" on public.sloty_marketing_campaigns;
create policy "workspace managers manage marketing campaigns" on public.sloty_marketing_campaigns
for all using (public.sloty_can_manage_workspace(workspace_id)) with check (public.sloty_can_manage_workspace(workspace_id));

-- The app uses no_show in analytics and Telegram visit confirmation.
alter table public.sloty_bookings drop constraint if exists sloty_bookings_status_check;
alter table public.sloty_bookings add constraint sloty_bookings_status_check
  check (status in ('new', 'confirmed', 'completed', 'no_show', 'cancelled'));

-- Default every existing workspace to the free Start plan unless payment/webhook data says otherwise.
insert into public.sloty_workspace_subscriptions (workspace_id, plan_id, status, billing_period)
select id, 'start', 'free', 'monthly'
from public.sloty_workspaces
where deleted_at is null
on conflict (workspace_id) do nothing;

grant select on public.sloty_workspace_subscriptions to authenticated;
grant all on public.sloty_workspace_subscriptions to service_role;
grant all on public.sloty_subscription_events to service_role;
grant select, insert, update, delete on public.sloty_marketing_campaigns to authenticated;
grant all on public.sloty_marketing_campaigns to service_role;

commit;

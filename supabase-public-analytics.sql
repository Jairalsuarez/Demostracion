create table if not exists public.public_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_visit', 'whatsapp_click')),
  page_path text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.public_analytics_events enable row level security;

drop policy if exists "public_analytics_insert_public" on public.public_analytics_events;
create policy "public_analytics_insert_public"
on public.public_analytics_events for insert
to public
with check (event_type in ('page_visit', 'whatsapp_click'));

drop policy if exists "public_analytics_select_staff" on public.public_analytics_events;
create policy "public_analytics_select_staff"
on public.public_analytics_events for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('superadmin', 'admin', 'vendedor')
  )
);

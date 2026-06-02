create extension if not exists pgcrypto;

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.expense_categories enable row level security;

drop policy if exists "expense_categories_select_authenticated" on public.expense_categories;
create policy "expense_categories_select_authenticated"
on public.expense_categories
for select
to authenticated
using (true);

drop policy if exists "expense_categories_insert_authenticated" on public.expense_categories;
create policy "expense_categories_insert_authenticated"
on public.expense_categories
for insert
to authenticated
with check (
  created_by = auth.uid()
);

create table if not exists public.distributors (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  telefono text,
  notas text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.distributors enable row level security;

drop policy if exists "distributors_select_staff" on public.distributors;
create policy "distributors_select_staff"
on public.distributors for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('superadmin', 'admin', 'vendedor')
  )
);

drop policy if exists "distributors_insert_staff" on public.distributors;
create policy "distributors_insert_staff"
on public.distributors for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('superadmin', 'admin', 'vendedor')
  )
);

alter table public.expenses add column if not exists detalle_oferta text;
alter table public.expenses add column if not exists distributor_id uuid references public.distributors(id);
alter table public.expenses add column if not exists distributor_name text;
alter table public.expenses add column if not exists evidence_url text;
alter table public.expenses add column if not exists evidence_name text;
alter table public.expenses add column if not exists cantidad integer not null default 1;
alter table public.expenses add column if not exists unit_cost numeric(10,2) not null default 0;
alter table public.expenses add column if not exists confirmation_accepted boolean not null default false;

drop policy if exists "expenses_select_staff" on public.expenses;
create policy "expenses_select_staff"
on public.expenses for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('superadmin', 'admin', 'vendedor')
  )
);

drop policy if exists "expenses_insert_staff" on public.expenses;
create policy "expenses_insert_staff"
on public.expenses for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('superadmin', 'admin', 'vendedor')
  )
);

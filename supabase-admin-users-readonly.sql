-- Elimina el rol superadmin y deja la gestion de usuarios en Supabase.
-- El panel solo consulta los perfiles existentes.

update public.profiles
set
  role = 'admin',
  updated_at = now()
where role = 'superadmin';

do $$
declare
  role_constraint_name text;
begin
  select conname
  into role_constraint_name
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%role%'
    and pg_get_constraintdef(oid) ilike '%superadmin%'
  limit 1;

  if role_constraint_name is not null then
    execute format('alter table public.profiles drop constraint %I', role_constraint_name);
  end if;
end $$;

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('admin', 'vendedor'));

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'vendedor')
  );
$$;

drop policy if exists "profiles_update_admin" on public.profiles;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role in ('admin', 'vendedor')
);

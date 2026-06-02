create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  apellido text,
  telefono text,
  role text not null check (role in ('admin', 'vendedor')),
  avatar_url text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists apellido text;
alter table public.profiles add column if not exists telefono text;
alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null default 'General',
  marca text,
  descripcion text,
  precio numeric(10,2) not null default 0,
  stock integer not null default 0,
  stock_local integer not null default 0,
  stock_deposito integer not null default 0,
  imagen_url text,
  activo boolean not null default true,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists marca text;
alter table public.products add column if not exists stock_local integer not null default 0;
alter table public.products add column if not exists stock_deposito integer not null default 0;
update public.products
set stock_local = stock,
    stock_deposito = 0
where stock <> 0
  and coalesce(stock_local, 0) = 0
  and coalesce(stock_deposito, 0) = 0;

create table if not exists public.distributors (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  telefono text,
  notas text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_movements (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ajuste', 'venta', 'egreso', 'mercaderia', 'retiro_caja')),
  monto numeric(10,2) not null,
  descripcion text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

do $$
declare
  v_constraint_name text;
begin
  select conname
  into v_constraint_name
  from pg_constraint
  where conrelid = 'public.wallet_movements'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%tipo%'
  limit 1;

  if v_constraint_name is not null then
    execute format('alter table public.wallet_movements drop constraint %I', v_constraint_name);
  end if;
end $$;

alter table public.wallet_movements
add constraint wallet_movements_tipo_check
check (tipo in ('ajuste', 'venta', 'egreso', 'mercaderia', 'retiro_caja'));

create table if not exists public.wallet_state (
  id text primary key default 'principal',
  saldo_actual numeric(10,2) not null default 0,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.cash_state (
  id text primary key default 'principal',
  saldo_actual numeric(10,2) not null default 0,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  user_name text,
  saldo_inicial numeric(10,2) not null default 0,
  saldo_final numeric(10,2),
  total_ventas numeric(10,2) not null default 0,
  estado text not null default 'abierto' check (estado in ('abierto', 'cerrado')),
  started_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references public.shifts(id),
  user_id uuid not null references public.profiles(id),
  total numeric(10,2) not null default 0,
  descripcion text,
  informal boolean not null default false,
  payment_method text not null default 'efectivo',
  payment_evidence_url text,
  payment_evidence_name text,
  created_at timestamptz not null default now()
);

alter table public.sales add column if not exists descripcion text;
alter table public.sales add column if not exists informal boolean not null default false;
alter table public.sales add column if not exists payment_method text not null default 'efectivo';
alter table public.sales add column if not exists payment_evidence_url text;
alter table public.sales add column if not exists payment_evidence_name text;

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  nombre text not null,
  precio numeric(10,2) not null,
  cantidad integer not null,
  subtotal numeric(10,2) not null
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  descripcion text not null,
  detalle_oferta text,
  distributor_id uuid references public.distributors(id),
  distributor_name text,
  evidence_url text,
  evidence_name text,
  cantidad integer not null default 1,
  unit_cost numeric(10,2) not null default 0,
  confirmation_accepted boolean not null default false,
  monto numeric(10,2) not null,
  user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists detalle_oferta text;
alter table public.expenses add column if not exists distributor_id uuid references public.distributors(id);
alter table public.expenses add column if not exists distributor_name text;
alter table public.expenses add column if not exists evidence_url text;
alter table public.expenses add column if not exists evidence_name text;
alter table public.expenses add column if not exists cantidad integer not null default 1;
alter table public.expenses add column if not exists unit_cost numeric(10,2) not null default 0;
alter table public.expenses add column if not exists confirmation_accepted boolean not null default false;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'inventario',
  mensaje text not null,
  actor_id uuid references public.profiles(id),
  actor_name text,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  inicio text not null,
  fin text not null,
  responsable text not null,
  turno text not null default 'Mañana',
  notas text,
  estado text not null default 'programado' check (estado in ('programado', 'en_progreso', 'completado', 'cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_feedback (
  id uuid primary key default gen_random_uuid(),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.public_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_visit', 'whatsapp_click')),
  page_path text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.wallet_movements enable row level security;
alter table public.wallet_state enable row level security;
alter table public.cash_state enable row level security;
alter table public.shifts enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.distributors enable row level security;
alter table public.expenses enable row level security;
alter table public.notifications enable row level security;
alter table public.schedules enable row level security;
alter table public.community_feedback enable row level security;
alter table public.public_analytics_events enable row level security;

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

create or replace function public.create_sale_with_items(
  p_shift_id uuid,
  p_user_id uuid,
  p_total numeric,
  p_payment_method text,
  p_payment_evidence_url text,
  p_payment_evidence_name text,
  p_created_at timestamptz,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_available_stock integer;
  v_next_wallet numeric;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para registrar ventas.';
  end if;

  if not public.is_staff() then
    raise exception 'No tienes permisos para registrar ventas.';
  end if;

  if p_user_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'Solo puedes registrar ventas con tu propio usuario.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La venta debe incluir al menos un producto.';
  end if;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    v_product_id := nullif(v_item->>'product_id', '')::uuid;
    v_quantity := greatest(coalesce((v_item->>'cantidad')::integer, 0), 0);

    if v_product_id is null or v_quantity <= 0 then
      raise exception 'Cada item debe incluir un producto y una cantidad valida.';
    end if;

    select stock_local
    into v_available_stock
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Uno de los productos ya no existe.';
    end if;

    if coalesce(v_available_stock, 0) < v_quantity then
      raise exception 'Stock insuficiente para uno de los productos.';
    end if;
  end loop;

  insert into public.sales (shift_id, user_id, total, payment_method, payment_evidence_url, payment_evidence_name, created_at)
  values (
    p_shift_id,
    p_user_id,
    coalesce(p_total, 0),
    coalesce(nullif(trim(p_payment_method), ''), 'efectivo'),
    nullif(trim(coalesce(p_payment_evidence_url, '')), ''),
    nullif(trim(coalesce(p_payment_evidence_name, '')), ''),
    coalesce(p_created_at, now())
  )
  returning id into v_sale_id;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'cantidad')::integer;

    insert into public.sale_items (sale_id, product_id, nombre, precio, cantidad, subtotal)
    values (
      v_sale_id,
      v_product_id,
      coalesce(v_item->>'nombre', ''),
      coalesce((v_item->>'precio')::numeric, 0),
      v_quantity,
      coalesce((v_item->>'subtotal')::numeric, 0)
    );

    update public.products
    set stock_local = greatest(stock_local - v_quantity, 0),
        stock = greatest(stock_local - v_quantity, 0) + coalesce(stock_deposito, 0),
        updated_at = now(),
        updated_by = auth.uid()
    where id = v_product_id;
  end loop;

  if coalesce(nullif(trim(p_payment_method), ''), 'efectivo') = 'efectivo' then
    select coalesce(saldo_actual, 0) + coalesce(p_total, 0)
    into v_next_wallet
    from public.cash_state
    where id = 'principal'
    for update;

    if v_next_wallet is null then
      v_next_wallet := coalesce(p_total, 0);
      insert into public.cash_state (id, saldo_actual, updated_at, updated_by)
      values ('principal', v_next_wallet, now(), auth.uid())
      on conflict (id) do update
      set saldo_actual = excluded.saldo_actual,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by;
    else
      update public.cash_state
      set saldo_actual = v_next_wallet,
          updated_at = now(),
          updated_by = auth.uid()
      where id = 'principal';
    end if;
  else
    select coalesce(saldo_actual, 0) + coalesce(p_total, 0)
    into v_next_wallet
    from public.wallet_state
    where id = 'principal'
    for update;

    if v_next_wallet is null then
      v_next_wallet := coalesce(p_total, 0);
      insert into public.wallet_state (id, saldo_actual, updated_at, updated_by)
      values ('principal', v_next_wallet, now(), auth.uid())
      on conflict (id) do update
      set saldo_actual = excluded.saldo_actual,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by;
    else
      update public.wallet_state
      set saldo_actual = v_next_wallet,
          updated_at = now(),
          updated_by = auth.uid()
      where id = 'principal';
    end if;
  end if;

  insert into public.wallet_movements (tipo, monto, descripcion, created_by)
  values ('venta', coalesce(p_total, 0), 'Venta ' || v_sale_id || ' - ' || coalesce(nullif(trim(p_payment_method), ''), 'efectivo'), auth.uid());

  if p_shift_id is not null then
    update public.shifts
    set total_ventas = coalesce(total_ventas, 0) + coalesce(p_total, 0)
    where id = p_shift_id;
  end if;

  return v_sale_id;
end;
$$;

drop function if exists public.create_sale_with_items(text, uuid, numeric, text, text, text, timestamptz, jsonb);
revoke all on function public.create_sale_with_items(uuid, uuid, numeric, text, text, text, timestamptz, jsonb) from public;
grant execute on function public.create_sale_with_items(uuid, uuid, numeric, text, text, text, timestamptz, jsonb) to authenticated;

drop function if exists public.create_informal_sale(bigint, uuid, numeric, text, text, text, text, timestamptz);
drop function if exists public.create_informal_sale(text, uuid, numeric, text, text, text, text, timestamptz);
drop function if exists public.create_informal_sale(uuid, uuid, numeric, text, text, text, text, timestamptz);
create or replace function public.create_informal_sale(
  p_shift_id uuid,
  p_user_id uuid,
  p_total numeric,
  p_description text,
  p_payment_method text,
  p_payment_evidence_url text,
  p_payment_evidence_name text,
  p_created_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_next_wallet numeric;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para registrar ventas.';
  end if;

  if not public.is_staff() then
    raise exception 'No tienes permisos para registrar ventas.';
  end if;

  if p_user_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'Solo puedes registrar ventas con tu propio usuario.';
  end if;

  if coalesce(p_total, 0) <= 0 then
    raise exception 'La venta informal debe tener un total mayor a cero.';
  end if;

  if nullif(trim(coalesce(p_description, '')), '') is null then
    raise exception 'La descripcion es obligatoria para la venta informal.';
  end if;

  insert into public.sales (
    shift_id,
    user_id,
    total,
    descripcion,
    informal,
    payment_method,
    payment_evidence_url,
    payment_evidence_name,
    created_at
  )
  values (
    p_shift_id,
    p_user_id,
    coalesce(p_total, 0),
    trim(coalesce(p_description, '')),
    true,
    coalesce(nullif(trim(p_payment_method), ''), 'efectivo'),
    nullif(trim(coalesce(p_payment_evidence_url, '')), ''),
    nullif(trim(coalesce(p_payment_evidence_name, '')), ''),
    coalesce(p_created_at, now())
  )
  returning id into v_sale_id;

  if coalesce(nullif(trim(p_payment_method), ''), 'efectivo') = 'efectivo' then
    select coalesce(saldo_actual, 0) + coalesce(p_total, 0)
    into v_next_wallet
    from public.cash_state
    where id = 'principal'
    for update;

    if v_next_wallet is null then
      v_next_wallet := coalesce(p_total, 0);
      insert into public.cash_state (id, saldo_actual, updated_at, updated_by)
      values ('principal', v_next_wallet, now(), auth.uid())
      on conflict (id) do update
      set saldo_actual = excluded.saldo_actual,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by;
    else
      update public.cash_state
      set saldo_actual = v_next_wallet,
          updated_at = now(),
          updated_by = auth.uid()
      where id = 'principal';
    end if;
  else
    select coalesce(saldo_actual, 0) + coalesce(p_total, 0)
    into v_next_wallet
    from public.wallet_state
    where id = 'principal'
    for update;

    if v_next_wallet is null then
      v_next_wallet := coalesce(p_total, 0);
      insert into public.wallet_state (id, saldo_actual, updated_at, updated_by)
      values ('principal', v_next_wallet, now(), auth.uid())
      on conflict (id) do update
      set saldo_actual = excluded.saldo_actual,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by;
    else
      update public.wallet_state
      set saldo_actual = v_next_wallet,
          updated_at = now(),
          updated_by = auth.uid()
      where id = 'principal';
    end if;
  end if;

  insert into public.wallet_movements (tipo, monto, descripcion, created_by)
  values ('venta', coalesce(p_total, 0), 'Venta informal: ' || trim(coalesce(p_description, '')), auth.uid());

  if p_shift_id is not null then
    update public.shifts
    set total_ventas = coalesce(total_ventas, 0) + coalesce(p_total, 0)
    where id = p_shift_id;
  end if;

  return v_sale_id;
end;
$$;

revoke all on function public.create_informal_sale(uuid, uuid, numeric, text, text, text, text, timestamptz) from public;
grant execute on function public.create_informal_sale(uuid, uuid, numeric, text, text, text, text, timestamptz) to authenticated;

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

drop policy if exists "profiles_update_admin" on public.profiles;

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (
  auth.uid() = id
  and role in ('admin', 'vendedor')
);

drop policy if exists "products_select_public_active" on public.products;
create policy "products_select_public_active"
on public.products for select
to public
using (activo = true);

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products for select
to authenticated
using (true);

drop policy if exists "products_write_admin" on public.products;
drop policy if exists "products_update_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;
drop policy if exists "products_insert_staff" on public.products;
create policy "products_insert_staff"
on public.products for insert
to authenticated
with check (public.is_staff());

create policy "products_update_admin"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_delete_admin"
on public.products for delete
to authenticated
using (public.is_admin());

drop policy if exists "shifts_select_authenticated" on public.shifts;
create policy "shifts_select_authenticated"
on public.shifts for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "shifts_insert_self" on public.shifts;
create policy "shifts_insert_self"
on public.shifts for insert
to authenticated
with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "shifts_update_self" on public.shifts;
create policy "shifts_update_self"
on public.shifts for update
to authenticated
using (public.is_admin() or auth.uid() = user_id)
with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "sales_select_authenticated" on public.sales;
create policy "sales_select_authenticated"
on public.sales for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "sales_insert_self" on public.sales;
create policy "sales_insert_self"
on public.sales for insert
to authenticated
with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "sale_items_select_authenticated" on public.sale_items;
create policy "sale_items_select_authenticated"
on public.sale_items for select
to authenticated
using (
  exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and (public.is_admin() or sales.user_id = auth.uid())
  )
);

drop policy if exists "sale_items_insert_authenticated" on public.sale_items;
create policy "sale_items_insert_authenticated"
on public.sale_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and (public.is_admin() or sales.user_id = auth.uid())
  )
);

drop policy if exists "expenses_superadmin_all" on public.expenses;
drop policy if exists "expenses_select_staff" on public.expenses;
create policy "expenses_select_staff"
on public.expenses for select
to authenticated
using (public.is_staff());

drop policy if exists "expenses_insert_staff" on public.expenses;
create policy "expenses_insert_staff"
on public.expenses for insert
to authenticated
with check (public.is_staff() and auth.uid() = user_id);

drop policy if exists "distributors_select_staff" on public.distributors;
create policy "distributors_select_staff"
on public.distributors for select
to authenticated
using (public.is_staff());

drop policy if exists "distributors_insert_staff" on public.distributors;
create policy "distributors_insert_staff"
on public.distributors for insert
to authenticated
with check (public.is_staff());

drop policy if exists "wallet_movements_select_authenticated" on public.wallet_movements;
create policy "wallet_movements_select_authenticated"
on public.wallet_movements for select
to authenticated
using (public.is_admin());

drop policy if exists "wallet_movements_insert_staff" on public.wallet_movements;
create policy "wallet_movements_insert_staff"
on public.wallet_movements for insert
to authenticated
with check (
  (
    created_by = auth.uid()
    and tipo in ('venta', 'egreso', 'mercaderia')
    and public.is_staff()
  )
  or public.is_admin()
);

drop policy if exists "wallet_state_select_authenticated" on public.wallet_state;
create policy "wallet_state_select_authenticated"
on public.wallet_state for select
to authenticated
using (public.is_staff());

drop policy if exists "wallet_state_superadmin_all" on public.wallet_state;
drop policy if exists "wallet_state_staff_all" on public.wallet_state;
create policy "wallet_state_staff_all"
on public.wallet_state for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "cash_state_select_authenticated" on public.cash_state;
create policy "cash_state_select_authenticated"
on public.cash_state for select
to authenticated
using (public.is_staff());

drop policy if exists "cash_state_staff_all" on public.cash_state;
create policy "cash_state_staff_all"
on public.cash_state for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "notifications_select_authenticated" on public.notifications;
create policy "notifications_select_authenticated"
on public.notifications for select
to authenticated
using (public.is_staff());

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
on public.notifications for insert
to authenticated
with check (public.is_admin());

drop policy if exists "schedules_select_authenticated" on public.schedules;
create policy "schedules_select_authenticated"
on public.schedules for select
to authenticated
using (public.is_staff());

drop policy if exists "schedules_superadmin_all" on public.schedules;
drop policy if exists "schedules_admin_all" on public.schedules;
create policy "schedules_admin_all"
on public.schedules for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "community_feedback_select_public" on public.community_feedback;
create policy "community_feedback_select_public"
on public.community_feedback for select
to public
using (true);

drop policy if exists "community_feedback_insert_public" on public.community_feedback;
create policy "community_feedback_insert_public"
on public.community_feedback for insert
to public
with check (length(trim(comment)) >= 3);

drop policy if exists "community_feedback_delete_admin" on public.community_feedback;
create policy "community_feedback_delete_admin"
on public.community_feedback for delete
to authenticated
using (public.is_admin());

drop policy if exists "public_analytics_insert_public" on public.public_analytics_events;
create policy "public_analytics_insert_public"
on public.public_analytics_events for insert
to public
with check (event_type in ('page_visit', 'whatsapp_click'));

drop policy if exists "public_analytics_select_staff" on public.public_analytics_events;
create policy "public_analytics_select_staff"
on public.public_analytics_events for select
to authenticated
using (public.is_staff());

insert into public.wallet_state (id, saldo_actual)
values ('principal', 0)
on conflict (id) do nothing;

insert into public.cash_state (id, saldo_actual)
values ('principal', 0)
on conflict (id) do nothing;

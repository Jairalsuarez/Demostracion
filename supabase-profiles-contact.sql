alter table public.profiles
  add column if not exists apellido text,
  add column if not exists telefono text;

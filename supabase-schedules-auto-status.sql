alter table public.schedules
drop constraint if exists schedules_estado_check;

alter table public.schedules
add constraint schedules_estado_check
check (estado in ('programado', 'en_progreso', 'completado', 'cancelado'));

-- Permite que administracion cree notificaciones al asignar turnos.

drop policy if exists "notifications_insert_admin" on public.notifications;

create policy "notifications_insert_admin"
on public.notifications for insert
to authenticated
with check (public.is_admin());

-- Autorise les participants à se retirer eux-mêmes d'un événement

drop policy if exists "Users can cancel their own participation." on public.event_participants;
drop policy if exists "Users can leave events." on public.event_participants;

create policy "Users can cancel their own participation."
on public.event_participants
for delete
to authenticated
using (auth.uid() = user_id);






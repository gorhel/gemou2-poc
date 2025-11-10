# 2025-11-08 – Migration de la participation événements vers RPC Supabase

## Résumé
- Remplacement des insert/delete manuels sur `event_participants` et `events.current_participants` par la RPC transactionnelle `update_event_participation`.
- Harmonisation des flux mobile (`apps/mobile/app/(tabs)/events/[id].tsx`) et web (`apps/web/hooks/useEventParticipation.ts`, `apps/web/components/events/EventsList.tsx`).
- Gestion des messages utilisateur (quota atteint, succès, annulation) centralisée sur le résultat de la RPC.

## Rappel dataflow
```
Utilisateur → action Rejoindre/Quitter
  → App mobile/web appelle supabase.rpc('update_event_participation', { p_event_id, p_join })
    → Fonction SQL (SECURITY DEFINER) :
        - verrouille la ligne `events`
        - vérifie la présence actuelle dans `event_participants`
        - applique insert/delete + maintien du compteur `current_participants`
        - contrôle quota et statut
    → Retourne succès ou message d’erreur (Quota atteint, utilisateur non authentifié, etc.)
  → L’app recharge `loadEvent()` / `fetchEventData()` pour synchroniser UI
```

## Implémentation SQL requise
> ✅ Mise à jour : la fonction ne touche plus à `events.current_participants`. Les triggers `update_event_participants_count` se chargent du recalcul, ce qui évite tout double incrément.

```sql
create or replace function public.update_event_participation(p_event_id uuid, p_join boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events%rowtype;
  v_is_participant boolean;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  select * into v_event
  from events
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Événement introuvable';
  end if;

  select exists (
    select 1
    from event_participants
    where event_id = p_event_id
      and user_id = auth.uid()
  ) into v_is_participant;

  if coalesce(p_join, false) then
    if v_is_participant then
      return;
    end if;

    if v_event.status <> 'active' then
      raise exception 'Événement inactif';
    end if;

    if v_event.current_participants >= v_event.max_participants then
      raise exception 'Quota atteint';
    end if;

    insert into event_participants (event_id, user_id, status)
    values (p_event_id, auth.uid(), 'registered');
  else
    if not v_is_participant then
      return;
    end if;

    delete from event_participants
    where event_id = p_event_id
      and user_id = auth.uid();
  end if;
end;
$$;
```

Après le `CREATE OR REPLACE`, exécuter `select sync_all_event_participants_count();` pour réaligner les compteurs existants.

> ⚠️ Pensez à conserver/adapter les politiques RLS : le client n’a plus besoin d’`UPDATE` direct, mais la fonction doit rester accessible (`grant execute on function public.update_event_participation to authenticated`).

## Modifications front
- **Mobile** (`events/[id].tsx`)
  - `handleParticipate` appelle désormais la RPC et gère les variants de modale selon réponse.
  - Mise à jour optimiste de `isParticipating` puis rafraîchissement via `loadEvent()`.
  - Vérification locale du quota pour éviter un aller-retour inutile lorsque l’état UI est déjà plein.

- **Web**
  - `useEventParticipation` : refactor `join/leave` → `mutateParticipation(true|false)` basé sur la RPC et les validations locales.
  - `EventsList.handleJoinEvent` : simplification → appel RPC unique + rafraîchissement.
  - Les composants (`EventParticipationButton`, `EventCard`, `EventDetailsModal`) restent inchangés mais bénéficient du flux unifié.

## Tests conseillés
1. **Rejoindre un événement** (mobile + web)
   - Cas nominal : compteur +1, état bouton "Quitter".
   - Cas quota plein : message "Quota atteint" et absence de mutation.
2. **Quitter un événement**
   - Cas nominal : compteur décrémenté, état bouton "Participer".
   - Cas double clic : la RPC est idempotente, vérifier aucune erreur UI.
3. **Concurrency**
   - Deux utilisateurs rejoignent simultanément le dernier slot → l’un reçoit "Quota atteint".
4. **Sécurité**
   - Vérifier qu’un utilisateur non authentifié reçoit bien "Utilisateur non authentifié".

## Arbre de composants (pages concernées)
```
apps/mobile/app/(tabs)/events/[id].tsx
  └─ PageLayout
      ├─ ConfirmationModal / SuccessModal / ConfirmModal
      └─ TouchableOpacity (Participer/Quitter)

apps/web/components/events/EventsList.tsx
  ├─ EventCard
  │   └─ EventParticipationButton
  │       └─ useEventParticipation
  └─ EventDetailsModal (appelle handleJoinEvent)
```

## Points d’attention
- Les messages erreurs proviennent directement de la fonction SQL : garder une formulation claire côté serveur.
- `loadEvent()` / `fetchEventData()` restent nécessaires tant qu’on n’émet pas d’événements temps réel.
- Prévoir des tests E2E lorsque la fonction RPC sera déployée (mobile/web).
- Ne pas supprimer les triggers `update_event_participants_count_*` : ils garantissent l’incrément/décrément exact (1 par entrée réelle) et empêchent tout dépassement du quota grâce au verrouillage `FOR UPDATE` dans la fonction.

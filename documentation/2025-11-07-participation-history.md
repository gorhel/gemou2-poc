# Historique des participations — 07/11/2025

## Résumé
- Conservation de l'historique des actions via la nouvelle table `event_participant_actions` et le champ `action_at` dans `event_participants`.
- Mise à jour des clients mobile et web pour basculer d'une suppression vers un changement de statut (`registered` ↔ `left`) avec journalisation systématique (`joined`/`left`).
- Interfaces mobile et web enrichies d'une timeline des participations pour suivre les entrées/sorties avec l'horodatage correspondant.

## Flux de données
1. **Join/Leave**
   - Le client tente de récupérer la ligne d'association `(event_id, user_id)`.
   - Selon l'état (`registered` ou `left`/absent), on effectue soit un `insert`, soit un `update`.
   - Dès que le statut change, on ajoute un log dans `event_participant_actions` (action `joined` ou `left`).
   - En cas d'échec ultérieur (mise à jour compteur, log, etc.), on restaure l'état précédent et on nettoie le log généré.
   - Le compteur `events.current_participants` est synchronisé en +1/-1.

2. **Lecture**
   - Les listes d'inscrits ne sélectionnent que les entrées `status = 'registered'` et sont triées par `action_at`.
   - Les timelines utilisent `event_participant_actions` (jointure sur `profiles`) triées par `action_at DESC`.

## Migrations
- `20251107090000_preserve_event_participation_history.sql`
  - Ajout du champ `action_at` (default `timezone('utc', now())`) dans `event_participants`.
  - Création de `event_participant_actions` avec indexes `(event_id, action_at)` et `(user_id, action_at)`.

## Implémentation côté client
### Mobile (`apps/mobile/app/(tabs)/events/[id].tsx` et `components/events/EventsList.tsx`)
- `handleParticipate` : bascule statut + insertion log + rollback en cas d'échec.
- L'état local reflète immédiatement l'action puis recharge les données pour cohérence.
- Une section "Historique des participations" a été ajoutée avec un fallback accessibilité/ARIA.

### Web (`apps/web/app/events/[id]/page.tsx` & hooks)
- `useEventParticipation` centralise désormais la logique de statut et de rollback.
- Les variantes `useEventParticipationRobust`/`Fixed` ré-exportent le hook principal (plus de duplication).
- La page principale charge l'historique et l'affiche dans un `Card` dédié.
- Les sélecteurs Supabase filtrent désormais `status = 'registered'`.

## Tests & validations
- Vérification lint sur fichiers modifiés (mobile & web) : aucun avertissement.
- Tests manuels à prévoir :
  - Rejoindre/quitter depuis mobile et web.
  - Vérifier la persistance des actions et la timeline.
  - Vérifier les quotas/max participants après multiples entrées/sorties.

## Risques & suivis
- Les pages alternatives (`page-with-participants.tsx`, `page-sync.tsx`) utilisent encore l’ancienne logique et doivent être refactorées ou supprimées si non utilisées.
- Prévoir une migration des données historiques si des suppressions passées doivent être reconstruites (non traité ici).
- Vérifier l’impact sur dashboards ou exports éventuels basés sur `event_participants`.
- Penser à mettre en place des tests d’intégration couvrant le nouveau flux (non ajoutés par cette PR).






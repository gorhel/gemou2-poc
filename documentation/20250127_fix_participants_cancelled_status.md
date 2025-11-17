# Correction : Filtrage des participants avec statut "cancelled"

**Date :** 27 janvier 2025  
**Module concerné :** Module Participants sur la page de détails d'événement (`events/[id]`)

## Problème identifié

Le module "Participants" affichait tous les participants d'un événement, y compris ceux avec le statut `'cancelled'`. Cela créait une incohérence dans l'affichage, car les participants ayant annulé leur participation ne devraient pas apparaître dans la liste des participants actifs.

## Solution implémentée

Ajout d'un filtre `.neq('status', 'cancelled')` sur toutes les requêtes qui récupèrent les participants d'un événement, afin d'exclure les participants avec le statut `'cancelled'`.

### Fichiers modifiés

#### 1. Application Mobile
**Fichier :** `apps/mobile/app/(tabs)/events/[id].tsx`

**Modifications :**
- **Ligne 92-99** : Ajout du filtre `.neq('status', 'cancelled')` dans la vérification de participation de l'utilisateur actuel
- **Ligne 103-115** : Ajout du filtre `.neq('status', 'cancelled')` dans le chargement de la liste des participants

```typescript
// Avant
const { data: participationData } = await supabase
  .from('event_participants')
  .select('*')
  .eq('event_id', id)
  .eq('user_id', user.id)
  .single();

// Après
const { data: participationData } = await supabase
  .from('event_participants')
  .select('*')
  .eq('event_id', id)
  .eq('user_id', user.id)
  .neq('status', 'cancelled')
  .single();
```

#### 2. Application Web
**Fichier :** `apps/web/app/events/[id]/page.tsx`

**Modifications :**
- **Ligne 220-227** : Ajout du filtre `.neq('status', 'cancelled')` dans la vérification de participation de l'utilisateur actuel
- **Ligne 73-86** : Ajout du filtre `.neq('status', 'cancelled')` dans le chargement de la liste des participants

## Structure de la table `event_participants`

La table `event_participants` contient les champs suivants :
- `id` : UUID (clé primaire)
- `event_id` : UUID (référence vers `events`)
- `user_id` : UUID (référence vers `profiles`)
- `status` : TEXT avec contrainte CHECK (`'registered'`, `'attended'`, `'cancelled'`)
- `joined_at` : TIMESTAMP

## Impact des modifications

### Comportement avant la correction
- Les participants avec le statut `'cancelled'` apparaissaient dans la liste des participants
- L'utilisateur pouvait voir son propre statut comme "participant" même s'il avait annulé

### Comportement après la correction
- Seuls les participants avec les statuts `'registered'` ou `'attended'` sont affichés
- Les participants avec le statut `'cancelled'` sont exclus de l'affichage
- La vérification de participation de l'utilisateur actuel exclut également les statuts `'cancelled'`

## Cohérence avec le reste de l'application

Cette correction est cohérente avec :
- Le hook `useEventParticipantsCount` qui filtre déjà les participants `'cancelled'` pour le comptage
- La logique métier qui considère qu'un participant `'cancelled'` n'est plus un participant actif

## Tests recommandés

1. **Test d'affichage des participants**
   - Créer un événement avec plusieurs participants
   - Annuler la participation d'un utilisateur (statut `'cancelled'`)
   - Vérifier que ce participant n'apparaît plus dans la liste

2. **Test de vérification de participation**
   - S'inscrire à un événement
   - Vérifier que le bouton affiche "Quitter le gémou"
   - Annuler sa participation
   - Vérifier que le bouton affiche "Participer" (et non "Quitter")

3. **Test de comptage**
   - Vérifier que le nombre de participants affiché correspond bien au nombre de participants actifs (sans les `'cancelled'`)

## Notes techniques

- Le filtre `.neq('status', 'cancelled')` est appliqué au niveau de la base de données, ce qui optimise les performances
- Les participants avec le statut `'cancelled'` restent dans la table pour des raisons d'historique et d'audit
- Cette modification n'affecte pas les autres fonctionnalités de l'application




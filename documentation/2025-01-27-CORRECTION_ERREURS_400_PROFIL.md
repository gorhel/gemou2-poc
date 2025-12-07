# Correction des erreurs 400 dans le profil

**Date:** 2025-01-27  
**Problème:** Erreurs 400 (Bad Request) lors du chargement des statistiques du profil

## Problèmes identifiés

1. **Erreur dans la requête friends** : Utilisation de `status` au lieu de `friendship_status`
2. **Requête incomplète** : Ne vérifiait que `user_id` alors que les amitiés sont bidirectionnelles
3. **Manque de gestion d'erreurs** : Les erreurs n'étaient pas gérées, causant des problèmes silencieux

## Corrections apportées

### 1. Correction de la colonne `status` → `friendship_status`

```typescript
// Avant (INCORRECT)
supabase.from('friends')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('status', 'accepted') // ❌ Colonne incorrecte

// Après (CORRECT)
supabase.from('friends')
  .select('id', { count: 'exact', head: true })
  .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
  .eq('friendship_status', 'accepted') // ✅ Colonne correcte
  .is('deleted_at', null) // ✅ Exclure les amitiés supprimées
```

### 2. Vérification bidirectionnelle des amitiés

Les amitiés dans la table `friends` peuvent être dans les deux sens :
- `user_id` = utilisateur actuel, `friend_id` = ami
- `friend_id` = utilisateur actuel, `user_id` = ami

Il faut donc vérifier les deux cas avec `.or()`.

### 3. Exclusion des amitiés supprimées

Ajout de `.is('deleted_at', null)` pour exclure les amitiés qui ont été supprimées (soft delete).

### 4. Amélioration de la gestion d'erreurs

```typescript
// Gérer les erreurs silencieusement pour les statistiques
const [eventsCreatedResult, eventsParticipatedResult, gamesOwnedResult, friendsResult] = await Promise.all([...]);

setStats({
  eventsCreated: eventsCreatedResult.count || 0,
  eventsParticipated: eventsParticipatedResult.count || 0,
  gamesOwned: gamesOwnedResult.count || 0,
  friends: friendsResult.count || 0
});

// Logger les erreurs pour le débogage sans bloquer l'interface
if (eventsCreatedResult.error) {
  console.warn('Erreur lors du chargement des événements créés:', eventsCreatedResult.error);
}
// ... etc
```

## Structure de la table `friends`

D'après les migrations :
- `id` : UUID (clé primaire)
- `user_id` : UUID (référence vers profiles)
- `friend_id` : UUID (référence vers profiles)
- `friendship_status` : text ('pending', 'accepted', 'blocked', 'declined')
- `deleted_at` : timestamp (pour soft delete)
- `created_at` : timestamp
- `updated_at` : timestamp

## Notes sur les erreurs d'images

Les erreurs 400 pour les images depuis `cf.geekdo-images.com` sont des problèmes externes (CDN) et ne sont pas critiques pour le fonctionnement de l'application. Ces erreurs peuvent être causées par :
- URLs d'images invalides ou expirées
- Images supprimées du CDN
- Problèmes de CORS ou de permissions

Ces erreurs peuvent être ignorées ou gérées au niveau des composants Image avec un fallback.

## Fichiers modifiés

- `apps/mobile/app/(tabs)/profile/index.tsx` : Correction de la requête friends et amélioration de la gestion d'erreurs

## Tests recommandés

1. Vérifier que les statistiques se chargent correctement
2. Vérifier que le compteur d'amis est correct
3. Vérifier qu'il n'y a plus d'erreurs 400 dans la console
4. Tester avec un utilisateur ayant des amis dans les deux sens (user_id et friend_id)





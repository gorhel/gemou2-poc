# Audit du Code et Nettoyage de la Base de Données

**Date:** 29 octobre 2025  
**Type:** Audit complet + Migration de nettoyage  
**Fichiers vérifiés:** Tous les fichiers dans `/apps` (mobile + web)

---

## 🔍 Résultats de l'audit

### ✅ 1. Vérification: `profile_id` vs `user_id`

**Problème :** Utilisation incorrecte de `profile_id` au lieu de `user_id`

**Fichiers corrigés :**

#### apps/mobile/app/(tabs)/profile/index.tsx
```typescript
// ❌ AVANT
supabase.from('event_participants')
  .select('id', { count: 'exact', head: true })
  .eq('profile_id', user.id)

// ✅ APRÈS
supabase.from('event_participants')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id)
```

#### apps/mobile/app/profile/[username].tsx
```typescript
// ❌ AVANT
supabase.from('event_participants')
  .select('id', { count: 'exact', head: true })
  .eq('profile_id', profileData.id)

// ✅ APRÈS
supabase.from('event_participants')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', profileData.id)
```

**Impact :**
- ✅ Les statistiques de profil affichent maintenant le bon nombre d'événements participés
- ✅ Plus d'erreur de colonne inexistante

---

### ✅ 2. Vérification: `capacity` vs `max_participants`

**Résultat :** ✅ Aucune utilisation de `capacity` dans le code

Le code utilise correctement `max_participants` partout.

**Colonne à supprimer :** `events.capacity` (doublon inutilisé)

---

### ✅ 3. Vérification: `event_photo_url` vs `image_url`

**Résultat :** ✅ Aucune utilisation de `event_photo_url` dans le code

Le code utilise correctement `image_url` partout.

**Colonne à supprimer :** `events.event_photo_url` (doublon inutilisé)

---

### ✅ 4. Vérification: `profile_photo_url` vs `avatar_url`

**Résultat :** ✅ Aucune utilisation de `profile_photo_url` dans le code

Le code utilise correctement `avatar_url` partout.

**Colonne à supprimer :** `profiles.profile_photo_url` (doublon inutilisé)

---

### ✅ 5. Vérification: colonne `password` dans `profiles`

**Résultat :** ✅ Aucune utilisation de `profiles.password` dans le code

Les mots de passe sont gérés par **Supabase Auth** dans la table `auth.users`.

**Colonne à supprimer :** `profiles.password` (dangereuse et inutilisée)

**⚠️ Risque de sécurité :** Cette colonne ne devrait jamais exister dans une table publique.

---

## 📋 Résumé des colonnes en doublon

| Table | Colonne à supprimer | Colonne à utiliser | Raison |
|-------|---------------------|-------------------|---------|
| `events` | `capacity` | `max_participants` | Doublon, jamais utilisé |
| `events` | `event_photo_url` | `image_url` | Doublon, jamais utilisé |
| `profiles` | `profile_photo_url` | `avatar_url` | Doublon, jamais utilisé |
| `profiles` | `password` | *Supabase Auth* | Risque sécurité, inutilisé |

---

## 🔧 Migration créée

### Fichier : `20251029000002_cleanup_duplicate_columns.sql`

Cette migration :

1. **Vérifie** les données existantes avant suppression
2. **Copie** les données si nécessaire (si colonne source vide mais doublon rempli)
3. **Supprime** les 4 colonnes en doublon
4. **Vérifie** que tout s'est bien passé
5. **Documente** les colonnes à utiliser désormais

### Colonnes supprimées :
- ✅ `events.capacity`
- ✅ `events.event_photo_url`
- ✅ `profiles.profile_photo_url`
- ✅ `profiles.password`

### Sécurité :
- ✅ Backup automatique des données avant suppression
- ✅ Vérification pré/post migration
- ✅ Messages de log détaillés

---

## 🚀 Comment appliquer les changements

### Étape 1 : Appliquer les corrections de code

**Déjà fait !** ✅ Les 2 fichiers ont été corrigés automatiquement.

### Étape 2 : Appliquer la migration de nettoyage

#### Option A : Via Supabase Dashboard (Recommandé)

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Copier le contenu de :
   ```
   supabase/migrations/20251029000002_cleanup_duplicate_columns.sql
   ```
3. Coller dans SQL Editor
4. **Lire les messages de vérification** avant d'approuver
5. Cliquer sur **Run**

#### Option B : Via Supabase CLI

```bash
supabase db push
```

---

## 📊 Impact attendu

### Sur le code existant

✅ **Aucun impact négatif** - Le code n'utilise pas ces colonnes.

### Sur la base de données

- ⚠️ Les colonnes seront **définitivement supprimées**
- ✅ Les données seront **copiées** si nécessaire avant suppression
- ✅ Espace disque libéré
- ✅ Schéma plus propre et clair

### Sur les performances

- ✅ Légère amélioration (moins de colonnes à scanner)
- ✅ Schéma plus simple = requêtes plus claires

---

## 🧪 Tests à effectuer après migration

### Test 1 : Vérifier que les colonnes sont supprimées

```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'events'
ORDER BY ordinal_position;

-- Ne devrait PAS contenir: capacity, event_photo_url
```

### Test 2 : Vérifier que l'app fonctionne

1. **Mobile :**
   - ✅ Créer un événement
   - ✅ Participer à un événement
   - ✅ Voir son profil
   - ✅ Voir les statistiques de profil

2. **Dashboard :**
   - ✅ Affichage des événements
   - ✅ Compteurs de participants corrects

### Test 3 : Vérifier les images

```sql
-- Tous les événements avec image devraient avoir image_url rempli
SELECT id, title, image_url 
FROM events 
WHERE image_url IS NOT NULL;
```

---

## 📝 Bonnes pratiques désormais

### ✅ À FAIRE

```typescript
// Pour les participants
.eq('user_id', userId)

// Pour le nombre max de participants
event.max_participants

// Pour l'image d'un événement
event.image_url

// Pour l'avatar d'un utilisateur
profile.avatar_url

// Pour les mots de passe
// Utiliser Supabase Auth uniquement
await supabase.auth.signUp({ email, password })
```

### ❌ À NE PLUS FAIRE

```typescript
// ❌ Colonnes supprimées - ne plus utiliser
.eq('profile_id', userId)        // Colonne n'existe plus
event.capacity                   // Colonne n'existe plus
event.event_photo_url           // Colonne n'existe plus
profile.profile_photo_url       // Colonne n'existe plus
profile.password                // Colonne n'existe plus
```

---

## 🔄 Rollback (si nécessaire)

Si vous devez annuler la migration :

```sql
-- Recréer les colonnes (vides)
ALTER TABLE public.events ADD COLUMN capacity integer;
ALTER TABLE public.events ADD COLUMN event_photo_url text;
ALTER TABLE public.profiles ADD COLUMN profile_photo_url text;
ALTER TABLE public.profiles ADD COLUMN password text;

-- Note: Les données ne seront pas restaurées
-- Utilisez une sauvegarde Supabase si besoin
```

**⚠️ Mieux vaut :** Tester d'abord sur un environnement de staging.

---

## 📈 Métriques

### Fichiers analysés
- ✅ 2 fichiers corrigés
- ✅ Tous les autres fichiers conformes

### Colonnes nettoyées
- ✅ 4 colonnes en doublon identifiées
- ✅ 4 colonnes à supprimer
- ✅ 0 conflit détecté

### Risques identifiés
- ⚠️ 1 risque de sécurité (profiles.password) → résolu par suppression

---

## 🎯 Prochaines étapes recommandées

### Immédiatement
- [x] Corriger les fichiers avec `profile_id` ✅ **FAIT**
- [ ] Appliquer la migration de nettoyage
- [ ] Tester l'application

### Court terme
- [ ] Mettre à jour la documentation TypeScript
- [ ] Créer des types TypeScript stricts
- [ ] Ajouter des tests pour éviter régression

### Long terme
- [ ] Audit régulier du schéma DB (1x par mois)
- [ ] Convention de nommage stricte
- [ ] Review systématique des migrations

---

## 📚 Fichiers créés/modifiés

### Fichiers corrigés
1. `apps/mobile/app/(tabs)/profile/index.tsx`
2. `apps/mobile/app/profile/[username].tsx`

### Fichiers créés
1. `supabase/migrations/20251029000002_cleanup_duplicate_columns.sql`
2. `documentation/2025-10-29_database-schema-reference.md`
3. `documentation/2025-10-29_audit-code-et-nettoyage.md` (ce fichier)

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Status:** ✅ Audit terminé, prêt pour nettoyage


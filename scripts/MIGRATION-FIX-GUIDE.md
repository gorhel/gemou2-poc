# Guide de Correction des Migrations Tags

## Problème rencontré

```
ERROR: 42710: policy "Game tags are publicly readable" for table "game_tags" already exists
```

Cette erreur se produit lorsqu'une migration tente de créer une politique RLS qui existe déjà.

## Solutions

### Solution 1 : Réexécuter les migrations (RECOMMANDÉ)

Les migrations ont été corrigées pour être **idempotentes** (peuvent être exécutées plusieurs fois).

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735

# Réexécuter toutes les migrations
supabase migration up
```

Les migrations corrigées utilisent maintenant `DROP POLICY IF EXISTS` avant de créer les politiques.

### Solution 2 : Reset complet des migrations tags

Si la Solution 1 ne fonctionne pas, utilisez le script de reset :

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735

# Exécuter le script de reset
supabase db query --file scripts/reset-tags-migrations.sql
```

Ce script va :
1. ✅ Supprimer les politiques RLS conflictuelles
2. ✅ Supprimer et recréer la table `game_tags`
3. ✅ Vérifier et insérer les tags manquants
4. ✅ Recréer tous les index
5. ✅ Recréer les politiques RLS
6. ✅ Afficher un rapport complet

### Solution 3 : Nettoyage manuel dans Supabase

Via le dashboard Supabase ou psql :

```sql
-- Supprimer les politiques conflictuelles
DROP POLICY IF EXISTS "Game tags are publicly readable" ON public.game_tags;
DROP POLICY IF EXISTS "Authenticated users can manage game tags" ON public.game_tags;

-- Puis réexécuter les migrations
```

## Vérification après correction

### 1. Vérifier que game_tags existe

```bash
echo "SELECT COUNT(*) FROM game_tags;" | supabase db query
```

### 2. Vérifier les politiques RLS

```bash
echo "SELECT policyname FROM pg_policies WHERE tablename = 'game_tags';" | supabase db query
```

Devrait afficher :
- `Game tags are publicly readable`
- `Authenticated users can manage game tags`

### 3. Vérifier que les tags sont présents

```bash
echo "SELECT COUNT(*) FROM tags;" | supabase db query
```

Devrait retourner : **15**

### 4. Tester dans l'application

1. Ouvrir l'app mobile
2. Aller sur `/create-event`
3. Vérifier que les tags s'affichent dans le TagSelector
4. Les logs console devraient montrer : `🏷️ Tags chargés: [15 tags]`

## Ordre des migrations

Les migrations doivent être exécutées dans cet ordre :

1. **`20250111000000_create_game_tags_table.sql`**
   - Crée la table `game_tags`
   - Crée les index
   - Configure RLS

2. **`20250111000001_fix_tags_id_type.sql`**
   - Standardise le type de `tags.id` sur `integer`
   - Gère la conversion uuid → int si nécessaire

3. **`20250111000002_populate_game_tags.sql`**
   - Lie des jeux populaires à leurs tags

4. **`20250111000003_ensure_tags_exist.sql`**
   - S'assure que tous les tags prédéfinis existent

## État attendu après migrations

### Tables créées
- ✅ `tags` (avec 15 tags minimum)
- ✅ `event_tags` (liaison événements-tags)
- ✅ `game_tags` (liaison jeux-tags)
- ✅ `user_tags` (liaison utilisateurs-tags, si existe)

### Type de données
- ✅ `tags.id` : `integer` (serial)
- ✅ `event_tags.tag_id` : `integer`
- ✅ `game_tags.tag_id` : `integer`
- ✅ `user_tags.tag_id` : `integer` (si existe)

### Politiques RLS
- ✅ Lecture publique sur toutes les tables de tags
- ✅ Écriture authentifiée sur `game_tags`
- ✅ Écriture par créateur sur `event_tags`

## Dépannage avancé

### Problème : Migration bloquée

```bash
# Voir l'état des migrations
supabase migration list

# Forcer la réinitialisation (ATTENTION : perte de données)
supabase db reset

# Puis réexécuter
supabase migration up
```

### Problème : Tags toujours invisibles

1. Vérifier les logs de l'app :
   ```
   🏷️ Tags chargés: []
   OU
   Erreur lors du chargement des tags: ...
   ```

2. Vérifier la requête Supabase dans TagSelector :
   ```typescript
   const { data, error } = await supabase
     .from('tags')
     .select('id, name, color')
     .order('name', { ascending: true })
   ```

3. Tester directement la requête :
   ```bash
   echo "SELECT id, name FROM tags ORDER BY name;" | supabase db query
   ```

### Problème : Erreur de type

Si vous voyez des erreurs comme :
```
invalid input syntax for type integer: "uuid-string"
```

Cela signifie que la migration `20250111000001_fix_tags_id_type.sql` n'a pas été exécutée correctement.

**Solution :**
```bash
# Exécuter le script de reset
supabase db query --file scripts/reset-tags-migrations.sql

# Puis réexécuter toutes les migrations
supabase migration up
```

## Contacts et support

Si le problème persiste après avoir essayé toutes les solutions :

1. Vérifier les logs Supabase complets
2. Vérifier la console du navigateur pour les erreurs front-end
3. Partager les résultats de :
   ```bash
   supabase db query --file scripts/check-and-fix-tags.sql
   ```

## Fichiers de référence

- **Migrations :** `supabase/migrations/202501110000*.sql`
- **Scripts de diagnostic :** `scripts/check-and-fix-tags.sql`
- **Script de reset :** `scripts/reset-tags-migrations.sql`
- **Documentation :** `documentation/2025-11-11-IMPLEMENTATION-TAGS-EVENEMENTS-JEUX.md`




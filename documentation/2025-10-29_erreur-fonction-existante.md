# Erreur: "cannot change return type of existing function"

**Date:** 29 octobre 2025  
**Erreur complète:**
```
ERROR:  42P13: cannot change return type of existing function
HINT:  Use DROP FUNCTION sync_all_event_participants_count() first.
```

---

## 🔍 Cause du problème

Cette erreur survient quand vous essayez de créer une fonction avec `CREATE OR REPLACE` mais que :
1. ✅ Une fonction avec le même nom existe déjà
2. ❌ Le nouveau type de retour (`RETURNS TABLE(...)`) est **différent** de l'ancien

PostgreSQL **ne peut pas** changer automatiquement le type de retour d'une fonction existante, même avec `CREATE OR REPLACE`.

### Exemple du conflit

**Ancienne fonction** (dans `20250126000001_fix_participants_count.sql`) :
```sql
CREATE OR REPLACE FUNCTION sync_all_event_participants_count()
RETURNS void AS $$  -- ⚠️ Retourne void
```

**Nouvelle fonction** (dans `20251029000001_force_fix_participants_triggers.sql`) :
```sql
CREATE OR REPLACE FUNCTION sync_all_event_participants_count()
RETURNS TABLE(      -- ❌ Retourne TABLE - CONFLIT !
  event_id uuid,
  event_title text,
  old_count integer,
  new_count integer,
  updated boolean
) AS $$
```

PostgreSQL voit que `void` ≠ `TABLE(...)` et refuse le changement.

---

## ✅ Solutions

### Solution 1 : Utiliser le script de correction rapide (RECOMMANDÉ)

J'ai créé un nouveau script qui supprime **TOUTES** les anciennes fonctions avant de créer les nouvelles :

```bash
# Fichier à la racine du projet
fix-participants-NOW.sql
```

Ce script fait :
```sql
-- 1. Supprimer TOUTES les anciennes fonctions
DROP FUNCTION IF EXISTS sync_all_event_participants_count() CASCADE;
DROP FUNCTION IF EXISTS check_participants_consistency() CASCADE;
-- etc...

-- 2. Créer les nouvelles fonctions (sans conflit)
CREATE FUNCTION sync_all_event_participants_count() ...
```

**Utilisation :**
1. Ouvrir **Supabase SQL Editor**
2. Copier **TOUT** le contenu de `fix-participants-NOW.sql`
3. Coller et **Run**
4. ✅ Terminé !

---

### Solution 2 : Supprimer manuellement les anciennes fonctions

Si vous préférez utiliser la migration originale, supprimez d'abord les fonctions :

```sql
-- Exécuter AVANT la migration
DROP FUNCTION IF EXISTS sync_all_event_participants_count() CASCADE;
DROP FUNCTION IF EXISTS check_participants_consistency() CASCADE;
DROP FUNCTION IF EXISTS check_participants_count_consistency() CASCADE;
DROP FUNCTION IF EXISTS get_real_participants_count(uuid) CASCADE;
```

Puis réexécutez la migration.

---

### Solution 3 : Migration corrigée

J'ai également **corrigé** la migration originale pour inclure les `DROP FUNCTION` automatiquement :

```sql
-- Dans 20251029000001_force_fix_participants_triggers.sql
-- Maintenant elle contient :

DROP FUNCTION IF EXISTS sync_all_event_participants_count() CASCADE;
-- ...puis...
CREATE OR REPLACE FUNCTION sync_all_event_participants_count() ...
```

Si vous utilisez Supabase CLI :
```bash
supabase db push
```

Cela devrait fonctionner maintenant.

---

## 🧪 Vérifier que le problème est résolu

Après avoir appliqué une des solutions, vérifiez :

### 1. Les fonctions sont créées
```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%participant%'
ORDER BY routine_name;
```

**Résultat attendu :**
```
routine_name                              | routine_type
-----------------------------------------|-------------
check_participants_consistency           | FUNCTION
sync_all_event_participants_count        | FUNCTION
update_event_participants_count          | FUNCTION
```

### 2. Les triggers sont actifs
```sql
SELECT 
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'event_participants'
ORDER BY trigger_name;
```

**Résultat attendu :**
```
trigger_name                              | event_manipulation
-----------------------------------------|-------------------
trigger_update_participants_count_delete | DELETE
trigger_update_participants_count_insert | INSERT
trigger_update_participants_count_update | UPDATE
```

### 3. Les compteurs sont corrects
```sql
SELECT 
  e.title,
  e.current_participants as stored,
  COUNT(ep.id) as real,
  CASE 
    WHEN e.current_participants = COUNT(ep.id) THEN '✅ OK'
    ELSE '❌ Décalage'
  END as status
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants;
```

Si tout est ✅ → **Problème résolu !**

---

## 📚 Comprendre CASCADE

Le mot-clé `CASCADE` dans `DROP FUNCTION ... CASCADE` est important :

```sql
DROP FUNCTION IF EXISTS sync_all_event_participants_count() CASCADE;
```

**Sans CASCADE :**
- PostgreSQL refuse de supprimer la fonction si quelque chose dépend d'elle
- Erreur : "cannot drop function ... because other objects depend on it"

**Avec CASCADE :**
- PostgreSQL supprime la fonction **ET** tout ce qui en dépend
- Triggers, vues, autres fonctions qui l'appellent, etc.
- ✅ Plus sûr pour une réinstallation complète

---

## ⚠️ Pourquoi cette erreur arrive-t-elle ?

### Historique des migrations

1. **Migration 1** (`20250126000001`) : Créé `sync_all_event_participants_count()` avec `RETURNS void`
2. **Migration 2** (`20251029000001`) : Tente de créer la même fonction avec `RETURNS TABLE(...)`
3. ❌ **Conflit** : PostgreSQL refuse de changer le type de retour

### Dans un monde idéal...

Les migrations devraient être **immuables** :
- ✅ Une fois créée, une migration ne change jamais
- ✅ Pour modifier quelque chose, on crée une **nouvelle** migration qui fait le changement

**Mais ici**, nous corrigeons un bug, donc nous devons :
- Soit créer une nouvelle migration qui DROP puis recrée
- Soit utiliser un script de correction one-shot

---

## 🎯 Quelle solution choisir ?

| Solution | Avantages | Inconvénients |
|----------|-----------|---------------|
| **Script `fix-participants-NOW.sql`** | ✅ Simple<br>✅ Rapide<br>✅ Tout en un | ❌ Pas tracé comme migration |
| **Migration corrigée** | ✅ Tracé par Supabase<br>✅ Reproductible | ❌ Plus complexe |
| **Suppression manuelle** | ✅ Contrôle total | ❌ 2 étapes<br>❌ Risque d'oubli |

**Recommandation :** Utilisez `fix-participants-NOW.sql` pour corriger rapidement, puis si nécessaire, créez une vraie migration pour l'historique.

---

## 🔗 Fichiers liés

- `fix-participants-NOW.sql` - Script de correction rapide ⚡
- `supabase/migrations/20251029000001_force_fix_participants_triggers.sql` - Migration corrigée
- `FIX_DATABASE_PARTICIPANTS.md` - Guide rapide

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Statut:** ✅ Erreur documentée et résolue


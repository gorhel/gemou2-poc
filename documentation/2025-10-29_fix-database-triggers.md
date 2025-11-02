# Correction des Triggers de Base de Données - Participants

**Date:** 29 octobre 2025  
**Problème:** La base de données n'est pas mise à jour automatiquement  
**Impact:** Le compteur `current_participants` ne se synchronise pas

---

## 🚨 Symptômes du problème

- ✅ L'application mobile fonctionne (ajout/suppression de participants)
- ❌ La colonne `current_participants` dans la table `events` n'est pas mise à jour
- ❌ Dashboard et page de détail affichent des valeurs incorrectes
- ❌ Les triggers de base de données ne s'exécutent pas

---

## 🔍 Diagnostic

### Étape 1 : Vérifier l'état actuel

1. **Ouvrir Supabase Dashboard** → SQL Editor
2. **Exécuter le script de diagnostic :**

```bash
# Le fichier est à la racine du projet
cat check-participants-db.sql
```

Ou copiez ce contenu dans SQL Editor :

```sql
-- Comparer les compteurs stockés vs réels
SELECT 
  e.id,
  e.title,
  e.current_participants as "Compteur stocké",
  COUNT(ep.id) as "Participants réels",
  CASE 
    WHEN e.current_participants = COUNT(ep.id) THEN '✅ OK'
    ELSE '❌ DÉCALAGE'
  END as "État"
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants
ORDER BY e.created_at DESC;
```

### Étape 2 : Vérifier si les triggers existent

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'event_participants'
ORDER BY trigger_name;
```

**Résultats attendus :**
- `trigger_update_participants_count_insert`
- `trigger_update_participants_count_update`
- `trigger_update_participants_count_delete`

**Si aucun trigger n'apparaît** → Les triggers ne sont pas installés !

---

## 🔧 Solutions

### Solution 1 : Appliquer la nouvelle migration (RECOMMANDÉ)

Cette migration supprime les anciens triggers et en crée des nouveaux plus robustes.

#### Via Supabase CLI (Local)

```bash
# Naviguer vers le projet
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735

# Appliquer la migration
supabase db push

# Ou appliquer une migration spécifique
supabase migration up 20251029000001_force_fix_participants_triggers
```

#### Via Supabase Dashboard (Cloud)

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Ouvrir le fichier : 
   ```
   supabase/migrations/20251029000001_force_fix_participants_triggers.sql
   ```
3. **Copier tout le contenu** du fichier
4. **Coller** dans SQL Editor
5. **Exécuter** (bouton Run ou Ctrl+Enter)

**Résultat attendu :**
```
✅ Triggers créés
✅ Fonctions créées
✅ X événements synchronisés
✅ Tous les compteurs sont cohérents !
```

---

### Solution 2 : Correction manuelle rapide

Si vous voulez juste corriger les compteurs sans toucher aux triggers :

```sql
-- Corriger tous les compteurs en une seule requête
UPDATE events e
SET 
  current_participants = (
    SELECT COUNT(*) 
    FROM event_participants ep
    WHERE ep.event_id = e.id 
      AND ep.status != 'cancelled'
  ),
  updated_at = now();

-- Vérifier le résultat
SELECT 
  title,
  current_participants,
  (SELECT COUNT(*) FROM event_participants 
   WHERE event_id = events.id AND status != 'cancelled') as real_count
FROM events
ORDER BY created_at DESC;
```

⚠️ **Note :** Cette solution corrige les données mais ne résout pas le problème des triggers manquants.

---

## 📋 Vérification post-correction

### Test 1 : Vérifier la cohérence

```sql
SELECT * FROM check_participants_consistency();
```

**Résultat attendu :** Tous les événements avec `is_consistent = true`

### Test 2 : Tester les triggers

```sql
-- 1. Choisir un événement et un utilisateur de test
SELECT id FROM events LIMIT 1;  -- Copier l'ID
SELECT id FROM profiles WHERE username = 'votre_username' LIMIT 1;  -- Copier l'ID

-- 2. Insérer un participant de test
INSERT INTO event_participants (event_id, user_id, status)
VALUES (
  'EVENT_ID_ICI'::uuid,
  'USER_ID_ICI'::uuid,
  'registered'
);

-- 3. Vérifier si current_participants a été incrémenté automatiquement
SELECT id, title, current_participants 
FROM events 
WHERE id = 'EVENT_ID_ICI'::uuid;

-- 4. Nettoyer le test
DELETE FROM event_participants 
WHERE event_id = 'EVENT_ID_ICI'::uuid 
  AND user_id = 'USER_ID_ICI'::uuid;

-- 5. Vérifier si current_participants a été décrémenté
SELECT id, title, current_participants 
FROM events 
WHERE id = 'EVENT_ID_ICI'::uuid;
```

**Si `current_participants` change automatiquement** → ✅ Les triggers fonctionnent !

---

## 🛠️ Outils de maintenance

### Fonction 1 : Synchronisation manuelle

Si vous avez besoin de resynchroniser tous les compteurs manuellement :

```sql
SELECT * FROM sync_all_event_participants_count();
```

Cette fonction :
- ✅ Compte les participants réels
- ✅ Met à jour `current_participants`
- ✅ Retourne la liste des changements effectués

### Fonction 2 : Vérification de cohérence

Pour vérifier rapidement l'état de tous les événements :

```sql
SELECT * FROM check_participants_consistency()
WHERE is_consistent = false;
```

Retourne uniquement les événements avec des incohérences.

---

## 🔄 Workflow recommandé

### Après chaque modification de participants

1. **L'application fait son travail** (INSERT/UPDATE/DELETE dans `event_participants`)
2. **Le trigger s'exécute automatiquement** (si installé correctement)
3. **`current_participants` se met à jour** (pas besoin d'action manuelle)

### Si vous constatez un décalage

1. **Exécuter** : `SELECT * FROM check_participants_consistency();`
2. **Si incohérences détectées** : `SELECT * FROM sync_all_event_participants_count();`
3. **Vérifier à nouveau** : `SELECT * FROM check_participants_consistency();`

---

## 📂 Fichiers créés

| Fichier | Usage | Emplacement |
|---------|-------|-------------|
| `20251029000001_force_fix_participants_triggers.sql` | Migration complète | `supabase/migrations/` |
| `check-participants-db.sql` | Script de diagnostic | Racine du projet |
| `fix-participants-manual.sql` | Correction manuelle | Racine du projet |

---

## 🚀 Commandes rapides

### Diagnostic complet
```bash
# Copier le contenu et l'exécuter dans Supabase SQL Editor
cat check-participants-db.sql
```

### Appliquer la migration
```bash
# Via Supabase CLI
supabase db push

# Ou manuellement via SQL Editor
cat supabase/migrations/20251029000001_force_fix_participants_triggers.sql
```

### Correction rapide
```bash
# Copier et exécuter dans SQL Editor
cat fix-participants-manual.sql
```

---

## ❓ FAQ

### Q: Pourquoi les triggers ne fonctionnent-ils pas ?

**R:** Plusieurs raisons possibles :
- Migration non appliquée
- Conflit avec d'anciens triggers
- Permissions insuffisantes
- Base de données locale vs cloud désynchronisée

### Q: Dois-je appliquer la migration à chaque fois ?

**R:** Non ! Une seule fois suffit. Les triggers restent actifs ensuite.

### Q: Comment savoir si les triggers sont actifs ?

**R:** Exécutez :
```sql
SELECT trigger_name 
FROM information_schema.triggers
WHERE event_object_table = 'event_participants';
```

Si vous voyez 3 triggers → ✅ C'est bon !

### Q: Et si je travaille en local ET en cloud ?

**R:** 
1. **Local** : `supabase db push` applique les migrations
2. **Cloud** : Exécuter le SQL manuellement dans Dashboard
3. **Synchroniser** : `supabase db pull` pour récupérer l'état cloud en local

### Q: Les données existantes seront-elles corrigées ?

**R:** Oui ! La migration inclut :
```sql
SELECT sync_all_event_participants_count();
```

Qui corrige automatiquement tous les compteurs existants.

---

## 🎯 Résultat final attendu

Après avoir appliqué la migration :

✅ Les 3 triggers sont créés et actifs  
✅ Tous les compteurs existants sont corrigés  
✅ Les nouveaux participants mettent à jour automatiquement  
✅ Dashboard et page de détail affichent les bonnes valeurs  
✅ Aucune action manuelle n'est nécessaire à l'avenir  

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Dernière mise à jour:** 29 octobre 2025


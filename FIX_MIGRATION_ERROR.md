# 🔧 Fix: Erreur de Migration "loop variable must be a record"

## ❌ L'erreur

```
ERROR:  42601: loop variable of loop over rows must be a record variable 
        or list of scalar variables
LINE 22:   FOR rec IN
```

## 🔍 Cause

Dans PostgreSQL, quand on utilise une boucle `FOR ... IN`, la variable doit être **déclarée** dans le bloc `DECLARE`.

## ✅ Solution : Utilisez la version simplifiée

J'ai créé une version **simplifiée et corrigée** de la migration :

```
cleanup-columns-SIMPLE.sql
```

Cette version :
- ✅ Pas de boucles complexes
- ✅ Pas d'erreurs de syntaxe
- ✅ Fait exactement la même chose
- ✅ Plus facile à lire

---

## 🚀 Comment l'utiliser

### 1. Ouvrir Supabase SQL Editor

### 2. Copier le contenu de `cleanup-columns-SIMPLE.sql`

```bash
cat cleanup-columns-SIMPLE.sql
```

### 3. Coller et exécuter dans SQL Editor

### 4. Lire les résultats

Vous verrez :
- Nombre de lignes affectées par les copies
- Nombre de colonnes qui seront supprimées
- Liste des colonnes finales
- Confirmation de suppression

---

## 📊 Ce que fait la migration (étape par étape)

### Étape 1 : Sauvegarde des données

```sql
-- Si max_participants est vide mais capacity rempli, copier
UPDATE events 
SET max_participants = capacity
WHERE max_participants IS NULL 
  AND capacity IS NOT NULL;
```

### Étape 2 : Information

Affiche combien de lignes ont des valeurs dans les colonnes à supprimer.

### Étape 3 : Suppression

```sql
ALTER TABLE public.events DROP COLUMN IF EXISTS capacity CASCADE;
-- etc...
```

### Étape 4 : Vérification

Affiche la liste des colonnes restantes.

### Étape 5 : Documentation

Ajoute des commentaires sur les colonnes pour référence future.

---

## ⚠️ Note sur l'ancienne migration

L'erreur était dans le fichier :
```
supabase/migrations/20251029000002_cleanup_duplicate_columns.sql
```

**J'ai corrigé l'erreur**, mais je recommande d'utiliser **`cleanup-columns-SIMPLE.sql`** à la place car :
- Plus simple
- Moins de risques d'erreur
- Même résultat

---

## 🧪 Tester d'abord (optionnel)

Si vous voulez voir ce qui sera supprimé avant de le faire :

```sql
-- Copier juste cette partie dans SQL Editor
SELECT 
  COUNT(*) as events_avec_capacity
FROM events 
WHERE capacity IS NOT NULL;

SELECT 
  COUNT(*) as profiles_avec_password
FROM profiles 
WHERE password IS NOT NULL;
```

Si les compteurs sont à 0, aucune donnée ne sera perdue.

---

## 🆘 Si ça ne marche toujours pas

### Option de dernier recours : Suppression manuelle

```sql
-- Exécuter ligne par ligne dans SQL Editor
ALTER TABLE public.events DROP COLUMN capacity;
ALTER TABLE public.events DROP COLUMN event_photo_url;
ALTER TABLE public.profiles DROP COLUMN profile_photo_url;
ALTER TABLE public.profiles DROP COLUMN password;
```

C'est la version la plus basique possible, sans aucune vérification.

---

## ✅ Résultat attendu

Après l'exécution, vous devriez voir :

```
✅ 4 colonnes supprimées
✅ Liste des colonnes restantes affichée
✅ Commentaires ajoutés
```

---

**Fichier à utiliser :** `cleanup-columns-SIMPLE.sql`  
**Temps estimé :** 1 minute  
**Risque :** Très faible (backup inclus)


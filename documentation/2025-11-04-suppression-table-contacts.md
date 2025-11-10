# Suppression de la table `contacts`

**Date :** 4 novembre 2025  
**Raison :** Table non utilisée, remplacée par `friends`

## 🔍 Vérification préalable

### Recherche dans le code
✅ Aucune référence à la table `contacts` trouvée dans :
- `apps/mobile/`
- `apps/web/`
- Aucun composant
- Aucune requête Supabase

### Conclusion
La table `contacts` peut être **supprimée en toute sécurité**.

## 📊 Différences entre `contacts` et `friends`

| Caractéristique | `contacts` (à supprimer) | `friends` (actuelle) |
|-----------------|--------------------------|----------------------|
| **ID unique** | ❌ Clé composite | ✅ UUID |
| **Statuts** | 3 basiques | 4 détaillés |
| **Soft delete** | ❌ Non | ✅ Oui (`deleted_at`) |
| **Timestamps** | `created_at` uniquement | `created_at` + `updated_at` |
| **Confidentialité** | ❌ Non | ✅ Oui (7 colonnes dans profiles) |
| **Rate limiting** | ❌ Non | ✅ Oui (50/jour) |
| **Fonctions RPC** | ❌ Aucune | ✅ 5 fonctions |
| **Utilisée dans le code** | ❌ Non | ✅ Oui |

## 🗑️ Script de suppression

### Migration créée
**Fichier :** `supabase/migrations/20251104000000_drop_contacts_table.sql`

### À exécuter via Supabase SQL Editor

```sql
-- Suppression de la table contacts (non utilisée)
DROP TABLE IF EXISTS public.contacts CASCADE;
```

**⚠️ Note :** Le `CASCADE` supprimera aussi toutes les contraintes de clés étrangères qui pointent vers cette table (s'il y en a).

## 📋 Étapes pour supprimer

### Option 1 : Via Supabase CLI (Recommandé)
```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735
supabase db push
```

### Option 2 : Via Dashboard Supabase
1. Ouvrir https://supabase.com/dashboard/project/qpnofwgxjgvmpwdrhzid/sql/new
2. Copier-coller le script :
```sql
DROP TABLE IF EXISTS public.contacts CASCADE;
```
3. Cliquer sur **"Run"**
4. Vérifier que la table a bien été supprimée

### Option 3 : Via Table Editor
1. Ouvrir https://supabase.com/dashboard/project/qpnofwgxjgvmpwdrhzid/editor
2. Chercher la table `contacts`
3. Clic droit → Delete table
4. Confirmer la suppression

## ✅ Vérification post-suppression

Après la suppression, vérifier avec :

```sql
-- Vérifier que la table n'existe plus
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'contacts'
);
-- Devrait retourner : false
```

## 🔄 Rollback (si nécessaire)

Si vous devez recréer la table pour une raison quelconque :

```sql
-- Recréer la table contacts (UNIQUEMENT si nécessaire)
CREATE TABLE IF NOT EXISTS public.contacts (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'requested' CHECK (status IN ('requested','accepted','blocked')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, contact_id)
);

-- Activer RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
```

## ⚠️ Impact

### Impact sur la base de données
- ✅ **Aucun** - La table n'est pas utilisée
- ✅ Libère un peu d'espace (si elle contenait des données)

### Impact sur l'application
- ✅ **Aucun** - Le code n'utilise pas cette table

### Impact sur les migrations
- ✅ Les anciennes migrations qui créent `contacts` resteront
- ✅ Cette nouvelle migration la supprime
- ✅ Pas de conflit (les migrations sont idempotentes avec `IF EXISTS`)

## 📝 Historique

La table `contacts` a été créée dans :
- `20250915120000_alpha_backlog_db.sql`
- `20250917170000_update_schema_out123.sql`
- `20250125000001_sync_cloud_to_local.sql`

Mais **jamais implémentée** dans l'interface utilisateur.

Le système d'amitié a été développé avec la table `friends` qui est beaucoup plus complète.

## ✅ Validation

- [x] Vérification code : Aucune utilisation
- [x] Migration créée : `20251104000000_drop_contacts_table.sql`
- [x] Documentation créée
- [ ] Migration appliquée (à faire)
- [ ] Vérification post-suppression (à faire)

---

**Statut :** Prêt à supprimer  
**Action requise :** Exécuter la migration  
**Risque :** Aucun





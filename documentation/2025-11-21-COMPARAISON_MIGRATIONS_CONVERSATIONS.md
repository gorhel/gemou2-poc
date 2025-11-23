# Comparaison des migrations conversations - Analyse des conflits

**Date** : 21 novembre 2025  
**Objectif** : Identifier les différences entre les migrations locales et la base de données en ligne

---

## 🔍 Problème identifié

Il existe plusieurs migrations qui modifient les mêmes politiques RLS pour les conversations, créant des conflits potentiels :

### Chronologie des migrations

1. **20250125000003_handle_messages_tables.sql** (25 janvier 2025)
   - Crée : `"authenticated users can create conversations"`
   - Condition : `auth.uid() = created_by`
   - ❌ **Ne permet PAS SECURITY DEFINER**

2. **20250128000002_fix_conversations_insert_rls.sql** (28 janvier 2025)
   - Remplace par : `"Users can create conversations"`
   - Condition : `auth.uid() = created_by OR (created_by IS NOT NULL)`
   - ✅ **PERMET SECURITY DEFINER**

3. **20251116000000_fix_conversation_rls.sql** (16 novembre 2025)
   - Remplace par : `"Users can create conversations"`
   - Condition : `auth.uid() = created_by`
   - ❌ **NE PERMET PAS SECURITY DEFINER** (régression !)

4. **20251121000000_fix_conversations_marketplace_complete.sql** (21 novembre 2025)
   - Remplace par : `"Users can create conversations"`
   - Condition : `auth.uid() = created_by OR (created_by IS NOT NULL)`
   - ✅ **PERMET SECURITY DEFINER**

---

## 📊 Tableau comparatif des politiques RLS

### Politique INSERT sur `conversations`

| Migration | Nom de la politique | Condition | Permet SECURITY DEFINER |
|-----------|---------------------|-----------|------------------------|
| 20250125000003 | "authenticated users can create conversations" | `auth.uid() = created_by` | ❌ Non |
| 20250128000002 | "Users can create conversations" | `auth.uid() = created_by OR (created_by IS NOT NULL)` | ✅ Oui |
| 20251116000000 | "Users can create conversations" | `auth.uid() = created_by` | ❌ Non |
| 20251121000000 | "Users can create conversations" | `auth.uid() = created_by OR (created_by IS NOT NULL)` | ✅ Oui |

### Politique INSERT sur `conversation_members`

| Migration | Nom de la politique | Condition | Permet SECURITY DEFINER |
|-----------|---------------------|-----------|------------------------|
| 20250128000003 | "Conversation creators can add members" | `created_by = auth.uid() OR created_at > NOW() - 5s` | ✅ Oui |
| 20251116000000 | "Conversation creators can add members" | `created_by = auth.uid()` | ❌ Non |
| 20251121000000 | "Conversation creators can add members" | `created_by = auth.uid() OR created_at > NOW() - 5s` | ✅ Oui |

### Contrainte CHECK sur `conversations.type`

| Migration | Types autorisés | Inclut 'marketplace' |
|-----------|-----------------|---------------------|
| 20250915120000 | `('direct','group','event')` | ❌ Non |
| 20250128000000 | `('direct','group','event','marketplace')` | ✅ Oui |
| 20251121000000 | `('direct','group','event','marketplace')` | ✅ Oui |

### Politique SELECT sur `marketplace_items`

| Migration | Permet aux membres de conversations de voir les annonces |
|-----------|----------------------------------------------------------|
| 20250128000001 | ✅ Oui |
| 20251121000000 | ✅ Oui |

---

## 🚨 Problème critique identifié

**La migration `20251116000000_fix_conversation_rls.sql` a créé une RÉGRESSION** :

Elle a écrasé la correction de janvier 2025 qui permettait aux fonctions SECURITY DEFINER de créer des conversations et d'ajouter des membres.

### Impact

- ❌ Les conversations marketplace ne peuvent plus être créées via la fonction RPC
- ❌ La fonction `create_marketplace_conversation` échoue avec une erreur RLS
- ❌ Le bouton "Contacter le vendeur" ne fonctionne plus

---

## ✅ Solution

### Option 1 : Supprimer la migration problématique (recommandé)

Si la migration `20251116000000_fix_conversation_rls.sql` n'a pas encore été appliquée en production :

1. Supprimer ou renommer cette migration
2. Appliquer la migration consolidée `20251121000000_fix_conversations_marketplace_complete.sql`

### Option 2 : Corriger la migration existante

Si la migration `20251116000000_fix_conversation_rls.sql` a déjà été appliquée en production :

1. Modifier cette migration pour inclure le support SECURITY DEFINER
2. OU appliquer la migration consolidée `20251121000000_fix_conversations_marketplace_complete.sql` qui corrigera le problème

---

## 📋 Checklist de vérification

Pour déterminer l'état actuel de la base de données en ligne :

### 1. Vérifier la contrainte CHECK

```sql
SELECT 
  tc.constraint_name, 
  tc.table_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'conversations'
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name LIKE '%type%';
```

**Résultat attendu** : La clause doit contenir 'marketplace'. PostgreSQL peut afficher :
- `type IN ('direct', 'group', 'event', 'marketplace')` (syntaxe SQL standard)
- `type = ANY (ARRAY['direct'::text, 'group'::text, 'event'::text, 'marketplace'::text])` (syntaxe PostgreSQL interne)

Les deux syntaxes sont équivalentes. La présence de 'marketplace' dans la clause confirme que la contrainte est correcte.

### 2. Vérifier la politique RLS INSERT sur conversations

```sql
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'conversations'
AND policyname LIKE '%create%';
```

**Résultat attendu** : Condition doit inclure `(created_by IS NOT NULL)` pour permettre SECURITY DEFINER

### 3. Vérifier la politique RLS INSERT sur conversation_members

```sql
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'conversation_members'
AND policyname LIKE '%add%';
```

**Résultat attendu** : Condition doit inclure `created_at > NOW() - INTERVAL '5 seconds'` pour permettre SECURITY DEFINER

### 4. Vérifier la politique RLS SELECT sur marketplace_items

```sql
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'marketplace_items'
AND policyname LIKE '%conversation%';
```

**Résultat attendu** : Doit exister une politique "Conversation members can view marketplace items"

---

## 🔧 Script de diagnostic

Créer un script SQL pour vérifier l'état actuel :

```sql
-- Vérifier l'état des politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_members', 'marketplace_items')
ORDER BY tablename, policyname;

-- Vérifier la contrainte CHECK
SELECT 
  tc.constraint_name,
  tc.table_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'conversations'
AND tc.constraint_type = 'CHECK';
```

---

## 📝 Recommandations

1. **Immédiat** : Vérifier l'état de la base de données en ligne avec les scripts de diagnostic ci-dessus

2. **Court terme** : 
   - Si `20251116000000` n'est pas appliquée : la supprimer
   - Si `20251116000000` est appliquée : appliquer `20251121000000` pour corriger

3. **Long terme** :
   - Éviter les migrations qui écrasent des corrections précédentes
   - Documenter clairement les dépendances entre migrations
   - Utiliser des migrations consolidées pour éviter les conflits

---

## 🔗 Fichiers concernés

- `supabase/migrations/20250125000003_handle_messages_tables.sql`
- `supabase/migrations/20250128000000_fix_conversations_type_check.sql`
- `supabase/migrations/20250128000001_fix_marketplace_items_rls_for_conversations.sql`
- `supabase/migrations/20250128000002_fix_conversations_insert_rls.sql`
- `supabase/migrations/20250128000003_fix_conversation_members_insert_rls.sql`
- `supabase/migrations/20251116000000_fix_conversation_rls.sql` ⚠️ **PROBLÉMATIQUE**
- `supabase/migrations/20251121000000_fix_conversations_marketplace_complete.sql` ✅ **CORRECTION**


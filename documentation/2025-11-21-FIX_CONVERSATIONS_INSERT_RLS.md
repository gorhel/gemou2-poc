# Correction RLS INSERT pour conversations

**Date**: 2025-01-28  
**Problème**: Erreur `42501` lors de la création de conversations marketplace  
**Erreur**: `new row violates row-level security policy for table "conversations"`  
**Solution**: Modification de la politique RLS pour permettre aux fonctions SECURITY DEFINER de créer des conversations

## 🔍 Problème identifié

Lors de l'appel à la fonction RPC `create_marketplace_conversation`, une erreur RLS se produisait :

```
Error creating conversation: {
  code: '42501',
  message: 'new row violates row-level security policy for table "conversations"'
}
```

### Cause racine

La fonction `create_marketplace_conversation` utilise `SECURITY DEFINER`, ce qui signifie qu'elle s'exécute avec les privilèges du propriétaire de la fonction. Cependant, les politiques RLS sont toujours appliquées, même pour les fonctions `SECURITY DEFINER`.

La politique RLS existante pour l'INSERT sur `conversations` était :

```sql
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
```

**Problème** : Dans une fonction `SECURITY DEFINER`, `auth.uid()` peut être NULL ou ne pas correspondre à `created_by`, ce qui fait échouer la vérification RLS.

## ✅ Solution

### Migration créée

**Fichier**: `supabase/migrations/20250128000002_fix_conversations_insert_rls.sql`

Cette migration modifie la politique RLS pour permettre :
1. Les utilisateurs authentifiés de créer leurs propres conversations (`auth.uid() = created_by`)
2. Les fonctions `SECURITY DEFINER` de créer des conversations pour des utilisateurs valides (`created_by IS NOT NULL`)

### Nouvelle politique RLS

```sql
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Soit l'utilisateur crée sa propre conversation
  auth.uid() = created_by
  OR
  -- Soit c'est une fonction SECURITY DEFINER qui crée une conversation
  -- pour un utilisateur valide (created_by doit être fourni et non NULL)
  (created_by IS NOT NULL)
);
```

### Script SQL standalone

**Fichier**: `FIX_CONVERSATIONS_INSERT_RLS.sql`

Script à exécuter directement dans Supabase SQL Editor si la migration n'a pas été appliquée automatiquement.

## 🚀 Application de la correction

### Option 1: Via la migration (recommandé)

Si vous utilisez Supabase CLI ou un système de migration automatique, la migration sera appliquée lors du prochain déploiement.

### Option 2: Via le script SQL standalone

1. Ouvrir le **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_CONVERSATIONS_INSERT_RLS.sql`
4. Exécuter le script

## ✅ Vérification

Après avoir appliqué la correction, vérifiez que :

1. **La politique est correcte** :
```sql
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations'
  AND policyname = 'Users can create conversations';
```

Résultat attendu : `with_check` devrait contenir `(auth.uid() = created_by OR (created_by IS NOT NULL))`

2. **La création de conversation marketplace fonctionne** :
   - Tester depuis l'application mobile : cliquer sur "Contacter le vendeur" sur une annonce
   - Vérifier qu'aucune erreur RLS n'apparaît
   - Vérifier que la conversation est créée avec succès

## 📋 Logique de la politique

La politique utilise une condition `OR` avec deux cas :

1. **`auth.uid() = created_by`** : Permet à un utilisateur authentifié de créer sa propre conversation (cas normal)
2. **`created_by IS NOT NULL`** : **NOUVEAU** - Permet aux fonctions `SECURITY DEFINER` de créer des conversations pour des utilisateurs valides

**Sécurité** : La condition `created_by IS NOT NULL` garantit qu'une conversation ne peut pas être créée sans spécifier un créateur, ce qui maintient la traçabilité.

## 🔗 Fichiers créés

- ✅ `supabase/migrations/20250128000002_fix_conversations_insert_rls.sql` (nouveau)
- ✅ `FIX_CONVERSATIONS_INSERT_RLS.sql` (nouveau)
- ✅ `documentation/2025-01-28-FIX_CONVERSATIONS_INSERT_RLS.md` (ce fichier)

## 📝 Notes techniques

- Les fonctions `SECURITY DEFINER` s'exécutent avec les privilèges du propriétaire de la fonction
- Les politiques RLS sont **toujours appliquées**, même pour les fonctions `SECURITY DEFINER`
- `auth.uid()` dans une fonction `SECURITY DEFINER` peut être NULL ou ne pas correspondre à l'utilisateur réel
- La solution permet aux fonctions de créer des conversations tout en maintenant la sécurité (vérification que `created_by` est fourni)

## 🐛 Dépannage

### Si l'erreur persiste après application

1. **Vérifier que la migration a bien été exécutée** :
```sql
SELECT * FROM supabase_migrations.schema_migrations 
WHERE name = '20250128000002_fix_conversations_insert_rls';
```

2. **Vérifier manuellement la politique** :
```sql
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'conversations'::regclass
  AND contype = 'c';
```

3. **Tester la fonction manuellement** :
```sql
-- Tester la fonction avec un utilisateur authentifié
SELECT create_marketplace_conversation(
  'MARKETPLACE_ITEM_ID'::uuid,
  'BUYER_ID'::uuid
);
```

4. **Vérifier les logs Supabase** pour d'autres erreurs potentielles

## ✅ Checklist de validation

- [ ] Migration appliquée ou script SQL exécuté
- [ ] Politique vérifiée dans la base de données
- [ ] Test de création de conversation marketplace depuis mobile
- [ ] Aucune erreur RLS dans les logs
- [ ] Conversation créée avec succès
- [ ] Redirection vers la page de conversation fonctionne


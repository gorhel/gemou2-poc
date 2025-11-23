# Correction RLS pour marketplace_items dans les conversations

**Date**: 2025-01-28  
**Problème**: Les conversations marketplace ne s'affichent pas car les politiques RLS bloquent l'accès aux `marketplace_items` lors du join  
**Solution**: Ajout d'une politique RLS permettant aux membres de conversations marketplace de voir les annonces associées

## 🔍 Problème identifié

Lors de la récupération des conversations via `getUserConversations`, la requête fait un join avec `marketplace_items` :

```sql
conversations (
  ...
  marketplace_items (
    id,
    title,
    images,
    price,
    type,
    seller_id
  )
)
```

Cependant, les politiques RLS existantes pour `marketplace_items` ne permettent la lecture que si :
1. L'annonce a le statut `'available'` (politique "Public can view published items")
2. L'utilisateur est le vendeur (politique "Sellers can view own items")

**Problème** : Si l'annonce n'est plus `'available'` (par exemple, `'sold'` ou `'closed'`) ET que l'utilisateur n'est pas le vendeur, la politique RLS bloque l'accès à l'annonce lors du join, ce qui fait que `marketplace_item` est `null` dans les résultats.

## ✅ Solution

### Migration créée

**Fichier**: `supabase/migrations/20250128000001_fix_marketplace_items_rls_for_conversations.sql`

Cette migration ajoute une nouvelle politique RLS qui permet aux membres d'une conversation marketplace de voir l'annonce associée, même si :
- L'annonce n'est plus `'available'`
- L'utilisateur n'est pas le vendeur

### Politique RLS ajoutée

```sql
CREATE POLICY "Conversation members can view marketplace items"
ON public.marketplace_items
FOR SELECT
USING (
  status = 'available'
  OR
  auth.uid() = seller_id
  OR
  EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.conversation_members cm ON c.id = cm.conversation_id
    WHERE c.marketplace_item_id = marketplace_items.id
      AND cm.user_id = auth.uid()
      AND c.type = 'marketplace'
  )
);
```

Cette politique permet la lecture si :
1. L'annonce est disponible (politique existante)
2. L'utilisateur est le vendeur (politique existante)
3. **NOUVEAU** : L'utilisateur est membre d'une conversation marketplace liée à cette annonce

## 🚀 Application de la correction

### Option 1: Via la migration (recommandé)

Si vous utilisez Supabase CLI ou un système de migration automatique, la migration sera appliquée lors du prochain déploiement.

### Option 2: Via le script SQL standalone

1. Ouvrir le Supabase Dashboard
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql`
4. Exécuter le script

## ✅ Vérification

Après avoir appliqué la correction, vérifiez que :

1. **La politique existe** :
```sql
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'marketplace_items'
  AND policyname = 'Conversation members can view marketplace items';
```

2. **Les conversations marketplace s'affichent** :
   - Tester depuis l'application mobile
   - Vérifier les logs de la console (préfixés `[getUserConversations]`)
   - Vérifier que `marketplace_item` n'est plus `null` dans les conversations

3. **Test de la politique** :
```sql
-- Tester en tant qu'utilisateur membre d'une conversation marketplace
-- L'annonce devrait être visible même si elle n'est plus 'available'
SELECT mi.*
FROM marketplace_items mi
JOIN conversations c ON c.marketplace_item_id = mi.id
JOIN conversation_members cm ON cm.conversation_id = c.id
WHERE cm.user_id = auth.uid()
  AND c.type = 'marketplace';
```

## 📋 Logique de la politique

La politique utilise une condition `OR` avec trois cas :

1. **`status = 'available'`** : Permet à tout le monde de voir les annonces disponibles (politique existante)
2. **`auth.uid() = seller_id`** : Permet au vendeur de voir ses propres annonces (politique existante)
3. **`EXISTS (...)`** : **NOUVEAU** - Permet aux membres d'une conversation marketplace de voir l'annonce associée

Le `EXISTS` vérifie :
- Qu'il existe une conversation (`conversations`) liée à cette annonce (`marketplace_item_id`)
- Que cette conversation est de type `'marketplace'`
- Que l'utilisateur actuel (`auth.uid()`) est membre de cette conversation (`conversation_members`)

## 🔗 Fichiers créés

- ✅ `supabase/migrations/20250128000001_fix_marketplace_items_rls_for_conversations.sql` (nouveau)
- ✅ `FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql` (nouveau)
- ✅ `documentation/2025-01-28-FIX_CONVERSATIONS_RLS_MARKETPLACE.md` (ce fichier)

## 📝 Notes techniques

- Cette politique est **additive** : elle s'ajoute aux politiques existantes sans les remplacer
- La condition `OR` garantit qu'au moins une des trois conditions doit être vraie
- Le `EXISTS` est optimisé par PostgreSQL et ne devrait pas impacter les performances
- Cette politique s'applique uniquement aux `SELECT`, pas aux `INSERT`, `UPDATE` ou `DELETE`

## 🐛 Dépannage

### Si la politique ne fonctionne pas

1. **Vérifier que la politique existe** :
```sql
SELECT * FROM pg_policies WHERE tablename = 'marketplace_items';
```

2. **Vérifier que RLS est activé** :
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'marketplace_items';
```

3. **Tester la condition EXISTS manuellement** :
```sql
-- Remplacer USER_ID par l'ID de l'utilisateur testé
SELECT EXISTS (
  SELECT 1
  FROM public.conversations c
  JOIN public.conversation_members cm ON c.id = cm.conversation_id
  WHERE c.marketplace_item_id = 'MARKETPLACE_ITEM_ID'
    AND cm.user_id = 'USER_ID'
    AND c.type = 'marketplace'
);
```

4. **Vérifier les logs de débogage** :
   - Les logs dans `getUserConversations` montreront si `marketplace_item` est `null`
   - Si c'est le cas, c'est probablement un problème de RLS

## ✅ Checklist de validation

- [ ] Migration appliquée ou script SQL exécuté
- [ ] Politique vérifiée dans la base de données
- [ ] Test de la condition EXISTS réussi
- [ ] Logs de débogage vérifiés
- [ ] Conversations marketplace affichées dans le frontend
- [ ] `marketplace_item` n'est plus `null` dans les conversations


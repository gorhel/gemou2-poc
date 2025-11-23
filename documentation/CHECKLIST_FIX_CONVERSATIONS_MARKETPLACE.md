# ✅ Checklist : Correction de l'affichage des conversations marketplace

**Date**: 2025-01-28  
**Objectif**: Faire en sorte que les conversations marketplace s'affichent correctement dans le frontend mobile

---

## 🔧 ÉTAPE 1 : Corriger la contrainte CHECK sur conversations.type

### Action requise
Exécuter le script SQL pour ajouter le type `'marketplace'` à la contrainte CHECK.

### Fichier à utiliser
📄 `FIX_CONVERSATIONS_TYPE_CHECK.sql`

### Comment faire
1. Ouvrir le **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_CONVERSATIONS_TYPE_CHECK.sql`
4. Cliquer sur **Run** ou **Exécuter**

### Vérification
```sql
-- Vérifier que la contrainte inclut 'marketplace'
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'conversations' 
  AND constraint_name LIKE '%type%';
```

**Résultat attendu** : `type IN ('direct', 'group', 'event', 'marketplace')`

---

## 🔒 ÉTAPE 2 : Corriger les politiques RLS pour marketplace_items

### Action requise
Exécuter le script SQL pour permettre aux membres de conversations marketplace de voir les annonces associées.

### Fichier à utiliser
📄 `FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql`

---

## 🔒 ÉTAPE 2B : Corriger les politiques RLS INSERT pour conversations

### Action requise
Exécuter le script SQL pour permettre aux fonctions SECURITY DEFINER de créer des conversations.

### Fichier à utiliser
📄 `FIX_CONVERSATIONS_INSERT_RLS.sql`

### Comment faire
1. Ouvrir le **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_CONVERSATIONS_INSERT_RLS.sql`
4. Cliquer sur **Run** ou **Exécuter**

### Vérification
```sql
-- Vérifier que la politique existe et est correcte
SELECT 
  policyname, 
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations'
  AND policyname = 'Users can create conversations';
```

**Résultat attendu** : `with_check` devrait contenir `(auth.uid() = created_by OR (created_by IS NOT NULL))`

---

## 🔒 ÉTAPE 2C : Corriger les politiques RLS INSERT pour conversation_members

### Action requise
Exécuter le script SQL pour permettre aux fonctions SECURITY DEFINER d'ajouter des membres aux conversations.

### Fichier à utiliser
📄 `FIX_CONVERSATION_MEMBERS_INSERT_RLS.sql`

### Comment faire
1. Ouvrir le **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_CONVERSATION_MEMBERS_INSERT_RLS.sql`
4. Cliquer sur **Run** ou **Exécuter**

### Vérification
```sql
-- Vérifier que la politique existe
SELECT 
  policyname, 
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'conversation_members'
  AND policyname = 'Conversation creators can add members';
```

**Résultat attendu** : Une ligne avec la politique créée

---

### Action requise
Exécuter le script SQL pour permettre aux fonctions SECURITY DEFINER de créer des conversations.

### Fichier à utiliser
📄 `FIX_CONVERSATIONS_INSERT_RLS.sql`

### Comment faire
1. Ouvrir le **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_CONVERSATIONS_INSERT_RLS.sql`
4. Cliquer sur **Run** ou **Exécuter**

### Vérification
```sql
-- Vérifier que la politique existe et est correcte
SELECT 
  policyname, 
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations'
  AND policyname = 'Users can create conversations';
```

**Résultat attendu** : `with_check` devrait contenir `(auth.uid() = created_by OR (created_by IS NOT NULL))`

---

### Comment faire
1. Ouvrir le **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql`
4. Cliquer sur **Run** ou **Exécuter**

### Vérification
```sql
-- Vérifier que la politique existe
SELECT 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'marketplace_items'
  AND policyname = 'Conversation members can view marketplace items';
```

**Résultat attendu** : Une ligne avec la politique créée

---

## 📱 ÉTAPE 3 : Vérifier les modifications du code

### Fichiers modifiés (déjà fait)
✅ `packages/database/conversations.ts`
- `getUserConversations` : Ajout du support marketplace
- `getConversationDetails` : Ajout du support marketplace

✅ `apps/mobile/components/conversations/ConversationsList.tsx`
- Affichage des conversations marketplace
- Logs de débogage ajoutés

✅ `apps/mobile/app/conversations/[id].tsx`
- Support des conversations marketplace dans les détails

**Action** : Vérifier que ces fichiers sont bien à jour (déjà fait par l'IA)

---

## 🧪 ÉTAPE 4 : Tester dans l'application mobile

### 4.1 Créer une conversation marketplace
1. Ouvrir l'application mobile
2. Aller sur une annonce marketplace (`/trade/[id]`)
3. Cliquer sur "Contacter le vendeur"
4. Vérifier qu'aucune erreur n'apparaît
5. Vérifier que la redirection vers `/conversations/[id]` fonctionne

### 4.2 Vérifier l'affichage dans la liste
1. Aller dans l'onglet **Community** → **Conversations**
2. Vérifier que la conversation marketplace apparaît dans la liste
3. Vérifier que :
   - L'image de l'annonce s'affiche (ou l'icône 🛒)
   - Le titre de l'annonce s'affiche
   - Le prix s'affiche (si disponible)
   - Le bouton "Voir l'annonce" est présent

### 4.3 Vérifier les détails de la conversation
1. Cliquer sur une conversation marketplace
2. Vérifier que :
   - Le header affiche le titre de l'annonce
   - Le lien "Voir l'annonce" est présent et fonctionne
   - Les messages peuvent être envoyés et reçus

---

## 🔍 ÉTAPE 5 : Vérifier les logs de débogage

### Où trouver les logs
- **React Native** : Console Metro ou logs du terminal
- **Expo** : Logs dans le terminal où `expo start` est lancé
- **Navigateur** : Console du navigateur (si testé sur web)

### Logs à vérifier
Chercher les logs préfixés par :
- `[getUserConversations]` : Logs de la fonction de récupération
- `[ConversationsList]` : Logs du composant

### Ce qu'il faut vérifier
1. **Nombre de conversations** :
   ```
   [getUserConversations] Total conversations: X
   ```
   - Si `X = 0` : Aucune conversation n'est récupérée (problème de RLS ou de données)

2. **Conversations marketplace** :
   ```
   [getUserConversations] Marketplace conversations: Y
   ```
   - Si `Y = 0` : Aucune conversation marketplace n'est récupérée

3. **Données marketplace_item** :
   ```
   [getUserConversations] Transformed conversations: [...]
   ```
   - Vérifier si `marketplace_item` est `null` ou contient des données
   - Si `null` : Problème de RLS (voir ÉTAPE 2)

4. **Erreurs** :
   ```
   [getUserConversations] Supabase error: ...
   ```
   - Si erreur présente : Noter le message d'erreur et vérifier les politiques RLS

---

## 🐛 ÉTAPE 6 : Dépannage si ça ne fonctionne toujours pas

### 6.1 Vérifier les données dans la base
```sql
-- Vérifier que les conversations marketplace existent
SELECT 
  c.id,
  c.type,
  c.marketplace_item_id,
  mi.title as item_title,
  mi.status as item_status
FROM conversations c
LEFT JOIN marketplace_items mi ON c.marketplace_item_id = mi.id
WHERE c.type = 'marketplace'
ORDER BY c.created_at DESC
LIMIT 10;
```

**Résultat attendu** : Au moins une conversation avec `marketplace_item_id` non null

### 6.2 Vérifier les membres des conversations
```sql
-- Vérifier que l'utilisateur est membre
SELECT 
  cm.user_id,
  cm.conversation_id,
  c.type,
  c.marketplace_item_id
FROM conversation_members cm
JOIN conversations c ON cm.conversation_id = c.id
WHERE c.type = 'marketplace'
  AND cm.user_id = auth.uid(); -- Remplacer par votre user_id si besoin
```

**Résultat attendu** : Au moins une ligne avec votre `user_id`

### 6.3 Tester la politique RLS manuellement
```sql
-- Tester si vous pouvez voir l'annonce en tant que membre de conversation
SELECT mi.*
FROM marketplace_items mi
JOIN conversations c ON c.marketplace_item_id = mi.id
JOIN conversation_members cm ON cm.conversation_id = c.id
WHERE cm.user_id = auth.uid()
  AND c.type = 'marketplace'
LIMIT 1;
```

**Résultat attendu** : Au moins une ligne avec les données de l'annonce

### 6.4 Vérifier les politiques RLS actives
```sql
-- Lister toutes les politiques sur marketplace_items
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'marketplace_items'
ORDER BY policyname;
```

**Résultat attendu** : Au moins 3 politiques, dont "Conversation members can view marketplace items"

---

## ✅ Checklist finale

Cochez chaque étape au fur et à mesure :

- [ ] **ÉTAPE 1** : Script `FIX_CONVERSATIONS_TYPE_CHECK.sql` exécuté
- [ ] **ÉTAPE 1** : Contrainte vérifiée (inclut 'marketplace')
- [ ] **ÉTAPE 2** : Script `FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql` exécuté
- [ ] **ÉTAPE 2** : Politique RLS vérifiée (existe)
- [ ] **ÉTAPE 2B** : Script `FIX_CONVERSATIONS_INSERT_RLS.sql` exécuté
- [ ] **ÉTAPE 2B** : Politique RLS INSERT vérifiée (inclut la condition OR)
- [ ] **ÉTAPE 2C** : Script `FIX_CONVERSATION_MEMBERS_INSERT_RLS.sql` exécuté
- [ ] **ÉTAPE 2C** : Politique RLS INSERT pour conversation_members vérifiée
- [ ] **ÉTAPE 3** : Fichiers de code vérifiés (déjà fait)
- [ ] **ÉTAPE 4.1** : Conversation marketplace créée avec succès
- [ ] **ÉTAPE 4.2** : Conversation marketplace visible dans la liste
- [ ] **ÉTAPE 4.3** : Détails de la conversation marketplace fonctionnels
- [ ] **ÉTAPE 5** : Logs vérifiés (pas d'erreurs, données présentes)
- [ ] **ÉTAPE 6** : Tests de dépannage effectués si nécessaire

---

## 📝 Notes importantes

1. **Ordre d'exécution** : Les étapes 1 et 2 (scripts SQL) doivent être faites en premier
2. **Redémarrage** : Après avoir exécuté les scripts SQL, il n'est généralement pas nécessaire de redémarrer l'application
3. **Cache** : Si les données ne s'affichent pas, essayer de rafraîchir l'application (pull-to-refresh)
4. **Logs** : Les logs de débogage sont très utiles pour identifier les problèmes

---

## 🆘 En cas de problème

Si après avoir suivi toutes les étapes, les conversations marketplace ne s'affichent toujours pas :

1. **Copier les logs de débogage** (ÉTAPE 5)
2. **Copier les résultats des requêtes SQL** (ÉTAPE 6)
3. **Vérifier la version de Supabase** et les migrations appliquées
4. **Vérifier que les conversations existent bien** dans la base de données

---

## 📚 Documentation de référence

- `documentation/2025-01-28-FIX_CONVERSATIONS_TYPE_CHECK.md` : Détails sur la correction de la contrainte
- `documentation/2025-01-28-FIX_CONVERSATIONS_RLS_MARKETPLACE.md` : Détails sur la correction RLS
- `documentation/2025-01-28-FIX_CONVERSATIONS_DISPLAY.md` : Détails sur les modifications du code


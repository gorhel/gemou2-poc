# Fix Conversations - Politiques RLS manquantes

**Date**: 16 novembre 2025  
**Type**: Critical Bug Fix  
**Statut**: ⚠️ Action requise

---

## 🔴 Problème identifié

### Symptôme
```
Les conversations ne se déclenchent pas
Erreur : impossible de créer la conversation
```

### Cause racine
La table `conversation_members` n'a **pas de politiques RLS** permettant au créateur de la conversation d'ajouter des membres. Même si le code fonctionne correctement, la base de données bloque les insertions à cause des règles de sécurité Row Level Security (RLS).

### Diagnostic

```sql
-- Vérifier les politiques actuelles
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_members');
```

Résultat attendu : **Peu ou pas de politiques pour `conversation_members`**

---

## ✅ Solution

### Action immédiate requise

**Exécuter le script SQL suivant dans Supabase Dashboard :**

#### 📍 Comment faire :

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **SQL Editor** (dans le menu de gauche)
4. Copier-coller le contenu du fichier `FIX_CONVERSATIONS_RLS.sql`
5. Cliquer sur **Run** (ou `Ctrl/Cmd + Enter`)

---

## 📝 Script SQL à exécuter

Le fichier `FIX_CONVERSATIONS_RLS.sql` contient :

### 1. Activation RLS
```sql
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
```

### 2. Politiques pour conversation_members

**Pour lire les membres** :
```sql
CREATE POLICY "Users can view conversation members"
ON public.conversation_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = conversation_members.conversation_id
    AND cm.user_id = auth.uid()
  )
);
```

**Pour ajouter des membres** (la clé !) :
```sql
CREATE POLICY "Conversation creators can add members"
ON public.conversation_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.conversations c
    WHERE c.id = conversation_members.conversation_id
    AND c.created_by = auth.uid()
  )
);
```

### 3. Politiques pour conversations

**Pour créer une conversation** :
```sql
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
```

**Pour voir les conversations** :
```sql
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = conversations.id
    AND cm.user_id = auth.uid()
  )
);
```

### 4. Permissions nécessaires
```sql
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.conversation_members TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;
```

### 5. Index pour les performances
```sql
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id 
ON public.conversation_members(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id 
ON public.conversation_members(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by 
ON public.conversations(created_by);
```

---

## 🧪 Tests après application

### Test 1 : Créer une conversation

```typescript
// Dans l'app mobile, sur /events/[id]
// Cliquer sur "Contacter les participants"
// ✅ Devrait créer la conversation sans erreur
```

### Test 2 : Vérifier dans la base de données

```sql
-- Vérifier qu'une conversation a été créée
SELECT * FROM conversations 
WHERE event_id = '[votre-event-id]' 
ORDER BY created_at DESC 
LIMIT 1;

-- Vérifier que les membres ont été ajoutés
SELECT cm.*, p.username
FROM conversation_members cm
JOIN profiles p ON p.id = cm.user_id
WHERE cm.conversation_id = '[conversation-id]';
```

### Test 3 : Envoyer un message

```typescript
// Dans /conversations/[id]
// Envoyer un message
// ✅ Devrait s'afficher en temps réel
```

---

## 🔍 Debug : Vérifier les politiques

Après avoir exécuté le script, vérifier que les politiques sont bien en place :

```sql
-- Lister toutes les politiques pour conversations
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
WHERE tablename IN ('conversations', 'conversation_members', 'messages')
ORDER BY tablename, policyname;
```

Vous devriez voir :

| Table | Politique | Commande |
|-------|-----------|----------|
| conversations | Users can create conversations | INSERT |
| conversations | Users can view their conversations | SELECT |
| conversation_members | Users can view conversation members | SELECT |
| conversation_members | Conversation creators can add members | INSERT |
| messages | Users can view messages in their conversations | SELECT |
| messages | Users can send messages in their conversations | INSERT |

---

## 📊 Avant / Après

### ❌ Avant (ne fonctionne pas)

```
Utilisateur clique "Contacter les participants"
    ↓
createEventConversation() crée la conversation ✅
    ↓
Essaie d'ajouter les membres ❌
    ↓
ERREUR : RLS policy violation
    ↓
Conversation créée mais vide (aucun membre)
```

### ✅ Après (fonctionne)

```
Utilisateur clique "Contacter les participants"
    ↓
createEventConversation() crée la conversation ✅
    ↓
Ajoute tous les membres ✅
    ↓
Envoie les notifications ✅
    ↓
Redirige vers la conversation ✅
    ↓
Messages en temps réel ✅
```

---

## 🚨 Points critiques

### 1. La politique "Conversation creators can add members" est essentielle

Sans cette politique, **personne ne peut ajouter de membres**, même le créateur de la conversation.

### 2. L'ordre des vérifications RLS

Supabase vérifie dans cet ordre :
1. ✅ L'utilisateur peut-il créer une conversation ? (via `created_by = auth.uid()`)
2. ✅ L'utilisateur peut-il ajouter des membres ? (via politique INSERT sur `conversation_members`)
3. ✅ Les membres peuvent-ils voir la conversation ? (via politique SELECT)

### 3. Les GRANT sont nécessaires

Même avec les politiques RLS, sans les `GRANT`, les utilisateurs ne peuvent rien faire.

---

## 🎯 Checklist de vérification

- [ ] Script SQL exécuté dans Supabase Dashboard
- [ ] Aucune erreur lors de l'exécution
- [ ] Politiques visibles dans `pg_policies`
- [ ] Test de création de conversation réussi
- [ ] Membres ajoutés correctement
- [ ] Messages envoyés et reçus en temps réel

---

## 🔄 En cas d'erreur persistante

Si après avoir exécuté le script, l'erreur persiste :

### 1. Vérifier les logs Supabase

Dans Supabase Dashboard :
- Aller dans **Database** → **Logs**
- Chercher les erreurs liées à `conversations` ou `conversation_members`

### 2. Tester manuellement dans SQL Editor

```sql
-- Test 1 : Créer une conversation
INSERT INTO conversations (type, event_id, created_by)
VALUES ('event', '[event-uuid]', auth.uid());

-- Test 2 : Récupérer l'ID
SELECT id FROM conversations 
WHERE created_by = auth.uid() 
ORDER BY created_at DESC 
LIMIT 1;

-- Test 3 : Ajouter un membre (remplacer [conversation-id])
INSERT INTO conversation_members (conversation_id, user_id, role)
VALUES ('[conversation-id]', auth.uid(), 'admin');
```

Si ces requêtes échouent dans SQL Editor, c'est un problème de politiques RLS.

### 3. Désactiver temporairement RLS (DEBUG UNIQUEMENT)

```sql
-- ⚠️ UNIQUEMENT POUR LE DEBUG, NE PAS LAISSER EN PRODUCTION
ALTER TABLE conversation_members DISABLE ROW LEVEL SECURITY;
```

Tester, puis **réactiver immédiatement** :

```sql
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
```

---

## 📚 Documentation technique

### Politiques RLS expliquées

**Row Level Security (RLS)** = Filtrage au niveau des lignes dans PostgreSQL

```sql
-- Exemple : Cette politique dit "tu peux voir cette ligne SI..."
CREATE POLICY "policy_name"
ON table_name
FOR SELECT  -- Type d'opération
USING (     -- Condition pour lire
  user_id = auth.uid()
);

-- Pour INSERT, utiliser WITH CHECK au lieu de USING
CREATE POLICY "policy_name"
ON table_name
FOR INSERT
WITH CHECK (  -- Condition pour insérer
  created_by = auth.uid()
);
```

### Ordre d'exécution des politiques

1. **INSERT** : Vérifie `WITH CHECK`
2. **SELECT** : Vérifie `USING`
3. **UPDATE** : Vérifie `USING` puis `WITH CHECK`
4. **DELETE** : Vérifie `USING`

---

## ✅ Résolution complète

Après avoir exécuté le script SQL :

1. ✅ Les conversations peuvent être créées
2. ✅ Les membres peuvent être ajoutés
3. ✅ Les notifications sont envoyées
4. ✅ Les messages fonctionnent en temps réel
5. ✅ La navigation fonctionne correctement

**Temps estimé pour le fix : 2 minutes** (exécution du script SQL)

---

**Fichiers à utiliser** :
- `FIX_CONVERSATIONS_RLS.sql` (script complet à exécuter)
- Cette documentation (explications détaillées)

---

**Prochaine étape** : Exécuter le script SQL dans Supabase Dashboard maintenant ! 🚀




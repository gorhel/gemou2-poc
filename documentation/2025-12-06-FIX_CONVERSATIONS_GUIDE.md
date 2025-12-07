# Guide de correction : Conversations Marketplace

**Date** : 2025-12-06  
**Problème** : Impossible de créer des conversations depuis le marketplace  
**Erreur probable** : `new row for relation "conversations" violates check constraint` ou erreur RLS

## 🔍 Problèmes identifiés

### 1. Contrainte CHECK incorrecte
La table `conversations` a une contrainte CHECK qui n'autorise que les types :
- `'direct'`
- `'group'`
- `'event'`

Mais la fonction `create_marketplace_conversation` insère avec le type `'marketplace'`.

### 2. Politiques RLS trop restrictives
Les politiques RLS ne permettent pas aux fonctions `SECURITY DEFINER` de créer des conversations et d'ajouter des membres.

### 3. Colonne `marketplace_item_id` potentiellement manquante
Cette colonne doit exister sur la table `conversations` pour lier les conversations aux annonces.

## ✅ Solution

### Étapes à suivre

1. **Ouvrir Supabase Dashboard** :
   - Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionner votre projet

2. **Ouvrir SQL Editor** :
   - Menu gauche → **SQL Editor**

3. **Exécuter le script de correction** :
   - Copier le contenu du fichier `FIX_CONVERSATIONS_COMPLETE.sql` (à la racine du projet)
   - Coller dans l'éditeur SQL
   - Cliquer sur **Run**

4. **Vérifier les résultats** :
   - Le script affiche un diagnostic avant et après correction
   - Vérifier que la contrainte inclut `'marketplace'`
   - Vérifier que les politiques sont créées

5. **Tester** :
   - Aller sur une annonce dans le marketplace
   - Cliquer sur "Contacter le vendeur"
   - La conversation devrait se créer avec succès

## 📋 Script SQL complet

Le fichier `FIX_CONVERSATIONS_COMPLETE.sql` contient :

| Partie | Description |
|--------|-------------|
| **1. Diagnostic** | Affiche l'état actuel de la BDD |
| **2. Corrections** | Corrige la contrainte CHECK |
| **3. Politiques RLS** | Recrée les politiques pour conversations et conversation_members |
| **4. Fonction RPC** | Recrée `create_marketplace_conversation` avec SECURITY DEFINER |
| **5. Permissions** | GRANT sur les tables et fonctions |
| **6. Index** | Crée les index pour les performances |
| **7. Vérification** | Affiche l'état après correction |

## 🔧 Détails techniques

### Contrainte CHECK corrigée

```sql
ALTER TABLE conversations 
ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('direct', 'group', 'event', 'marketplace'));
```

### Politique RLS pour INSERT (conversations)

```sql
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by OR created_by IS NOT NULL
);
```

Cette politique permet :
- Les utilisateurs authentifiés de créer leurs propres conversations
- Les fonctions SECURITY DEFINER de créer des conversations (created_by fourni)

### Politique RLS pour INSERT (conversation_members)

```sql
CREATE POLICY "Conversation creators can add members"
ON public.conversation_members
FOR INSERT
WITH CHECK (
  -- Créateur de la conversation
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND created_by = auth.uid())
  OR
  -- Fonction SECURITY DEFINER (conversation récente)
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND created_at > NOW() - INTERVAL '10 seconds')
);
```

## 🐛 Dépannage

### Erreur : "Marketplace item not found"
- Vérifier que l'annonce existe
- Vérifier que `marketplace_items` a les bonnes politiques RLS

### Erreur : "Cannot create conversation with yourself"
- L'utilisateur essaie de contacter sa propre annonce
- C'est un comportement normal (bloqué intentionnellement)

### Erreur RLS persiste
1. Vérifier que le script a été exécuté en entier
2. Vérifier les politiques avec :
```sql
SELECT * FROM pg_policies WHERE tablename IN ('conversations', 'conversation_members');
```

### Conversation créée mais erreur de redirection
- Vérifier que la route `/messages` existe
- Vérifier le paramètre `conversation` dans l'URL

## ✅ Checklist de validation

- [ ] Script SQL exécuté sans erreur
- [ ] Contrainte CHECK inclut `'marketplace'`
- [ ] Politiques RLS créées pour conversations
- [ ] Politiques RLS créées pour conversation_members
- [ ] Fonction `create_marketplace_conversation` existe avec SECURITY DEFINER
- [ ] Test : création de conversation depuis une annonce
- [ ] Test : pas d'erreur dans la console navigateur

## 📝 Notes importantes

1. **SECURITY DEFINER** : La fonction s'exécute avec les privilèges du propriétaire (superuser), ce qui bypass les politiques RLS de l'utilisateur
2. **Intervalle de 10 secondes** : La politique permet l'ajout de membres uniquement dans les 10 secondes suivant la création de la conversation
3. **Rétrocompatibilité** : Les conversations existantes ne sont pas affectées


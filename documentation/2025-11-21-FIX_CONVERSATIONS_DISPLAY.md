# Correction de l'affichage des conversations marketplace

**Date**: 2025-01-28  
**Problème**: Les conversations marketplace sont créées dans la base de données mais ne s'affichent pas dans le frontend  
**Solution**: Mise à jour des fonctions de récupération et des composants pour inclure les conversations marketplace

## 🔍 Problème identifié

Les conversations marketplace étaient créées avec succès dans la table `conversations`, mais elles n'apparaissaient pas dans la liste des conversations du frontend mobile.

### Cause racine

La fonction `getUserConversations` dans `packages/database/conversations.ts` ne récupérait que les conversations liées aux événements (`events`), sans inclure les conversations marketplace qui sont liées aux annonces (`marketplace_items`).

De plus, le composant `ConversationsList` n'était pas configuré pour afficher les conversations marketplace.

## ✅ Solution appliquée

### 1. Mise à jour de `getUserConversations`

**Fichier**: `packages/database/conversations.ts`

**Changements**:
- Ajout de `marketplace_item_id` dans la sélection
- Ajout du join avec `marketplace_items` pour récupérer les informations des annonces
- Transformation des données pour inclure `marketplace_item` dans le résultat

```typescript
// Avant
.select(`
  conversation_id,
  conversations (
    id,
    type,
    event_id,
    created_by,
    created_at,
    events (...)
  )
`)

// Après
.select(`
  conversation_id,
  conversations (
    id,
    type,
    event_id,
    marketplace_item_id,
    created_by,
    created_at,
    events (...),
    marketplace_items (...)
  )
`)
```

### 2. Mise à jour de `getConversationDetails`

**Fichier**: `packages/database/conversations.ts`

**Changements**:
- Ajout de `marketplace_item_id` dans la sélection
- Ajout du join avec `marketplace_items` pour récupérer les détails de l'annonce

### 3. Mise à jour du composant `ConversationsList`

**Fichier**: `apps/mobile/components/conversations/ConversationsList.tsx`

**Changements**:
- Ajout de `marketplace_item` dans l'interface `ConversationItemProps`
- Mise à jour de `renderConversation` pour gérer les deux types de conversations :
  - **Conversations d'événements** : affiche le titre, l'image et la date de l'événement
  - **Conversations marketplace** : affiche le titre, l'image et le prix de l'annonce
- Ajout d'un bouton "Voir l'annonce" pour les conversations marketplace
- Mise à jour du message d'état vide pour mentionner les conversations marketplace

### 4. Mise à jour de la page de détails de conversation

**Fichier**: `apps/mobile/app/conversations/[id].tsx`

**Changements**:
- Ajout de `marketplace_item_id` et `marketplace_items` dans l'interface `ConversationDetails`
- Mise à jour du header pour afficher le titre de l'annonce pour les conversations marketplace
- Ajout d'un lien "Voir l'annonce" pour les conversations marketplace

## 📋 Structure des données

### Format de retour de `getUserConversations`

```typescript
{
  id: string
  type: 'direct' | 'group' | 'event' | 'marketplace'
  event_id: string | null
  marketplace_item_id: string | null
  created_by: string
  created_at: string
  event: {
    id: string
    title: string
    image_url: string | null
    date_time: string
  } | null
  marketplace_item: {
    id: string
    title: string
    images: string[] | null
    price: number | null
    type: 'sale' | 'exchange'
    seller_id: string
  } | null
}
```

## 🎨 Affichage dans le frontend

### Liste des conversations (`ConversationsList`)

- **Conversations d'événements** :
  - Icône : image de l'événement ou 💬
  - Titre : titre de l'événement
  - Date : date de création de la conversation
  - Date de l'événement : affichée si disponible
  - Bouton : "Voir l'événement"

- **Conversations marketplace** :
  - Icône : première image de l'annonce ou 🛒
  - Titre : titre de l'annonce
  - Date : date de création de la conversation
  - Prix : affiché si disponible (ex: "💰 25€")
  - Bouton : "Voir l'annonce"

### Page de détails de conversation

- **Header** :
  - Titre : titre de l'événement ou de l'annonce selon le type
  - Lien : "Voir l'événement" ou "Voir l'annonce" selon le type

## 🔗 Fichiers modifiés

- ✅ `packages/database/conversations.ts`
  - `getUserConversations` : ajout du support marketplace
  - `getConversationDetails` : ajout du support marketplace

- ✅ `apps/mobile/components/conversations/ConversationsList.tsx`
  - Interface `ConversationItemProps` : ajout de `marketplace_item`
  - Fonction `renderConversation` : gestion des deux types de conversations
  - Message d'état vide : mention des conversations marketplace

- ✅ `apps/mobile/app/conversations/[id].tsx`
  - Interface `ConversationDetails` : ajout de `marketplace_item_id` et `marketplace_items`
  - Header : affichage conditionnel selon le type de conversation

## ✅ Checklist de validation

- [x] Fonction `getUserConversations` mise à jour pour inclure les conversations marketplace
- [x] Fonction `getConversationDetails` mise à jour pour inclure les conversations marketplace
- [x] Composant `ConversationsList` mis à jour pour afficher les conversations marketplace
- [x] Page de détails de conversation mise à jour pour les conversations marketplace
- [ ] Test : Vérifier que les conversations marketplace s'affichent dans la liste
- [ ] Test : Vérifier que les détails d'une conversation marketplace s'affichent correctement
- [ ] Test : Vérifier que le bouton "Voir l'annonce" redirige correctement

## 🐛 Dépannage

### Si les conversations marketplace ne s'affichent toujours pas

1. **Vérifier les logs de débogage** :
   - Ouvrir la console du navigateur ou les logs React Native
   - Chercher les logs préfixés par `[getUserConversations]` et `[ConversationsList]`
   - Vérifier :
     - Si les conversations sont récupérées (`Total conversations`)
     - Si les conversations marketplace sont présentes (`Marketplace conversations`)
     - Si les données `marketplace_item` sont présentes dans les conversations

2. **Vérifier les politiques RLS** :
   - Les politiques RLS doivent permettre la lecture des conversations et des `marketplace_items`
   - **IMPORTANT** : Exécuter le script `FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql`
   - Cette politique permet aux membres d'une conversation marketplace de voir l'annonce associée
   - Vérifier que l'utilisateur est bien membre de la conversation

3. **Vérifier les données dans la base** :
```sql
-- Vérifier que les conversations marketplace existent
SELECT c.*, mi.title 
FROM conversations c
LEFT JOIN marketplace_items mi ON c.marketplace_item_id = mi.id
WHERE c.type = 'marketplace';

-- Vérifier que l'utilisateur est membre
SELECT cm.* 
FROM conversation_members cm
WHERE cm.conversation_id IN (
  SELECT id FROM conversations WHERE type = 'marketplace'
);
```

4. **Vérifier les logs de la console** :
   - Les logs détaillés ont été ajoutés dans `getUserConversations` et `ConversationsList`
   - Vérifier les erreurs lors de l'appel à `getUserConversations`
   - Vérifier que les données sont bien retournées par la fonction
   - Vérifier si `marketplace_item` est `null` dans les conversations (problème RLS probable)

5. **Vérifier les permissions Supabase** :
   - S'assurer que les tables `conversations`, `conversation_members` et `marketplace_items` sont accessibles
   - Vérifier que les politiques RLS permettent la lecture

## 📝 Notes techniques

- Les conversations marketplace utilisent le même système de messages que les conversations d'événements
- La distinction se fait uniquement via le champ `type` et les relations (`event_id` vs `marketplace_item_id`)
- Les images des annonces marketplace sont stockées dans un tableau `images` (première image utilisée pour l'affichage)
- Le prix est affiché uniquement pour les annonces de type `sale`

## 🔄 Prochaines étapes

1. Tester l'affichage des conversations marketplace dans l'application mobile
2. Vérifier que les redirections vers les annonces fonctionnent correctement
3. Ajouter des tests unitaires pour les nouvelles fonctionnalités
4. Documenter les cas d'usage spécifiques aux conversations marketplace


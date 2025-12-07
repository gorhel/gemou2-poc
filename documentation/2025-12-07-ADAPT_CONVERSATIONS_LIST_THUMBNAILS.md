# Adaptation des vignettes de la liste des conversations

**Date**: 7 décembre 2025

## Objectif

Adapter le composant `ConversationsList` pour afficher des vignettes différentes selon le type de conversation :

- **Annonce (marketplace)** : Affiche l'image de l'annonce
- **Événement (event)** : Affiche l'image de l'événement
- **Message direct (direct)** : Affiche l'avatar de l'interlocuteur
- **Groupe (group)** : Affiche l'avatar du premier membre

Si aucune image n'est disponible, un émoji adapté au type de conversation est affiché.

## Modifications effectuées

### 1. Package Database (`packages/database/conversations.ts`)

**Fonction `getUserConversations` enrichie** pour récupérer les informations des participants :

- Pour les conversations de type `direct` ou `group`, on récupère maintenant les membres avec leurs profils
- On ajoute un champ `interlocutor` qui contient les informations de l'autre participant (pour les messages directs)
- On ajoute un champ `members` qui contient la liste de tous les membres

```typescript
// Nouveau champ retourné pour les conversations direct/group
{
  ...conversation,
  members: [
    {
      user_id: string,
      username: string | null,
      full_name: string | null,
      avatar_url: string | null
    }
  ],
  interlocutor: {
    user_id: string,
    username: string | null,
    full_name: string | null,
    avatar_url: string | null
  } | null
}
```

### 2. Application Mobile (`apps/mobile/components/conversations/ConversationsList.tsx`)

**Nouvelles fonctions utilitaires** :

- `getConversationImage(item)` : Retourne l'URL de l'image selon le type
- `getConversationEmoji(item)` : Retourne l'émoji de fallback selon le type
- `getConversationTitle(item)` : Retourne le titre selon le type

**Nouveaux styles** :

- `conversationImageContainerRound` : Vignette ronde pour les messages directs
- `conversationImageRound` : Image ronde
- `conversationImagePlaceholderRound` : Placeholder rond avec fond bleu indigo

**Émojis de fallback** :

| Type | Émoji |
|------|-------|
| marketplace | 📦 |
| event | 🎉 |
| direct | 👤 |
| group | 👥 |

### 3. Application Web (`apps/web/app/community/page.tsx`)

Mêmes adaptations que pour le mobile :

- Fonctions utilitaires `getConversationImage`, `getConversationEmoji`, `getConversationTitle`
- Classes CSS conditionnelles pour les vignettes rondes (`rounded-full` vs `rounded-xl`)
- Fond `bg-indigo-100` pour les placeholders des messages directs

## Structure des composants

### Mobile (`ConversationsList.tsx`)

```
ConversationsList
├── FlatList
│   └── renderConversation (pour chaque conversation)
│       ├── TouchableOpacity (carte)
│       │   ├── View (indicateur non lu)
│       │   ├── View (container image)
│       │   │   ├── Image (si image disponible)
│       │   │   └── View placeholder + Text émoji (sinon)
│       │   ├── View (infos conversation)
│       │   │   ├── Text (titre)
│       │   │   ├── Text (date/messages non lus)
│       │   │   └── Text (détails - date événement ou prix)
│       │   └── TouchableOpacity (bouton "Voir l'événement/annonce")
```

### Web (`community/page.tsx`)

```
CommunityPage
├── Tabs (Joueurs / Conversations)
└── Conversations Tab
    └── Card (pour chaque conversation)
        ├── div (container image avec rounded-full ou rounded-xl)
        │   ├── Image (si image disponible)
        │   └── span émoji (sinon)
        ├── div (infos)
        │   ├── h3 (titre)
        │   ├── p (date)
        │   └── p (détails)
        └── Button ("Voir l'événement/annonce")
```

## Flux de données

```
getUserConversations(userId)
    │
    ├── Récupère les conversations avec events et marketplace_items
    │
    ├── Pour les conversations direct/group :
    │   └── Récupère les membres avec profils (avatar_url)
    │
    └── Retourne :
        ├── conversations marketplace → image de l'annonce
        ├── conversations event → image de l'événement
        ├── conversations direct → avatar de l'interlocuteur
        └── conversations group → avatars des membres
```

## Mise à jour : Heure du dernier message

### Changements effectués

- **Suppression** des boutons "Voir l'événement" et "Voir l'annonce"
- **Ajout** de l'heure du dernier message à droite de chaque card

### Fonction `formatLastMessageTime`

La nouvelle fonction affiche :

| Condition | Affichage |
|-----------|-----------|
| Moins de 24h | Heure exacte (HH:mm) |
| 1 jour | "Hier" |
| 2-6 jours | "Xj" (ex: "3j") |
| 7-29 jours | "Xsem" (ex: "2sem") |
| 30+ jours | Date (ex: "5 déc.") |

### Styles ajoutés (Mobile)

```typescript
lastMessageTimeContainer: {
  alignItems: 'flex-end',
  justifyContent: 'center',
  minWidth: 50
},
lastMessageTime: {
  fontSize: 12,
  color: '#9ca3af',
  fontWeight: '400'
},
lastMessageTimeUnread: {
  color: '#3b82f6',
  fontWeight: '600'
}
```

## Tests recommandés

1. **Conversation marketplace** : Vérifier que l'image de l'annonce s'affiche
2. **Conversation événement** : Vérifier que l'image de l'événement s'affiche
3. **Message direct** : Vérifier que l'avatar de l'interlocuteur s'affiche (rond)
4. **Groupe** : Vérifier que les noms des membres s'affichent
5. **Sans image** : Vérifier que l'émoji approprié s'affiche
6. **Heure récente** : Vérifier que l'heure s'affiche (ex: "14:30")
7. **Jour précédent** : Vérifier que "Hier" s'affiche
8. **Plusieurs jours** : Vérifier que "Xj" s'affiche

## Impact sur l'infrastructure

- ✅ Aucune migration de base de données requise
- ✅ Utilise les champs existants (`avatar_url`, `profile_photo_url`)
- ✅ Compatible avec les données existantes


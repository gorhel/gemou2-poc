# Composants Friends - Système d'Amitié

## 📦 Composants Disponibles

### FriendRequestCard
Affiche une demande d'amitié reçue avec actions accepter/refuser.

**Props :**
- `request: FriendRequest`
- `onAccept: (requestId: string) => void`
- `onReject: (requestId: string) => void`
- `loading?: boolean`

### SentRequestCard
Affiche une demande d'amitié envoyée avec action annuler.

**Props :**
- `request: FriendRequest`
- `onCancel: (requestId: string) => void`
- `loading?: boolean`

### FriendCard
Affiche un ami avec actions message/retirer.

**Props :**
- `friend: Profile`
- `onRemove: (friendId: string) => void`
- `onMessage?: (friendId: string) => void`

### UserSearchBar
Barre de recherche d'utilisateurs avec envoi de demande.

**Props :**
- `onSendRequest: (userId: string) => void`
- `currentUserId: string`
- `existingFriendIds: string[]`
- `pendingRequestIds: string[]`

### PrivacySettings
Paramètres de confidentialité et notifications.

**Props :**
- `userId: string`

## 🎨 Design System

**Couleurs :**
- Bleu primaire : `#3b82f6`
- Vert : `#10b981`
- Gris : `#6b7280`
- Rouge clair : `#fee2e2`
- Vert clair : `#dcfce7`

**Typographie :**
- Titres : 16-18px, font-weight: 600
- Corps : 14-16px, font-weight: 400-500
- Sous-textes : 12-14px, color: #6b7280

## 🚀 Utilisation

```tsx
import {
  FriendRequestCard,
  UserSearchBar,
  FriendRequest
} from '../../../components/friends'

// Exemple
<UserSearchBar
  onSendRequest={handleSendRequest}
  currentUserId={user.id}
  existingFriendIds={friends.map(f => f.friend.id)}
  pendingRequestIds={sentRequests.map(r => r.friend_id)}
/>
```

## 📋 Types

Voir `types.ts` pour tous les types TypeScript disponibles.







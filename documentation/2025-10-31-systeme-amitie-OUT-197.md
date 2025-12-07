# Système de Gestion des Relations d'Amitié - OUT-197

**Date de création** : 31 octobre 2025  
**Statut** : ✅ Implémenté  
**Priorité** : Mobile-first

---

## 📋 Vue d'Ensemble

Système complet de gestion des relations d'amitié bidirectionnelles intégré dans l'application Gémou, avec paramètres de confidentialité et notifications configurables.

---

## 🏗️ Architecture

### Base de Données

#### Tables Modifiées

**`profiles`** - Nouvelles colonnes ajoutées :
```sql
- friends_list_public (boolean) : Visibilité publique de la liste d'amis
- notify_friend_request_inapp (boolean) : Notifications in-app pour demandes
- notify_friend_request_push (boolean) : Notifications push pour demandes
- notify_friend_request_email (boolean) : Notifications email pour demandes
- notify_friend_accepted_inapp (boolean) : Notifications in-app pour acceptations
- notify_friend_accepted_push (boolean) : Notifications push pour acceptations
- notify_friend_accepted_email (boolean) : Notifications email pour acceptations
```

**`friends`** - Colonne ajoutée :
```sql
- deleted_at (timestamptz) : Soft delete pour historique
```

#### RPC Functions Créées

| Fonction | Description | Validations |
|----------|-------------|-------------|
| `send_friend_request(friend_uuid)` | Envoie une demande d'amitié | Rate limit (50/jour), pas à soi-même, détection demandes croisées |
| `accept_friend_request(request_id)` | Accepte une demande reçue | Vérification destinataire |
| `reject_friend_request(request_id)` | Refuse une demande (soft delete) | Vérification destinataire |
| `cancel_friend_request(request_id)` | Annule une demande envoyée | Vérification émetteur |
| `remove_friend(friend_uuid)` | Retire un ami (soft delete) | Vérification relation existante |
| `check_friend_request_limit(user_uuid)` | Vérifie le rate limit | Max 50 demandes/24h |

#### RLS Policies

**Politique de visibilité avec confidentialité** :
```sql
- L'utilisateur voit ses propres relations
- OU la liste d'amis est publique ET la relation est acceptée
- ET deleted_at IS NULL
```

---

## 📱 Composants React Native

### Arborescence des Fichiers

```
apps/mobile/components/friends/
├── types.ts                    # Types TypeScript
├── FriendRequestCard.tsx       # Carte demande reçue
├── SentRequestCard.tsx         # Carte demande envoyée
├── FriendCard.tsx              # Carte ami
├── UserSearchBar.tsx           # Recherche utilisateurs
├── PrivacySettings.tsx         # Paramètres confidentialité
└── index.ts                    # Exports
```

### Structure de la Page Profile

```
ProfilePage (apps/mobile/app/(tabs)/profile/index.tsx)
├── Header (Avatar + Nom)
├── Tabs
│   ├── Mes infos (informations)
│   ├── Mes amis (friends) ⭐ NOUVEAU
│   │   ├── UserSearchBar
│   │   ├── Demandes reçues (FriendRequestCard[])
│   │   ├── Demandes envoyées (SentRequestCard[])
│   │   └── Liste d'amis (FriendCard[])
│   ├── Ma confidentialité (privacy)
│   │   └── PrivacySettings ⭐ NOUVEAU
│   └── Mon compte (account)
├── Stats (4 cartes)
└── Actions
```

---

## 🎨 Composants Réutilisables

### FriendRequestCard
**Props** : `request`, `onAccept`, `onReject`, `loading`  
**Design** : Avatar circulaire + Nom + Actions (✅ ❌)  
**Couleurs** : 
- Fond : Blanc avec shadow
- Avatar : `#3b82f6` (bleu)
- Accepter : `#dcfce7` (vert clair)
- Refuser : `#fee2e2` (rouge clair)

### SentRequestCard
**Props** : `request`, `onCancel`, `loading`  
**Design** : Avatar + Nom + Badge "En attente" + Action (❌)  
**Couleurs** :
- Avatar : `#6b7280` (gris)
- Badge : `#fef3c7` (jaune)
- Annuler : `#fee2e2` (rouge clair)

### FriendCard
**Props** : `friend`, `onRemove`, `onMessage?`  
**Design** : Avatar + Nom + Actions (💬 🗑️)  
**Couleurs** :
- Avatar : `#10b981` (vert)
- Message : `#dbeafe` (bleu clair)
- Retirer : `#fee2e2` (rouge clair)

### UserSearchBar
**Props** : `onSendRequest`, `currentUserId`, `existingFriendIds`, `pendingRequestIds`  
**Fonctionnalités** :
- Recherche en temps réel (min 2 caractères)
- Filtrage par username et full_name
- Affichage statut (➕ Ajouter / ⏳ En attente / ✅ Amis)

### PrivacySettings
**Props** : `userId`  
**Sections** :
1. Amis & Recherche (Switch liste publique)
2. Notifications - Demandes (3 switches : in-app, push, email)
3. Notifications - Acceptations (3 switches : in-app, push, email)

---

## ⚡ Fonctionnalités Clés

### Rate Limiting
- **Limite** : 50 demandes d'amitié par 24 heures
- **Message** : "Vous avez atteint la limite de 50 demandes par jour"
- **Implémentation** : Fonction RPC `check_friend_request_limit`

### Demandes Croisées
**Scénario** : A envoie à B ET B envoie à A simultanément  
**Comportement** : Auto-acceptation des deux demandes  
**Message** : "Vous êtes maintenant amis !"

### Soft Delete
- Toutes les suppressions utilisent `deleted_at`
- Conserve l'historique des relations
- Filtrage : `WHERE deleted_at IS NULL`

### Confidentialité
- **Par défaut** : Liste d'amis privée
- **Si publique** : Visible par tous les utilisateurs
- **Si privée** : Visible uniquement par l'utilisateur et ses amis

---

## 🔒 Sécurité

### Validations Backend
- ❌ Pas d'envoi à soi-même
- ❌ Pas de doublons de demandes pending
- ❌ Pas de demande si déjà amis
- ✅ Vérification rate limiting
- ✅ Vérification authentification (RLS)

### RLS (Row Level Security)
- Toutes les requêtes passent par RLS Supabase
- Politique basée sur `auth.uid()`
- Respect des paramètres de confidentialité

---

## 📊 États & Chargement

### États React
```typescript
- receivedRequests: FriendRequest[]    // Demandes reçues
- sentRequests: FriendRequest[]        // Demandes envoyées
- friends: Friendship[]                // Liste d'amis
- loadingFriends: boolean              // Chargement global
- actionLoading: string | null         // ID de l'action en cours
```

### Chargement des Données
- **Trigger** : `useEffect` sur `activeTab === 'friends'`
- **Méthode** : `loadFriendsData()`
- **Queries** : 3 requêtes parallèles (reçues, envoyées, amis)

---

## 🚀 Utilisation

### Migration DB
```bash
# Appliquer la migration
supabase migration up
```

### Composants
```typescript
import { 
  FriendRequestCard, 
  UserSearchBar 
} from '../../../components/friends'

// Utilisation
<UserSearchBar
  onSendRequest={handleSendRequest}
  currentUserId={user.id}
  existingFriendIds={friends.map(f => f.friend.id)}
  pendingRequestIds={sentRequests.map(r => r.friend_id)}
/>
```

---

## 🧪 Tests à Effectuer

### Scénarios Utilisateur
- ✅ Envoyer une demande d'amitié
- ✅ Recevoir et accepter une demande
- ✅ Recevoir et refuser une demande
- ✅ Annuler une demande envoyée
- ✅ Retirer un ami
- ✅ Rechercher un utilisateur
- ✅ Modifier paramètres confidentialité
- ✅ Tester rate limiting (51 demandes)
- ✅ Tester demandes croisées

### Cas Limites
- Réseau hors ligne
- Utilisateur supprimé
- Demande déjà acceptée
- Liste vide (0 amis)

---

## 📈 Métriques

### Performance
- **Queries DB** : 3 queries parallèles pour chargement
- **Index** : Créés sur `user_id`, `friend_id`, `friendship_status`, `deleted_at`
- **Pagination** : Non implémentée (à ajouter si >100 amis)

### Limites Actuelles
- Pas de pagination (recommandé si >100 amis)
- Pas de notifications temps réel (WebSocket à implémenter)
- Messagerie non implémentée (TODO)

---

## 🛠️ Maintenance

### Fichiers Modifiés
- `supabase/migrations/20251031000001_add_friends_privacy_settings.sql`
- `apps/mobile/components/friends/` (7 nouveaux fichiers)
- `apps/mobile/app/(tabs)/profile/index.tsx`

### Dépendances
Aucune dépendance externe ajoutée. Utilise uniquement :
- `@supabase/supabase-js` (existant)
- `react-native` (existant)
- `expo-router` (existant)

---

## 🔮 Évolutions Futures

### Court Terme
- [ ] Notifications temps réel (Supabase Realtime)
- [ ] Pagination pour grandes listes
- [ ] Recherche avancée (filtres)

### Moyen Terme
- [ ] Suggestions d'amis (amis communs)
- [ ] Import contacts téléphone
- [ ] Statistiques d'amitié

### Long Terme
- [ ] Groupes d'amis
- [ ] Liste de blocage
- [ ] Messagerie intégrée

---

## 📞 Support

**Issue Linear** : OUT-197  
**Développeur** : AI Assistant  
**Date** : 31 octobre 2025

Pour toute question ou bug, créer une issue sur Linear avec le tag `friends-system`.








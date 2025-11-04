# Implémentation : Ajout d'amis depuis le profil public

**Date :** 4 novembre 2025  
**Fichiers modifiés :** `apps/mobile/app/profile/[username].tsx`

## 🎯 Objectif

Permettre aux utilisateurs d'envoyer une demande d'amitié directement depuis la page de profil public (`/profile/[username]`) en cliquant sur le bouton "👥 Ajouter en ami".

## ✅ Fonctionnalités implémentées

### 1. Détection automatique du statut d'amitié
Lorsqu'un utilisateur visite le profil d'un autre utilisateur, le système :
- ✅ Vérifie automatiquement si une relation existe
- ✅ Affiche le statut actuel (None, Pending, Accepted)
- ✅ Adapte l'affichage du bouton en conséquence

### 2. Bouton dynamique "Ajouter en ami"
Le bouton affiche différents états :
- **"👥 Ajouter en ami"** → État initial (clickable)
- **"⏳ Demande en attente"** → Demande déjà envoyée (désactivé)
- **"✅ Amis"** → Déjà amis (désactivé)
- **Loader** → Traitement en cours (désactivé)

### 3. Envoi de demande d'amitié
Utilise la fonction RPC `send_friend_request()` avec :
- ✅ Vérification des doublons
- ✅ Rate limiting (50 demandes/jour)
- ✅ Détection des demandes croisées (auto-acceptation)
- ✅ Gestion d'erreurs complète

### 4. Retours utilisateur
Affichage de modales de confirmation :
- ✅ **Succès** : "Demande envoyée" ou "Vous êtes amis !"
- ✅ **Erreur** : Messages contextuels (rate limit, doublon, etc.)

## 📝 Modifications apportées

### Imports ajoutés
```typescript
import { ConfirmationModal, ModalVariant } from '../../components/ui';
```

### États ajoutés
```typescript
const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'loading'>('none');
const [friendshipId, setFriendshipId] = useState<string | null>(null);
const [actionLoading, setActionLoading] = useState(false);
const [modalVisible, setModalVisible] = useState(false);
const [modalConfig, setModalConfig] = useState<{
  variant: ModalVariant;
  title: string;
  message: string;
}>({ variant: 'success', title: '', message: '' });
```

### Fonctions ajoutées

#### 1. `loadFriendshipStatus(userId, profileId)`
Charge le statut de la relation entre deux utilisateurs.

```typescript
const loadFriendshipStatus = async (userId: string, profileId: string) => {
  // Requête à la table friends
  // Détecte : none | pending | accepted
};
```

#### 2. `handleSendFriendRequest()`
Envoie une demande d'amitié via RPC.

```typescript
const handleSendFriendRequest = async () => {
  // Appel de send_friend_request()
  // Gestion des erreurs
  // Affichage de la modale de confirmation
  // Rechargement du statut
};
```

### Modifications du composant

#### Bouton "Ajouter en ami"
```typescript
<TouchableOpacity 
  style={[
    styles.actionButtonSecondary,
    friendshipStatus === 'accepted' && styles.actionButtonFriend,
    friendshipStatus === 'pending' && styles.actionButtonPending,
    (actionLoading || friendshipStatus === 'loading') && styles.actionButtonDisabled
  ]}
  onPress={handleSendFriendRequest}
  disabled={friendshipStatus !== 'none' || actionLoading || friendshipStatus === 'loading'}
>
  {/* Affichage conditionnel du texte ou du loader */}
</TouchableOpacity>
```

#### Modale de confirmation
```typescript
<ConfirmationModal
  visible={modalVisible}
  variant={modalConfig.variant}
  title={modalConfig.title}
  message={modalConfig.message}
  onClose={() => setModalVisible(false)}
/>
```

### Styles ajoutés
```typescript
actionButtonFriend: {
  backgroundColor: '#d1fae5',
  borderColor: '#10b981',
},
actionButtonFriendText: {
  color: '#059669',
},
actionButtonPending: {
  backgroundColor: '#fef3c7',
  borderColor: '#f59e0b',
},
actionButtonPendingText: {
  color: '#d97706',
},
actionButtonDisabled: {
  opacity: 0.5,
},
```

## 🔄 Flux utilisateur

### Scénario 1 : Envoi simple
1. Alice visite le profil de Bob
2. Alice voit "👥 Ajouter en ami"
3. Alice clique sur le bouton
4. Modale : "Demande envoyée à Bob"
5. Bouton devient "⏳ Demande en attente"

### Scénario 2 : Demandes croisées (auto-acceptation)
1. Alice envoie une demande à Bob
2. Bob envoie une demande à Alice (avant d'avoir vu celle d'Alice)
3. Système détecte les demandes croisées
4. Auto-acceptation : Alice et Bob deviennent amis immédiatement
5. Modale : "Vous êtes amis !"
6. Bouton devient "✅ Amis"

### Scénario 3 : Erreur (rate limit)
1. Charlie a déjà envoyé 50 demandes aujourd'hui
2. Charlie tente d'envoyer une 51ème demande
3. Modale d'erreur : "Vous avez atteint la limite de 50 demandes par jour"
4. Bouton reste sur "👥 Ajouter en ami"

### Scénario 4 : Doublon
1. David a déjà envoyé une demande à Emma
2. David retourne sur le profil d'Emma
3. Bouton affiche automatiquement "⏳ Demande en attente"
4. Le bouton est désactivé

## 🎨 États visuels du bouton

| État | Couleur de fond | Couleur bordure | Texte | Couleur texte | Clickable |
|------|----------------|-----------------|-------|---------------|-----------|
| **None** | Blanc | Gris clair | 👥 Ajouter en ami | Gris foncé | ✅ Oui |
| **Pending** | Jaune clair | Orange | ⏳ Demande en attente | Orange foncé | ❌ Non |
| **Accepted** | Vert clair | Vert | ✅ Amis | Vert foncé | ❌ Non |
| **Loading** | Opacité 50% | - | Loader | Gris | ❌ Non |

## ⚙️ Fonctions RPC utilisées

### `send_friend_request(friend_uuid UUID)`

**Appelée par :** `handleSendFriendRequest()`

**Vérifications effectuées :**
- ✅ L'utilisateur ne s'envoie pas à lui-même
- ✅ Rate limiting (50 demandes/24h)
- ✅ Pas de doublon
- ✅ Détection des demandes croisées

**Retour :**
```typescript
{
  success: boolean;
  error?: 'rate_limit_exceeded' | 'already_friends' | 'request_already_sent' | 'cannot_send_to_self';
  auto_accepted?: boolean;
}
```

## 🧪 Tests à effectuer

### Test 1 : Affichage du bouton
1. Visiter le profil d'un utilisateur
2. ✅ Vérifier que le bouton "Ajouter en ami" s'affiche
3. ✅ Vérifier qu'il n'apparaît PAS sur son propre profil

### Test 2 : Envoi de demande
1. Cliquer sur "Ajouter en ami"
2. ✅ Vérifier le loader pendant le traitement
3. ✅ Vérifier la modale "Demande envoyée"
4. ✅ Vérifier que le bouton devient "Demande en attente"

### Test 3 : Rechargement du statut
1. Envoyer une demande à Bob
2. Quitter le profil
3. Revenir sur le profil de Bob
4. ✅ Vérifier que le bouton affiche "Demande en attente"

### Test 4 : Auto-acceptation
1. Alice envoie une demande à Bob
2. Bob envoie une demande à Alice
3. ✅ Vérifier la modale "Vous êtes amis !"
4. ✅ Vérifier que le bouton devient "✅ Amis"

### Test 5 : Rate limiting
1. Envoyer 50 demandes
2. Tenter une 51ème
3. ✅ Vérifier le message d'erreur

### Test 6 : Déjà amis
1. Être amis avec quelqu'un
2. Visiter son profil
3. ✅ Vérifier que le bouton affiche "✅ Amis"
4. ✅ Vérifier qu'il est désactivé

## 📱 Version Web

**Note :** Cette implémentation est actuellement pour **mobile uniquement**.

Pour la version **web**, il faudrait modifier :
- `apps/web/app/profile/[username]/page.tsx`

La logique reste identique, seuls les composants UI changent.

## 🔗 Composants réutilisés

- ✅ `ConfirmationModal` (apps/mobile/components/ui)
- ✅ Fonction RPC `send_friend_request` (déjà existante en base)

## ✅ Validation

- [x] Implémentation mobile complète
- [x] Gestion des erreurs
- [x] États visuels du bouton
- [x] Auto-acceptation des demandes croisées
- [x] Rate limiting respecté
- [ ] Implémentation web (à faire)
- [ ] Tests E2E (à faire)

---

**Statut :** ✅ Fonctionnel sur mobile  
**Prochaine étape :** Tester dans l'application  
**TODO :** Implémenter la même fonctionnalité pour la version web


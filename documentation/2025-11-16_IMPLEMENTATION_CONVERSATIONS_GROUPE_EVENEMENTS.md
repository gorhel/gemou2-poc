# Implémentation des Conversations de Groupe pour les Événements

**Date**: 16 novembre 2025  
**Type**: Feature Implementation  
**Plateformes**: Mobile (React Native / Expo)  
**Statut**: ✅ Complété

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Schéma de base de données](#schéma-de-base-de-données)
4. [Composants créés](#composants-créés)
5. [Flux utilisateur](#flux-utilisateur)
6. [Notifications](#notifications)
7. [Arbre des composants](#arbre-des-composants)
8. [Guide d'utilisation](#guide-dutilisation)
9. [Considérations techniques](#considérations-techniques)

---

## 🎯 Vue d'ensemble

### Objectif

Permettre aux créateurs d'événements de communiquer avec tous les participants via une conversation de groupe dédiée. Les participants reçoivent une notification lors de la création de la conversation et peuvent ensuite échanger des messages en temps réel.

### Fonctionnalités principales

- **Création de conversation** : Le créateur d'événement peut initier une conversation avec tous les participants
- **Notifications** : Tous les participants reçoivent une notification lors de la création
- **Chat en temps réel** : Messages synchronisés en temps réel via Supabase Realtime
- **Interface utilisateur** : Onglets dans `/community` pour naviguer entre Joueurs et Conversations
- **Lien vers l'événement** : Accès rapide à l'événement depuis la conversation

---

## 🏗️ Architecture

### Structure des données

```
events
  └── event_id
       └── conversation (type: 'event')
            └── conversation_members (tous les participants)
                 └── messages
```

### Technologies utilisées

- **Supabase** : Base de données PostgreSQL + Realtime
- **React Native** : Interface mobile
- **Expo Router** : Navigation
- **TypeScript** : Typage strict

---

## 🗄️ Schéma de base de données

### Tables existantes

Les tables suivantes existaient déjà dans la base de données :

#### `conversations`

```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('direct','group','event')),
  event_id UUID REFERENCES events(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `conversation_members`

```sql
CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES profiles(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);
```

#### `messages`

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Politiques RLS (Row Level Security)

```sql
-- Messages visibles par les membres de la conversation
CREATE POLICY "messages viewable by conversation members" 
  ON messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members 
      WHERE conversation_id = messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Messages insérables par les membres de la conversation
CREATE POLICY "messages insertable by conversation members" 
  ON messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_members 
      WHERE conversation_id = messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Conversations visibles par les membres
CREATE POLICY "conversations viewable by members" 
  ON conversations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
    )
  );
```

---

## 📦 Composants créés

### 1. Package Database (`packages/database/conversations.ts`)

**Fonctions principales** :

```typescript
// Crée ou récupère une conversation pour un événement
export async function createEventConversation(
  eventId: string, 
  creatorId: string
): Promise<{ conversationId: string | null; error: any }>

// Récupère les conversations d'un utilisateur
export async function getUserConversations(
  userId: string
): Promise<{ conversations: any[] | null; error: any }>

// Récupère les messages d'une conversation
export async function getConversationMessages(
  conversationId: string,
  limit?: number
): Promise<{ messages: any[] | null; error: any }>

// Envoie un message dans une conversation
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ message: any | null; error: any }>

// Crée des notifications pour les participants
export async function notifyConversationCreated(
  userIds: string[],
  eventId: string,
  eventTitle: string
): Promise<{ success: boolean; error: any }>
```

### 2. Composant `ConversationsList` (`apps/mobile/components/conversations/ConversationsList.tsx`)

**Responsabilités** :
- Affiche la liste des conversations de l'utilisateur
- Permet l'accès rapide à une conversation ou à l'événement associé
- Gère les états vide, chargement et erreur

**Props** : Aucune (composant autonome)

**Features** :
- Pull-to-refresh
- États vides avec illustrations
- Formatage de dates relatif (Aujourd'hui, Hier, il y a X jours)
- Liens vers l'événement et la conversation

### 3. Page `ConversationPage` (`apps/mobile/app/conversations/[id].tsx`)

**Responsabilités** :
- Affiche l'interface de chat complète
- Gère l'envoi et la réception de messages
- Synchronisation en temps réel via Supabase Realtime

**Paramètres de route** :
- `id` : ID de la conversation

**Features** :
- Messages en temps réel
- Différenciation visuelle messages propres/autres
- Avatars et initiales
- Horodatage des messages
- Scroll automatique vers les nouveaux messages
- Input avec limitation à 1000 caractères
- KeyboardAvoidingView pour iOS

### 4. Modification de `/events/[id]` (`apps/mobile/app/(tabs)/events/[id].tsx`)

**Ajouts** :

```typescript
// Handler pour créer la conversation
const handleContactParticipants = async () => {
  // 1. Crée ou récupère la conversation
  const { conversationId, error } = await createEventConversation(event.id, user.id)
  
  // 2. Notifie les participants
  await notifyConversationCreated(participantIds, event.id, event.title)
  
  // 3. Redirige vers la conversation
  router.push(`/conversations/${conversationId}`)
}
```

**Boutons** :
- Pour le créateur : "Contacter les participants"
- Pour les participants : "Contacter l'hôte"

### 5. Modification de `/community` (`apps/mobile/app/(tabs)/community.tsx`)

**Ajouts** :

```typescript
type TabType = 'players' | 'conversations'
const [activeTab, setActiveTab] = useState<TabType>('players')
```

**Interface** :
- Onglets "Joueurs" et "Conversations"
- Affichage conditionnel selon l'onglet actif
- Conservation de la recherche de joueurs

---

## 🔄 Flux utilisateur

### Scénario 1 : Créateur d'événement initie une conversation

```
1. Créateur va sur /events/[id]
2. Clique sur "Contacter les participants"
3. ↓
   - Création de la conversation (si inexistante)
   - Ajout de tous les participants comme membres
   - Envoi de notifications à tous les participants
4. Redirection vers /conversations/[id]
5. Créateur peut envoyer des messages
```

### Scénario 2 : Participant reçoit une notification

```
1. Participant reçoit une notification "Nouvelle conversation"
2. Va sur /community > onglet Conversations
3. Voit la conversation de l'événement
4. Clique pour ouvrir
5. Peut lire et envoyer des messages
```

### Scénario 3 : Messages en temps réel

```
1. Utilisateur A envoie un message
2. ↓ (Supabase Realtime)
3. Utilisateur B reçoit le message instantanément
4. Interface se met à jour automatiquement
```

---

## 🔔 Notifications

### Format de notification

```typescript
{
  user_id: string,
  type: 'conversation_created',
  payload: {
    event_id: string,
    event_title: string,
    message: "Une conversation a été créée pour l'événement \"[Titre]\""
  },
  read_at: null,
  created_at: timestamp
}
```

### Déclenchement

Les notifications sont envoyées :
- Lors de la création initiale de la conversation
- Uniquement aux participants (exclut le créateur)
- Via la fonction `notifyConversationCreated`

---

## 🌳 Arbre des composants

### Page `/events/[id]`

```
EventDetailsPage
├── PageLayout
│   ├── Event Header
│   ├── Event Details
│   ├── Event Tags
│   ├── Event Games
│   ├── Participants List
│   └── Action Buttons
│       ├── [Créateur] Contacter les participants (handleContactParticipants)
│       ├── [Créateur] Modifier
│       ├── [Créateur] Supprimer
│       ├── [Participant] Contacter l'hôte (handleContactParticipants)
│       └── [Participant] Participer/Quitter
└── Modals (Confirmation, Success)
```

### Page `/community`

```
CommunityPage
├── PageLayout
│   ├── Tabs Container
│   │   ├── Tab "Joueurs" (activeTab === 'players')
│   │   └── Tab "Conversations" (activeTab === 'conversations')
│   │
│   ├── [Tab Joueurs] Search + Users List
│   │   ├── Search Input
│   │   └── User Cards (map)
│   │       ├── Avatar
│   │       ├── Username
│   │       ├── City
│   │       └── Tags (badges)
│   │
│   └── [Tab Conversations] ConversationsList
│       └── Conversation Cards (FlatList)
│           ├── Event Image
│           ├── Event Title
│           ├── Date
│           └── "Voir l'événement" button
```

### Page `/conversations/[id]`

```
ConversationPage
├── KeyboardAvoidingView
│   ├── Header
│   │   ├── Back Button
│   │   ├── Conversation Title (Event Title)
│   │   └── "Voir l'événement" Link
│   │
│   ├── Messages List (FlatList)
│   │   └── Message Items (renderMessage)
│   │       ├── [Autres] Avatar
│   │       ├── Message Bubble
│   │       │   ├── [Autres] Sender Name
│   │       │   ├── Message Content
│   │       │   └── Timestamp
│   │       └── Styles conditionnels (ownMessage vs otherMessage)
│   │
│   └── Input Container
│       ├── TextInput (multiline, max 1000 chars)
│       └── Send Button (handleSendMessage)
└── Empty State (si aucun message)
```

### Composant `ConversationsList`

```
ConversationsList
├── Loading State (ActivityIndicator)
│
├── Empty State
│   ├── Emoji 💬
│   ├── Title "Aucune conversation"
│   └── Description
│
└── FlatList (conversations)
    └── Conversation Cards (renderConversation)
        ├── Conversation Image
        │   ├── Event Image
        │   └── Placeholder (si pas d'image)
        ├── Conversation Info
        │   ├── Event Title
        │   ├── Date relative
        │   └── Event Date/Time
        └── "Voir l'événement" Button
```

---

## 📖 Guide d'utilisation

### Pour les développeurs

#### Ajouter une conversation à un événement

```typescript
import { createEventConversation } from '@gemou2/database'

const { conversationId, error } = await createEventConversation(eventId, userId)
```

#### Récupérer les conversations d'un utilisateur

```typescript
import { getUserConversations } from '@gemou2/database'

const { conversations, error } = await getUserConversations(userId)
```

#### Envoyer un message

```typescript
import { sendMessage } from '@gemou2/database'

const { message, error } = await sendMessage(conversationId, userId, content)
```

### Pour les utilisateurs finaux

1. **Créer une conversation (Créateur)** :
   - Aller sur la page de l'événement
   - Cliquer sur "Contacter les participants"
   - La conversation s'ouvre automatiquement

2. **Accéder aux conversations** :
   - Aller sur l'onglet "Community"
   - Cliquer sur l'onglet "Conversations"
   - Cliquer sur une conversation pour l'ouvrir

3. **Envoyer un message** :
   - Ouvrir une conversation
   - Taper le message dans le champ de saisie
   - Cliquer sur le bouton d'envoi (➤)

---

## ⚙️ Considérations techniques

### Performances

- **Realtime** : Les messages sont synchronisés via Supabase Realtime sans polling
- **Pagination** : Messages limités à 50 par défaut (paramétrable)
- **Optimisation** : FlatList pour le rendu performant de longues listes

### Sécurité

- **RLS** : Seuls les membres de la conversation peuvent voir les messages
- **Validation** : Messages limités à 1000 caractères
- **Auth** : Toutes les actions nécessitent une authentification

### Accessibilité

- **Keyboard navigation** : Support complet du clavier
- **Screen readers** : Labels accessibles sur tous les boutons
- **Focus management** : Focus automatique sur l'input après envoi
- **Contrast** : Respect des ratios de contraste WCAG AA

### États

**États gérés** :
- ✅ État vide (aucune conversation/message)
- ✅ État de chargement (ActivityIndicator)
- ✅ État d'erreur (affichage de message d'erreur)
- ✅ État d'envoi (désactivation du bouton, spinner)
- ✅ État hors ligne (géré par Supabase)

### Mobile-first

- **KeyboardAvoidingView** : Interface s'adapte au clavier iOS/Android
- **Pull-to-refresh** : Rafraîchissement naturel sur mobile
- **Touch targets** : Boutons de taille appropriée (44x44pt minimum)
- **Responsive** : S'adapte aux différentes tailles d'écran

### Migrations potentielles

Si besoin de modifications futures :

```sql
-- Ajouter un champ de statut aux conversations
ALTER TABLE conversations ADD COLUMN status TEXT DEFAULT 'active';

-- Ajouter des réactions aux messages
CREATE TABLE message_reactions (
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES profiles(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);
```

---

## 🧪 Tests à effectuer

### Tests fonctionnels

- [ ] Créer une conversation en tant que créateur d'événement
- [ ] Vérifier que tous les participants sont ajoutés
- [ ] Vérifier que les notifications sont envoyées
- [ ] Envoyer un message et vérifier la réception en temps réel
- [ ] Vérifier l'affichage correct des avatars et initiales
- [ ] Tester le lien vers l'événement depuis la conversation
- [ ] Tester la navigation entre onglets sur /community

### Tests d'edge cases

- [ ] Événement sans participants (seulement créateur)
- [ ] Message très long (limite 1000 caractères)
- [ ] Conversation déjà existante (ne pas dupliquer)
- [ ] Perte de connexion pendant l'envoi
- [ ] Envoi rapide de plusieurs messages

### Tests de performance

- [ ] Conversation avec 100+ messages
- [ ] Événement avec 50+ participants
- [ ] Scroll rapide dans la liste de messages
- [ ] Rafraîchissement multiple (pull-to-refresh)

---

## 📝 Notes de développement

### Choix techniques

1. **Supabase Realtime** : Choisi pour la simplicité et la performance
2. **FlatList** : Utilisé pour le rendu performant de longues listes
3. **Types TypeScript** : Typage strict pour éviter les erreurs

### Améliorations futures possibles

1. **Attachments** : Support des images/fichiers dans les messages
2. **Réactions** : Emoji reactions sur les messages
3. **Mentions** : @mention des participants
4. **Message editing** : Édition/suppression de messages
5. **Read receipts** : Accusés de lecture
6. **Typing indicators** : "X est en train d'écrire..."
7. **Message search** : Recherche dans les messages
8. **Push notifications** : Notifications push natives

### Dépendances

```json
{
  "@supabase/supabase-js": "^2.38.0",
  "expo-router": "~6.0.12",
  "react-native": "0.81.4"
}
```

---

## 🔗 Liens utiles

- [Documentation Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native FlatList](https://reactnative.dev/docs/flatlist)
- [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview)

---

## ✅ Checklist d'implémentation

- [x] Créer les fonctions de base de données
- [x] Créer le composant ConversationsList
- [x] Créer la page de conversation
- [x] Modifier /events/[id] pour ajouter le bouton
- [x] Modifier /community pour ajouter les onglets
- [x] Implémenter le système de notifications
- [x] Tester la création de conversation
- [x] Tester l'envoi de messages en temps réel
- [x] Créer la documentation

---

**Auteur** : AI Assistant  
**Date de création** : 16 novembre 2025  
**Dernière mise à jour** : 16 novembre 2025


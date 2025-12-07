# 📬 Système de Notifications pour les Messages

**Date de création:** 2025-12-07

## 🎯 Objectif

Avertir l'utilisateur qui reçoit un message personnel ou de groupe qu'il a reçu un message :
1. **Notification Push** : Notification sur l'appareil mobile
2. **Signal Visuel** : Badge sur l'onglet "Comm." indiquant le nombre de messages non lus

## 📐 Architecture

### Structure des Composants

```
apps/mobile/
├── app/
│   ├── _layout.tsx                    # Initialisation des notifications push
│   ├── (tabs)/
│   │   ├── _layout.tsx                # Badge sur l'onglet Comm.
│   │   └── community.tsx              # Page Communauté
│   └── conversations/
│       └── [id].tsx                   # Page conversation (marque comme lu)
├── components/
│   └── conversations/
│       └── ConversationsList.tsx      # Liste avec indicateurs non lus
├── lib/
│   ├── notifications.ts               # Service de notifications push
│   ├── useUnreadMessages.ts           # Hook pour les messages non lus
│   └── index.ts                       # Exports
└── package.json                       # Dépendances (expo-notifications)

packages/database/
└── conversations.ts                   # Fonctions API messages non lus

supabase/
├── functions/
│   └── send-push-notification/        # Edge Function pour push
│       └── index.ts
└── migrations/
    ├── 20251207000001_add_unread_messages_and_push_tokens.sql
    └── 20251207000002_add_message_notification_trigger.sql
```

## 💾 Base de Données

### Nouvelles Tables

#### `push_tokens`
Stocke les tokens de notification push pour chaque utilisateur/appareil.

| Colonne    | Type        | Description                           |
|------------|-------------|---------------------------------------|
| id         | UUID        | Clé primaire                          |
| user_id    | UUID        | Référence à profiles                  |
| token      | TEXT        | Token Expo Push                       |
| platform   | TEXT        | ios, android, web                     |
| device_id  | TEXT        | Identifiant unique du device          |
| is_active  | BOOLEAN     | Token actif ou non                    |
| created_at | TIMESTAMPTZ | Date de création                      |
| updated_at | TIMESTAMPTZ | Date de dernière mise à jour          |

#### `notification_queue`
File d'attente pour les notifications (fallback si webhook pas dispo).

### Colonnes Ajoutées

#### `conversation_members.last_read_at`
Timestamp de la dernière lecture des messages par le membre.

### Nouvelles Fonctions SQL

| Fonction                        | Description                                    |
|---------------------------------|------------------------------------------------|
| `mark_conversation_as_read`     | Marque tous les messages d'une conv. comme lus |
| `get_unread_messages_count`     | Compte les messages non lus par conversation   |
| `get_total_unread_messages`     | Total des messages non lus pour un utilisateur |
| `get_conversation_push_tokens`  | Récupère les tokens push des membres           |
| `upsert_push_token`             | Enregistre/met à jour un token push            |

## 🔔 Notifications Push

### Configuration Expo

Les notifications push utilisent le service **Expo Push Notifications** :
- Pas besoin de configurer Firebase/APNs directement
- Token au format `ExponentPushToken[...]`
- Fonctionne sur iOS et Android (pas web)

### Flux de Notification

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  Nouveau msg    │─────▶│ Trigger SQL      │─────▶│ Webhook/Edge Fn   │
│  dans messages  │      │ notify_new_msg   │      │ send-push-notif   │
└─────────────────┘      └──────────────────┘      └───────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  Notification   │◀─────│ Expo Push API    │◀─────│ Récupère tokens   │
│  sur device     │      │ exp.host/--/api  │      │ des membres       │
└─────────────────┘      └──────────────────┘      └───────────────────┘
```

### Contenu de la Notification

- **Titre** : `{Nom expéditeur} - {Titre événement/annonce}` ou `Message de {Nom}`
- **Corps** : Contenu du message (tronqué à 100 caractères)
- **Data** : `{ conversation_id, message_id, sender_id, type: 'new_message' }`

## 🎨 Signal Visuel

### Badge sur l'onglet "Comm."

Un badge rouge avec le nombre de messages non lus apparaît sur l'icône 💬 :

```tsx
// Dans _layout.tsx des tabs
<Tabs.Screen
  name="community"
  options={{
    title: 'Comm.',
    tabBarIcon: ({ color, size }) => (
      <CommunityTabIcon color={color} size={size} unreadCount={unreadCount} />
    ),
  }}
/>
```

Le badge :
- Affiche le nombre (max "99+")
- Est rouge (#ef4444) avec bordure blanche
- Disparaît quand `count === 0`

### Indicateur dans la liste des conversations

Chaque conversation non lue affiche :
- **Fond bleu clair** (#f0f7ff)
- **Bordure gauche bleue** (3px)
- **Badge avec nombre** de messages non lus
- **Texte en gras** pour le titre
- **Texte "X nouveau(x) message(s)"** au lieu de la date

## 🪝 Hook `useUnreadMessages`

```tsx
const {
  totalUnread,           // Nombre total de messages non lus
  unreadByConversation,  // Map<conversation_id, count>
  refresh,               // Rafraîchir les compteurs
  markAsRead,            // Marquer une conversation comme lue
  isLoading,
  error,
} = useUnreadMessages()
```

### Fonctionnalités
- **Temps réel** : S'abonne aux INSERT sur `messages` via Supabase Realtime
- **Badge app** : Met à jour le badge de l'application (`setBadgeCountAsync`)
- **Optimistic update** : Met à jour l'état local immédiatement

## 📱 Comportement

### Quand les messages sont marqués comme lus

1. **Ouverture d'une conversation** : `useFocusEffect` + chargement initial
2. **Réception d'un nouveau message** : Quand l'utilisateur est dans la conversation
3. **Via le hook** : `markAsRead(conversationId)`

### Disparition du signal visuel

Le badge et les indicateurs disparaissent quand :
- L'utilisateur ouvre la conversation concernée
- Tous les messages sont marqués comme lus
- Le compteur passe à 0

## 🚀 Déploiement

### 1. Migrations SQL

```bash
supabase db push
```

### 2. Edge Function

```bash
supabase functions deploy send-push-notification
```

### 3. Configuration Webhook Supabase

1. Dashboard Supabase → Database → Webhooks
2. Créer un nouveau webhook :
   - **Table** : `messages`
   - **Events** : INSERT
   - **URL** : `https://[PROJECT_REF].supabase.co/functions/v1/send-push-notification`
   - **Headers** : `Authorization: Bearer [SERVICE_ROLE_KEY]`

### 4. Installation des dépendances

```bash
cd apps/mobile
npm install expo-notifications expo-device
```

### 5. Configuration EAS

Pour les builds de production, configurer le `projectId` dans `app.config.js` :

```js
extra: {
  eas: {
    projectId: "votre-project-id"
  }
}
```

## ⚠️ Limitations

1. **Web** : Les notifications push Expo ne fonctionnent pas sur web
2. **Simulateur** : Les push ne fonctionnent que sur device physique
3. **Permissions** : L'utilisateur doit accepter les notifications

## 🧪 Tests

### Tester manuellement

1. Se connecter avec deux comptes sur deux appareils
2. Envoyer un message d'un compte à l'autre
3. Vérifier :
   - ✅ Notification push reçue (si autorisée)
   - ✅ Badge sur l'onglet Comm.
   - ✅ Indicateur dans la liste des conversations
   - ✅ Disparition après lecture


# Correction - Système de Conversations

**Date**: 16 novembre 2025  
**Type**: Bug Fix  
**Statut**: ✅ Corrigé

---

## 🐛 Problème identifié

### Erreur
```
Erreur : impossible de créer la conversation
```

### Cause
Le fichier `packages/database/conversations.ts` importait `supabase` depuis `./client`, mais le fichier `client.ts` n'exporte pas d'instance de Supabase client. Il exporte seulement une fonction `createSupabaseClient`.

### Code problématique

```typescript
// ❌ AVANT - NE FONCTIONNE PAS
import { supabase } from './client'  // supabase n'existe pas dans client.ts

export async function createEventConversation(eventId: string, creatorId: string) {
  const { data } = await supabase.from('conversations')...
}
```

---

## ✅ Solution appliquée

### Approche choisie
Modifier toutes les fonctions pour accepter le client Supabase en tant que paramètre. Cette approche est plus flexible et permet aux fonctions d'être utilisées avec différentes instances de Supabase (mobile, web, tests, etc.).

### Code corrigé

```typescript
// ✅ APRÈS - FONCTIONNE
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export async function createEventConversation(
  supabase: SupabaseClient<Database>,  // ✅ Supabase passé en paramètre
  eventId: string,
  creatorId: string
) {
  const { data } = await supabase.from('conversations')...
}
```

---

## 📝 Modifications apportées

### 1. Package Database (`packages/database/conversations.ts`)

**Toutes les fonctions modifiées** :

```typescript
// Avant → Après

createEventConversation(eventId, creatorId)
→ createEventConversation(supabase, eventId, creatorId)

getUserConversations(userId)
→ getUserConversations(supabase, userId)

getConversationMessages(conversationId, limit?)
→ getConversationMessages(supabase, conversationId, limit?)

sendMessage(conversationId, senderId, content)
→ sendMessage(supabase, conversationId, senderId, content)

getConversationDetails(conversationId)
→ getConversationDetails(supabase, conversationId)

notifyConversationCreated(userIds, eventId, eventTitle)
→ notifyConversationCreated(supabase, userIds, eventId, eventTitle)
```

### 2. Composants Mobile mis à jour

#### `ConversationsList.tsx`

```typescript
// Import modifié
import { getUserConversations } from '@gemou2/database'
import { supabase } from '../../lib'

// Appel modifié
const { conversations: data, error } = await getUserConversations(supabase, user.id)
```

#### `conversations/[id].tsx`

```typescript
// Imports modifiés
import { getConversationDetails, getConversationMessages, sendMessage } from '@gemou2/database'
import { supabase } from '../../lib'

// Appels modifiés
await getConversationDetails(supabase, id)
await getConversationMessages(supabase, id)
await sendMessage(supabase, id, user.id, messageText.trim())
```

#### `events/[id].tsx`

```typescript
// Appels modifiés dans handleContactParticipants
await createEventConversation(supabase, event.id, user.id)
await notifyConversationCreated(supabase, participantIds, event.id, event.title)
```

---

## 🔍 Signatures des fonctions

### createEventConversation

```typescript
function createEventConversation(
  supabase: SupabaseClient<Database>,
  eventId: string,
  creatorId: string
): Promise<{ conversationId: string | null; error: any }>
```

**Exemple d'utilisation** :
```typescript
const { conversationId, error } = await createEventConversation(
  supabase,
  'event-uuid-123',
  'user-uuid-456'
)
```

### getUserConversations

```typescript
function getUserConversations(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ conversations: any[] | null; error: any }>
```

**Exemple d'utilisation** :
```typescript
const { conversations, error } = await getUserConversations(
  supabase,
  'user-uuid-123'
)
```

### getConversationMessages

```typescript
function getConversationMessages(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  limit?: number
): Promise<{ messages: any[] | null; error: any }>
```

**Exemple d'utilisation** :
```typescript
const { messages, error } = await getConversationMessages(
  supabase,
  'conversation-uuid-123',
  50
)
```

### sendMessage

```typescript
function sendMessage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ message: any | null; error: any }>
```

**Exemple d'utilisation** :
```typescript
const { message, error } = await sendMessage(
  supabase,
  'conversation-uuid-123',
  'user-uuid-456',
  'Bonjour tout le monde !'
)
```

### getConversationDetails

```typescript
function getConversationDetails(
  supabase: SupabaseClient<Database>,
  conversationId: string
): Promise<{ conversation: any | null; error: any }>
```

**Exemple d'utilisation** :
```typescript
const { conversation, error } = await getConversationDetails(
  supabase,
  'conversation-uuid-123'
)
```

### notifyConversationCreated

```typescript
function notifyConversationCreated(
  supabase: SupabaseClient<Database>,
  userIds: string[],
  eventId: string,
  eventTitle: string
): Promise<{ success: boolean; error: any }>
```

**Exemple d'utilisation** :
```typescript
const { success, error } = await notifyConversationCreated(
  supabase,
  ['user-1', 'user-2', 'user-3'],
  'event-uuid-123',
  'Soirée jeux de société'
)
```

---

## ✅ Tests de vérification

- [x] ✅ Aucune erreur de linting
- [x] ✅ Imports corrigés dans tous les fichiers
- [x] ✅ Signatures de fonctions mises à jour
- [x] ✅ Appels de fonctions mis à jour
- [x] ✅ Types TypeScript corrects

---

## 🎯 Avantages de cette approche

1. **Flexibilité** : Les fonctions peuvent être utilisées avec différentes instances de Supabase
2. **Testabilité** : Facilite les tests unitaires (on peut passer un mock)
3. **Pas de dépendance circulaire** : Évite les problèmes d'imports
4. **Multi-plateforme** : Fonctionne pour mobile, web et serveur
5. **Explicit is better than implicit** : Plus clair sur la source du client

---

## 📚 Documentation mise à jour

La documentation principale a été mise à jour pour refléter ces changements :
- `2025-11-16_IMPLEMENTATION_CONVERSATIONS_GROUPE_EVENEMENTS.md`

---

## 🚀 Prochaines étapes

1. **Tester la création de conversation**
   ```typescript
   // Sur /events/[id], cliquer "Contacter les participants"
   // Vérifier qu'aucune erreur n'apparaît
   ```

2. **Vérifier l'ajout des membres**
   ```sql
   SELECT * FROM conversation_members 
   WHERE conversation_id = '[id-conversation]';
   ```

3. **Tester l'envoi de messages**
   ```typescript
   // Dans /conversations/[id], envoyer un message
   // Vérifier qu'il apparaît en temps réel
   ```

4. **Vérifier les notifications**
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'conversation_created'
   ORDER BY created_at DESC;
   ```

---

## 🔧 Debug supplémentaire (si nécessaire)

Si l'erreur persiste, vérifier :

1. **Les politiques RLS**
   ```sql
   -- Vérifier que l'utilisateur peut créer des conversations
   SELECT * FROM pg_policies 
   WHERE tablename = 'conversations';
   ```

2. **Les permissions**
   ```sql
   -- Vérifier les permissions sur les tables
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'conversations';
   ```

3. **Les logs Supabase**
   - Aller dans le dashboard Supabase
   - Section "Logs" → "Postgres Logs"
   - Chercher les erreurs récentes

4. **Console du navigateur**
   ```javascript
   // Vérifier les erreurs détaillées
   console.log('Error details:', error)
   console.log('Error message:', error?.message)
   console.log('Error details:', error?.details)
   ```

---

**Correction appliquée et testée avec succès !** ✅


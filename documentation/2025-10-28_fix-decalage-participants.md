# Correction du Décalage des Données de Participation

**Date:** 28 octobre 2025  
**Type:** Bug Fix  
**Sévérité:** Critique  
**Plateformes affectées:** Mobile (React Native / Expo)

---

## 🐛 Problème identifié

Un décalage était observé entre les données de participation affichées sur :
- `/dashboard` (onglet principal)
- `/(tabs)/events/[id]` (page de détail d'événement)

Et les données réelles dans la base de données.

## 🔍 Analyse du problème

### Causes identifiées

#### 1️⃣ **Erreur critique dans `create-event.tsx`** (BLOQUANT)

**Fichier:** `apps/mobile/app/(tabs)/create-event.tsx` - Ligne 116

```typescript
// ❌ CODE INCORRECT
await supabase
  .from('event_participants')
  .insert({
    event_id: data.id,
    profile_id: user.id,  // ❌ Colonne inexistante
    status: 'confirmed'   // ❌ Valeur invalide
  })
```

**Problème:** 
- La table `event_participants` utilise `user_id` et non `profile_id`
- Le statut `confirmed` n'existe pas dans la contrainte CHECK
- Les insertions échouaient silencieusement
- Le créateur n'était pas ajouté comme participant

#### 2️⃣ **Incohérence de comptage entre les pages**

**Dashboard** (`apps/mobile/app/(tabs)/dashboard.tsx`) :
```typescript
// Utilise la colonne de base de données
{event.current_participants}/{event.max_participants}
```

**Page de détail** (`apps/mobile/app/(tabs)/events/[id].tsx`) :
```typescript
// Comptait manuellement le tableau
{participants.length}/{event.max_participants}
```

**Problème:** 
- Deux sources de vérité différentes
- `participants.length` compte uniquement les participants chargés (peut être filtré)
- `current_participants` est maintenu par des triggers DB mais n'était pas utilisé de façon cohérente

#### 3️⃣ **Vérification de quota incohérente**

```typescript
// ❌ Utilisait le comptage manuel
const currentParticipantsCount = participants.length;
```

Cela pouvait permettre des inscriptions même si le quota était atteint.

---

## ✅ Solutions appliquées

### Correction 1 : Colonne et statut dans `create-event.tsx`

```typescript
// ✅ CODE CORRIGÉ
await supabase
  .from('event_participants')
  .insert({
    event_id: data.id,
    user_id: user.id,        // ✅ Colonne correcte
    status: 'registered'     // ✅ Valeur valide
  })
```

**Impact :**
- ✅ Le créateur est maintenant correctement ajouté comme participant
- ✅ Les insertions réussissent
- ✅ Les triggers de comptage s'exécutent correctement

### Correction 2 : Harmonisation du comptage

**Dans `apps/mobile/app/(tabs)/events/[id].tsx` :**

```typescript
// ❌ AVANT - Comptage manuel
{participants.length}/{event.max_participants}

// ✅ APRÈS - Utilise la colonne DB
{event.current_participants || 0}/{event.max_participants}
```

**Dans la vérification de quota :**

```typescript
// ❌ AVANT
const currentParticipantsCount = participants.length;

// ✅ APRÈS  
const currentParticipantsCount = event.current_participants || 0;
```

**Dans la vérification du quota complet :**

```typescript
// ❌ AVANT
const isFull = (event.current_participants || participants.length) >= event.max_participants;

// ✅ APRÈS
const isFull = (event.current_participants || 0) >= event.max_participants;
```

**Impact :**
- ✅ Source de vérité unique : `current_participants`
- ✅ Cohérence entre dashboard et page de détail
- ✅ Performance améliorée (pas de comptage côté client)
- ✅ Respect des triggers de base de données

---

## 🗄️ Rappel du schéma de base de données

### Table `event_participants`

```sql
CREATE TABLE public.event_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),  -- ⚠️ user_id, PAS profile_id
  status text DEFAULT 'registered' 
    CHECK (status IN ('registered', 'attended', 'cancelled')),  -- ⚠️ 'registered', PAS 'confirmed'
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);
```

### Triggers automatiques

La colonne `current_participants` dans `events` est **automatiquement mise à jour** par des triggers :

```sql
-- Sur INSERT dans event_participants
CREATE TRIGGER trigger_update_participants_count_insert
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- Sur UPDATE dans event_participants  
CREATE TRIGGER trigger_update_participants_count_update
  AFTER UPDATE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- Sur DELETE dans event_participants
CREATE TRIGGER trigger_update_participants_count_delete
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();
```

**Fonction de trigger :**
```sql
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status != 'cancelled'
  ),
  updated_at = timezone('utc'::text, now())
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Impact des corrections

### Avant les corrections

| Situation | Dashboard | Page Détail | Base de données |
|-----------|-----------|-------------|-----------------|
| Création événement | 0 | 0 | 0 (échec silencieux) |
| Ajout participant | Décalé | Correct | Correct |
| Quota atteint | Incohérent | Incohérent | Correct |

### Après les corrections

| Situation | Dashboard | Page Détail | Base de données |
|-----------|-----------|-------------|-----------------|
| Création événement | 1 | 1 | 1 ✅ |
| Ajout participant | Synchronisé | Synchronisé | Correct |
| Quota atteint | Cohérent | Cohérent | Correct |

---

## 🧪 Tests de validation

### Test 1 : Création d'événement
1. ✅ Créer un nouvel événement via `/create-event`
2. ✅ Vérifier que le créateur apparaît comme participant
3. ✅ Vérifier que `current_participants = 1`
4. ✅ Vérifier sur dashboard et page de détail

### Test 2 : Participation
1. ✅ Utilisateur B participe à l'événement
2. ✅ Vérifier `current_participants = 2`
3. ✅ Vérifier l'affichage sur dashboard
4. ✅ Vérifier l'affichage sur page de détail

### Test 3 : Désinscription
1. ✅ Utilisateur B quitte l'événement
2. ✅ Vérifier `current_participants = 1`
3. ✅ Vérifier la synchronisation

### Test 4 : Quota
1. ✅ Créer événement avec max_participants = 2
2. ✅ Utilisateur B participe → OK
3. ✅ Utilisateur C tente de participer → Bloqué
4. ✅ Message "Quota atteint" affiché

---

## 📝 Bonnes pratiques appliquées

### 1. Source de vérité unique
- ✅ `current_participants` est la seule source pour le comptage
- ✅ Maintenu automatiquement par les triggers DB
- ❌ Ne pas compter manuellement avec `participants.length`

### 2. Noms de colonnes corrects
- ✅ Toujours utiliser `user_id` dans `event_participants`
- ❌ Ne jamais utiliser `profile_id` (colonne inexistante)

### 3. Statuts valides
Pour `event_participants.status` :
- ✅ `'registered'` - Inscrit (par défaut)
- ✅ `'attended'` - A participé
- ✅ `'cancelled'` - A annulé
- ❌ `'confirmed'` - N'existe pas

### 4. Vérification de quota
```typescript
// ✅ BON
const currentParticipantsCount = event.current_participants || 0;
if (currentParticipantsCount >= event.max_participants) {
  // Quota atteint
}

// ❌ MAUVAIS
const currentParticipantsCount = participants.length;
```

---

## 🔗 Fichiers modifiés

1. `apps/mobile/app/(tabs)/create-event.tsx`
   - Ligne 116 : `profile_id` → `user_id`
   - Ligne 117 : `'confirmed'` → `'registered'`

2. `apps/mobile/app/(tabs)/events/[id].tsx`
   - Ligne 134 : Vérification quota utilise `current_participants`
   - Ligne 231 : `isFull` utilise `current_participants`
   - Ligne 324 : Affichage utilise `current_participants`

3. `apps/mobile/app/(tabs)/dashboard.tsx`
   - Ligne 331 : Déjà correct (utilise `current_participants`)

---

## 🚀 Recommandations futures

### 1. Validation des insertions
Ajouter une vérification TypeScript pour éviter les erreurs de colonnes :

```typescript
type EventParticipantInsert = {
  event_id: string;
  user_id: string;  // Typé explicitement
  status: 'registered' | 'attended' | 'cancelled';
}
```

### 2. Tests automatisés
Créer des tests pour vérifier :
- Compteur après création
- Compteur après participation
- Compteur après désinscription
- Blocage du quota

### 3. Monitoring
Ajouter des logs pour détecter les décalages :
```typescript
if (event.current_participants !== participants.length) {
  console.warn('Décalage détecté:', {
    db: event.current_participants,
    local: participants.length
  });
}
```

---

## 📚 Références

- Migration : `supabase/migrations/20250126000001_fix_participants_count.sql`
- Documentation participants : `documentation/2025-10-28_participation-evenements-mobile.md`
- Schéma initial : `supabase/migrations/20240101000001_initial_schema.sql`

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Statut:** ✅ Résolu et testé


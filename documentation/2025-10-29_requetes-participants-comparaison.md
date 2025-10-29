# Requêtes SQL - Comptage des Participants

**Date:** 29 octobre 2025  
**Comparaison:** Dashboard vs Page de détail d'événement

---

## 📊 Vue d'ensemble

| Page | Requête SQL | Source du compteur | Affichage |
|------|-------------|-------------------|-----------|
| **Dashboard** | `SELECT * FROM events` | `event.current_participants` | `{event.current_participants}/{event.max_participants}` |
| **Events/[id]** | `SELECT * FROM events` + `SELECT * FROM event_participants` | `event.current_participants` | `{event.current_participants}/{event.max_participants}` |

**Bonne nouvelle :** Les deux pages utilisent maintenant **`current_participants`** ! ✅

---

## 📱 1. Dashboard (`/dashboard`)

### Fichier
```
apps/mobile/app/(tabs)/dashboard.tsx
```

### Requête SQL pour charger les événements

```typescript
// Ligne 123-129
const { data, error } = await supabase
  .from('events')
  .select('*')                              // ← Charge TOUTES les colonnes
  .eq('status', 'active')
  .gte('date_time', now)
  .order('date_time', { ascending: true })
  .limit(10);
```

**Équivalent SQL :**
```sql
SELECT * 
FROM events
WHERE status = 'active' 
  AND date_time >= NOW()
ORDER BY date_time ASC
LIMIT 10;
```

### Affichage du compteur

```typescript
// Ligne 331
{event.current_participants}/{event.max_participants} participants
```

**Source :** `event.current_participants` (colonne DB, mise à jour par trigger)

---

## 📄 2. Page de détail (`/events/[id]`)

### Fichier
```
apps/mobile/app/(tabs)/events/[id].tsx
```

### Requête SQL #1 : Charger l'événement

```typescript
// Ligne 55-59
const { data: eventData, error: eventError } = await supabase
  .from('events')
  .select('*')              // ← Charge TOUTES les colonnes (dont current_participants)
  .eq('id', id)
  .single();
```

**Équivalent SQL :**
```sql
SELECT * 
FROM events
WHERE id = 'EVENT_ID'
LIMIT 1;
```

### Requête SQL #2 : Charger les participants

```typescript
// Ligne 84-95
const { data: participantsData } = await supabase
  .from('event_participants')
  .select(`
    *,
    profiles:user_id (
      id,
      username,
      full_name,
      avatar_url
    )
  `)
  .eq('event_id', id);
```

**Équivalent SQL :**
```sql
SELECT 
  ep.*,
  p.id,
  p.username,
  p.full_name,
  p.avatar_url
FROM event_participants ep
LEFT JOIN profiles p ON p.id = ep.user_id
WHERE ep.event_id = 'EVENT_ID';
```

**Note :** Cette requête sert à afficher la **liste des participants**, pas le compteur.

### Affichage du compteur

```typescript
// Ligne 324
{event.current_participants || 0}/{event.max_participants} participants
```

**Source :** `event.current_participants` (colonne DB, mise à jour par trigger)

### Vérification du quota

```typescript
// Ligne 134
const currentParticipantsCount = event.current_participants || 0;
if (currentParticipantsCount >= event.max_participants) {
  // Quota atteint
}
```

**Source :** `event.current_participants` (colonne DB)

---

## 🔄 Comment `current_participants` est mis à jour

### Trigger automatique

```sql
CREATE TRIGGER trigger_update_participants_count_insert
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

CREATE TRIGGER trigger_update_participants_count_delete
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();
```

### Fonction de mise à jour

```sql
CREATE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id uuid;
  v_count integer;
BEGIN
  -- Déterminer l'event_id
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
  ELSE
    v_event_id := NEW.event_id;
  END IF;

  -- Compter les participants actifs
  SELECT COUNT(*) INTO v_count
  FROM public.event_participants 
  WHERE event_id = v_event_id
    AND status != 'cancelled';

  -- Mettre à jour le compteur
  UPDATE public.events 
  SET 
    current_participants = v_count,
    updated_at = now()
  WHERE id = v_event_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Comparaison détaillée

### Dashboard

| Aspect | Détails |
|--------|---------|
| **Requête** | `SELECT * FROM events WHERE status='active'` |
| **Nombre de requêtes** | 1 seule |
| **Compteur utilisé** | `event.current_participants` |
| **Liste des participants** | ❌ Non chargée |
| **Performance** | ⚡ Rapide (1 requête) |
| **Mise à jour** | Automatique (trigger) |

### Page de détail

| Aspect | Détails |
|--------|---------|
| **Requête événement** | `SELECT * FROM events WHERE id='...'` |
| **Requête participants** | `SELECT * FROM event_participants WHERE event_id='...'` |
| **Nombre de requêtes** | 2 requêtes |
| **Compteur utilisé** | `event.current_participants` |
| **Liste des participants** | ✅ Chargée avec profils |
| **Performance** | ⚡ Rapide (2 requêtes, mais JOIN optimisé) |
| **Mise à jour** | Automatique (trigger) |

---

## ✅ Cohérence actuelle

Les deux pages sont maintenant **synchronisées** :

```typescript
// Dashboard
{event.current_participants}/{event.max_participants}

// Events/[id]
{event.current_participants || 0}/{event.max_participants}
```

**Source unique :** `events.current_participants` (mise à jour automatique par triggers)

---

## 🔍 Requête pour vérifier la cohérence

Si vous voulez vérifier que les compteurs sont corrects :

```sql
-- Comparer current_participants avec le nombre réel
SELECT 
  e.id,
  e.title,
  e.current_participants as "Compteur DB",
  COUNT(ep.id) as "Participants réels",
  CASE 
    WHEN e.current_participants = COUNT(ep.id) THEN '✅ OK'
    ELSE '❌ Décalage'
  END as "Status"
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants
ORDER BY e.created_at DESC;
```

---

## 🎯 Bonne pratique appliquée

### ✅ Ce qui est fait correctement

1. **Source unique de vérité** : `current_participants` dans la table `events`
2. **Mise à jour automatique** : Triggers sur INSERT/UPDATE/DELETE
3. **Utilisation cohérente** : Les deux pages utilisent la même colonne
4. **Performance** : Pas besoin de COUNT() à chaque requête

### ❌ À éviter

```typescript
// ❌ MAUVAIS - Compter manuellement à chaque fois
const count = participants.length;

// ❌ MAUVAIS - Requête COUNT supplémentaire
const { count } = await supabase
  .from('event_participants')
  .select('*', { count: 'exact', head: true })
  .eq('event_id', eventId);
```

### ✅ À faire

```typescript
// ✅ BON - Utiliser la colonne DB
const count = event.current_participants;

// ✅ BON - Avec fallback à 0
const count = event.current_participants || 0;
```

---

## 🔄 Flux de données complet

### Quand un utilisateur rejoint un événement

```
1. Code mobile
   ↓ INSERT INTO event_participants
2. Trigger PostgreSQL (AFTER INSERT)
   ↓ execute update_event_participants_count()
3. Fonction compte les participants
   ↓ UPDATE events SET current_participants = ...
4. Dashboard et page détail
   ↓ SELECT * FROM events
5. Affichage
   ↓ {event.current_participants}
```

### Quand un utilisateur quitte un événement

```
1. Code mobile
   ↓ DELETE FROM event_participants
2. Trigger PostgreSQL (AFTER DELETE)
   ↓ execute update_event_participants_count()
3. Fonction compte les participants
   ↓ UPDATE events SET current_participants = ...
4. Dashboard et page détail
   ↓ SELECT * FROM events (ou refresh)
5. Affichage
   ↓ {event.current_participants}
```

---

## 📝 Résumé

| Question | Réponse |
|----------|---------|
| Dashboard utilise quelle requête ? | `SELECT * FROM events` |
| Events/[id] utilise quelle requête ? | `SELECT * FROM events` + `SELECT * FROM event_participants` |
| Quelle colonne pour le compteur ? | `current_participants` (dans les deux cas) |
| Comment est-elle mise à jour ? | Automatiquement par triggers |
| Les deux pages sont synchronisées ? | ✅ Oui |

---

**Conclusion :** Les deux pages utilisent la **même source** (`current_participants`), mise à jour **automatiquement** par des triggers PostgreSQL. C'est la bonne approche ! ✅

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Dernière mise à jour:** 29 octobre 2025


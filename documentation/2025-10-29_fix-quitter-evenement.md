# Fix: Impossible de Quitter un Événement

**Date:** 29 octobre 2025  
**Problème:** La suppression de participation ne fonctionne pas  
**Cause:** Politique RLS DELETE manquante  
**Sévérité:** Bloquant

---

## 🐛 Symptômes

- ✅ L'utilisateur peut **rejoindre** un événement (bouton "Participer")
- ❌ L'utilisateur **ne peut pas quitter** un événement (bouton "Quitter le gémou")
- ❌ La base de données **n'est pas modifiée** lors de la désinscription
- ⚠️ Aucun message d'erreur affiché

---

## 🔍 Diagnostic

### Code de l'application (✅ Correct)

Le code mobile est **correct** :

```typescript
// apps/mobile/app/(tabs)/events/[id].tsx - Ligne 120
const { error } = await supabase
  .from('event_participants')
  .delete()
  .eq('event_id', event.id)
  .eq('user_id', user.id);
```

### Politiques RLS (❌ Incomplètes)

Les politiques Row Level Security sur `event_participants` :

| Action | Politique | Status |
|--------|-----------|--------|
| SELECT | "Event participants are viewable by everyone" | ✅ Existe |
| INSERT | "Authenticated users can join events" | ✅ Existe |
| UPDATE | "Users can update their own participation" | ✅ Existe |
| **DELETE** | **MANQUANTE** | ❌ **BLOQUÉ** |

**Résultat :** PostgreSQL bloque silencieusement le DELETE car aucune politique ne l'autorise.

---

## ✅ Solution

### Script SQL à exécuter

**Fichier :** `FIX_QUITTER_EVENT_NOW.sql`

Ce script :
1. Vérifie les politiques actuelles
2. Ajoute la politique DELETE manquante
3. Vérifie que ça fonctionne

### Politique à ajouter

```sql
CREATE POLICY "Users can cancel their own participation"
ON public.event_participants
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
```

**Explication :**
- `FOR DELETE` : S'applique aux suppressions
- `TO authenticated` : Uniquement pour les utilisateurs connectés
- `USING (auth.uid() = user_id)` : Un utilisateur peut supprimer uniquement **sa propre** participation

---

## 🚀 Application du fix

### Étape 1 : Ouvrir Supabase SQL Editor

👉 https://app.supabase.com → Votre projet → **SQL Editor**

### Étape 2 : Copier et exécuter

```bash
cat FIX_QUITTER_EVENT_NOW.sql
```

Copier TOUT le contenu et le coller dans SQL Editor.

### Étape 3 : Cliquer sur Run

**Résultat attendu :**
```
✅ Politique DELETE créée
✅ 4 politiques maintenant actives (SELECT, INSERT, UPDATE, DELETE)
```

---

## 🧪 Tester que ça fonctionne

### Test dans l'application mobile

1. **Rejoindre un événement**
   - Cliquer sur "Participer"
   - ✅ Devrait fonctionner (fonctionnait déjà)

2. **Quitter l'événement**
   - Cliquer sur "Quitter le gémou"
   - ✅ **Devrait maintenant fonctionner !**
   - Le compteur doit décrementer
   - Votre nom disparaît de la liste

3. **Vérifier dans la base de données**

```sql
-- Voir vos participations actuelles
SELECT 
  e.title,
  ep.status,
  ep.joined_at
FROM event_participants ep
JOIN events e ON e.id = ep.event_id
WHERE ep.user_id = auth.uid();
```

---

## 🔒 Sécurité

### Ce que la politique autorise

✅ **Autorisé :**
```typescript
// Un utilisateur peut supprimer SA PROPRE participation
DELETE FROM event_participants 
WHERE user_id = auth.uid();
```

### Ce que la politique bloque

❌ **Bloqué :**
```typescript
// Un utilisateur ne peut PAS supprimer la participation d'un autre
DELETE FROM event_participants 
WHERE user_id = 'autre_utilisateur_id';

// Uniquement l'organisateur peut supprimer l'événement entier
```

### Organisateur

**Note :** Si vous voulez que l'organisateur puisse **retirer** des participants, il faudra une politique supplémentaire :

```sql
-- Politique additionnelle (optionnel)
CREATE POLICY "Event creators can remove participants"
ON public.event_participants
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_participants.event_id 
      AND events.creator_id = auth.uid()
  )
);
```

---

## 📊 Impact

### Avant le fix

```
User clique "Quitter le gémou"
  ↓
Code execute DELETE
  ↓
RLS bloque (pas de politique)
  ↓
Rien ne se passe ❌
  ↓
Base de données inchangée
```

### Après le fix

```
User clique "Quitter le gémou"
  ↓
Code execute DELETE
  ↓
RLS vérifie: auth.uid() = user_id ? ✅ OUI
  ↓
DELETE autorisé ✅
  ↓
Trigger décrémente current_participants ✅
  ↓
Interface mise à jour ✅
```

---

## 🔄 Politiques RLS complètes

Après le fix, voici toutes les politiques sur `event_participants` :

### 1. SELECT (Lecture)
```sql
CREATE POLICY "Event participants are viewable by everyone"
ON public.event_participants
FOR SELECT 
USING (true);
```
→ Tout le monde peut voir qui participe

### 2. INSERT (Rejoindre)
```sql
CREATE POLICY "Authenticated users can join events"
ON public.event_participants
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);
```
→ Un utilisateur peut s'inscrire lui-même

### 3. UPDATE (Modifier)
```sql
CREATE POLICY "Users can update their own participation"
ON public.event_participants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```
→ Un utilisateur peut modifier son statut de participation

### 4. DELETE (Quitter) ✨ NOUVEAU
```sql
CREATE POLICY "Users can cancel their own participation"
ON public.event_participants
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```
→ Un utilisateur peut annuler sa participation

---

## 🧹 Prévention

### Checklist pour les nouvelles tables

Quand vous créez une table avec RLS, pensez aux **4 politiques** :

- [ ] SELECT (qui peut lire ?)
- [ ] INSERT (qui peut créer ?)
- [ ] UPDATE (qui peut modifier ?)
- [ ] **DELETE (qui peut supprimer ?)** ← Souvent oublié !

### Template pour event_participants

```sql
-- Activer RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Les 4 politiques essentielles
CREATE POLICY "select_policy" ON public.event_participants FOR SELECT ...
CREATE POLICY "insert_policy" ON public.event_participants FOR INSERT ...
CREATE POLICY "update_policy" ON public.event_participants FOR UPDATE ...
CREATE POLICY "delete_policy" ON public.event_participants FOR DELETE ...
```

---

## 📚 Références

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- Fichier initial: `supabase/migrations/20240101000001_initial_schema.sql`

---

## ✅ Checklist post-fix

Après avoir appliqué le fix :

- [ ] Politique DELETE créée dans Supabase
- [ ] Tester "Rejoindre" un événement
- [ ] Tester "Quitter" un événement
- [ ] Vérifier le compteur current_participants
- [ ] Vérifier que le nom disparaît de la liste
- [ ] Tester avec plusieurs utilisateurs

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Status:** ✅ Fix prêt à appliquer


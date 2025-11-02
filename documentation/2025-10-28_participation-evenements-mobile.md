# Fonctionnalité de Participation aux Événements - Mobile

**Date:** 28 octobre 2025  
**Plateforme:** Mobile (React Native / Expo)  
**Route concernée:** `/events/[id]`

---

## 📋 Vue d'ensemble

Ce document décrit l'implémentation de la fonctionnalité de participation et désinscription aux événements sur la plateforme mobile de l'application Gémou.

## 🎯 Objectifs

Permettre aux utilisateurs de :
1. **S'inscrire** à un événement en cliquant sur "Participer"
2. **Se désinscrire** d'un événement en cliquant sur "Quitter le gémou"
3. **Voir leur statut** de participation en temps réel
4. **Visualiser la liste** des participants

## 🏗️ Architecture de la page

### Structure des composants

```
EventDetailsPage
├── ScrollView (avec RefreshControl)
│   ├── Header
│   │   └── Bouton Retour
│   ├── Content
│   │   ├── Titre de l'événement
│   │   ├── MetaContainer
│   │   │   ├── Date
│   │   │   ├── Lieu
│   │   │   ├── Nombre de participants
│   │   │   └── Organisateur
│   │   ├── Description
│   │   ├── ParticipantsContainer
│   │   │   └── Liste des participants
│   │   └── ActionsContainer
│   │       ├── Bouton Participer/Quitter (si non-organisateur)
│   │       └── Badge Organisateur (si organisateur)
```

## 🔄 Flux de données

### 1. Chargement initial

```typescript
loadEvent() → {
  1. Vérifier l'authentification
  2. Charger l'événement depuis Supabase
  3. Charger le créateur de l'événement
  4. Vérifier si l'utilisateur participe
  5. Charger la liste des participants
}
```

### 2. Participation à un événement

```typescript
handleParticipate() → {
  SI isParticipating = true
    → Annuler la participation (DELETE)
  SINON
    → Vérifier le quota
    → Inscrire l'utilisateur (INSERT)
  → Recharger les données
}
```

## 🗄️ Base de données

### Table `event_participants`

```sql
CREATE TABLE public.event_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'registered' 
    CHECK (status IN ('registered', 'attended', 'cancelled')),
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);
```

### Triggers automatiques

Le compteur `current_participants` est mis à jour automatiquement via des triggers :

```sql
-- Fonction de mise à jour
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status != 'cancelled'
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers sur INSERT, UPDATE et DELETE
```

## 💡 Fonctionnalités implémentées

### ✅ Inscription à un événement

**Conditions:**
- L'utilisateur doit être authentifié
- L'utilisateur ne doit pas déjà être inscrit
- Le quota de participants ne doit pas être atteint

**Action:**
```typescript
await supabase
  .from('event_participants')
  .insert({
    event_id: event.id,
    user_id: user.id,
    status: 'registered'
  });
```

**Résultat:**
- ✅ L'utilisateur est ajouté à la liste des participants
- ✅ Le compteur de participants est incrémenté automatiquement
- ✅ Le bouton change d'état et affiche "Quitter le gémou"
- ✅ Le bouton devient rouge (#ef4444)

### ✅ Désinscription d'un événement

**Conditions:**
- L'utilisateur doit être participant

**Action:**
```typescript
await supabase
  .from('event_participants')
  .delete()
  .eq('event_id', event.id)
  .eq('user_id', user.id);
```

**Résultat:**
- ✅ L'utilisateur est retiré de la liste des participants
- ✅ Le compteur de participants est décrémenté automatiquement
- ✅ Le bouton change d'état et affiche "Participer"
- ✅ Le bouton redevient bleu (#3b82f6)

### ✅ Vérification du quota

Avant chaque inscription, le système vérifie :

```typescript
const currentParticipantsCount = participants.length;
if (currentParticipantsCount >= event.max_participants) {
  Alert.alert('Quota atteint', 'Le nombre maximum de participants est déjà atteint');
  return;
}
```

### ✅ Affichage de la liste des participants

La liste affiche pour chaque participant :
- 👤 Emoji d'avatar
- Nom complet ou username
- 📍 Ville (si disponible)

## 🎨 Interface utilisateur

### États du bouton de participation

| État | Couleur | Texte | Désactivé |
|------|---------|-------|-----------|
| Non-participant | Bleu (#3b82f6) | "Participer" | Non |
| Participant | Rouge (#ef4444) | "Quitter le gémou" | Non |
| Quota atteint | Gris (#9ca3af) | "Complet" | Oui |
| Chargement | Bleu/Rouge | ActivityIndicator | Oui |
| Organisateur | Jaune (#fef3c7) | "⭐ Vous êtes l'organisateur" | N/A |

### Design responsive

- **Mobile-first:** Optimisé pour les petits écrans
- **Padding adaptatif:** iOS (60px top), Android/Web (16px top)
- **Pull-to-refresh:** Disponible sur toute la page
- **Feedback visuel:** AlertDialog natif pour les confirmations

## 🔒 Sécurité

### Row Level Security (RLS)

Les politiques de sécurité Supabase garantissent :

```sql
-- Lecture publique des participants
CREATE POLICY "Event participants are viewable by everyone." 
  ON public.event_participants
  FOR SELECT USING (true);

-- Seuls les utilisateurs authentifiés peuvent s'inscrire
CREATE POLICY "Authenticated users can join events." 
  ON public.event_participants
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Seuls les participants peuvent annuler leur participation
CREATE POLICY "Users can cancel their own participation." 
  ON public.event_participants
  FOR DELETE USING (auth.uid() = user_id);
```

## 🧪 Cas de test

### Test 1: Inscription réussie
1. Utilisateur authentifié accède à `/events/[id]`
2. Clique sur "Participer"
3. ✅ Inscription confirmée
4. ✅ Bouton devient "Quitter le gémou" (rouge)
5. ✅ Compteur incrémenté
6. ✅ Utilisateur dans la liste

### Test 2: Désinscription réussie
1. Utilisateur participant accède à `/events/[id]`
2. Clique sur "Quitter le gémou"
3. ✅ Désinscription confirmée
4. ✅ Bouton devient "Participer" (bleu)
5. ✅ Compteur décrémenté
6. ✅ Utilisateur retiré de la liste

### Test 3: Quota atteint
1. Événement avec max_participants = 10
2. 10 participants déjà inscrits
3. Nouvel utilisateur tente de s'inscrire
4. ✅ Alerte "Quota atteint"
5. ✅ Bouton "Complet" désactivé

### Test 4: Organisateur
1. Créateur de l'événement accède à `/events/[id]`
2. ✅ Pas de bouton de participation
3. ✅ Badge "⭐ Vous êtes l'organisateur"

## 🐛 Gestion des erreurs

### Erreurs possibles

1. **Erreur réseau:**
   - Message: "Une erreur est survenue"
   - Affichage: Alert natif

2. **Utilisateur non authentifié:**
   - Redirection automatique vers `/login`

3. **Événement introuvable:**
   - Affichage: Écran d'erreur avec emoji 😕
   - Bouton de retour disponible

4. **Quota dépassé:**
   - Vérification côté client ET serveur
   - Message: "Le quota de participants est atteint"

5. **Contrainte unique violée:**
   - Cas: Double inscription
   - Gestion: Message d'erreur de Supabase

## 📱 Compatibilité

- ✅ iOS
- ✅ Android
- ✅ Web (via Expo)

## 🔄 Améliorations futures

- [ ] Confirmation avant désinscription
- [ ] Liste d'attente (waitlist) quand quota atteint
- [ ] Notifications push lors de l'inscription/désinscription
- [ ] Historique des participations de l'utilisateur
- [ ] Statistiques de participation
- [ ] Export de la liste des participants (pour organisateurs)
- [ ] Chat dédié aux participants

## 📚 Dépendances

```json
{
  "react-native": "Composants natifs",
  "expo-router": "Navigation",
  "@supabase/supabase-js": "Client Supabase"
}
```

## 🔗 Fichiers liés

- `/apps/mobile/app/events/[id].tsx` - Page de détail de l'événement
- `/apps/mobile/lib/supabase.ts` - Configuration Supabase
- `/supabase/migrations/20250126000001_fix_participants_count.sql` - Triggers de comptage
- `/supabase/migrations/20250125000001_sync_cloud_to_local.sql` - Schéma de la table

---

**Auteur:** AI Assistant  
**Version:** 1.0  
**Dernière mise à jour:** 28 octobre 2025


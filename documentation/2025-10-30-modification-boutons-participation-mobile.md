# Modification des Boutons de Participation aux Événements (Mobile)

**Date**: 30 octobre 2025  
**Auteur**: Assistant IA  
**Version**: 1.0

## 📋 Résumé

Cette documentation décrit les modifications apportées aux boutons de participation aux événements dans l'application mobile, permettant une gestion dynamique de la participation et de l'édition des événements selon le rôle de l'utilisateur.

## 🎯 Objectifs

Implémenter une logique de boutons conditionnels qui s'adaptent selon trois scénarios :

1. **Utilisateur non-participant et non-créateur** : Peut s'inscrire à l'événement
2. **Utilisateur participant mais non-créateur** : Peut se désinscrire de l'événement  
3. **Utilisateur créateur de l'événement** : Peut modifier l'événement

## 🔧 Modifications Techniques

### 1. Page de Création/Édition d'Événements

**Fichier** : `apps/mobile/app/(tabs)/create-event.tsx`

#### Changements principaux :

##### a) Support du Mode Édition
```typescript
const { eventId } = useLocalSearchParams<{ eventId?: string }>()
const [isEditMode, setIsEditMode] = useState(false)
```

##### b) Chargement des Données Existantes
```typescript
const loadEventData = async (id: string, userId: string) => {
  // Récupère l'événement depuis la base de données
  // Vérifie que l'utilisateur est le créateur
  // Charge les données dans le formulaire
}
```

##### c) Logique de Soumission Bifurquée
```typescript
const handleSubmit = async () => {
  if (isEditMode && eventId) {
    // Mode édition : UPDATE
    await supabase.from('events').update({...})
  } else {
    // Mode création : INSERT
    await supabase.from('events').insert({...})
  }
}
```

##### d) Interface Adaptative
- Le titre change : "Créer un événement" / "Modifier l'événement"
- Le bouton change : "Créer l'événement" / "Enregistrer les modifications"

### 2. Page de Détails d'Événement

**Fichier** : `apps/mobile/app/(tabs)/events/[id].tsx`

#### Changements principaux :

##### a) Logique de Participation Améliorée

```typescript
const handleParticipate = async () => {
  // Cas 1 : Créateur → Redirection vers édition
  if (isCreator) {
    router.push({
      pathname: '/(tabs)/create-event',
      params: { eventId: event.id }
    })
    return
  }

  // Cas 2 : Participant → Désinscription
  if (isParticipating) {
    // Supprime la participation
    await supabase.from('event_participants').delete()...
    
    // Décrémente le compteur
    await supabase.from('events').update({ 
      current_participants: Math.max(0, (event.current_participants || 0) - 1)
    })
  } 
  // Cas 3 : Non-participant → Inscription
  else {
    // Vérifie le quota
    if (currentParticipantsCount >= event.max_participants) {
      Alert.alert('Quota atteint', '...')
      return
    }

    // Ajoute la participation
    await supabase.from('event_participants').insert({...})
    
    // Incrémente le compteur
    await supabase.from('events').update({ 
      current_participants: (event.current_participants || 0) + 1
    })
  }
}
```

##### b) Textes des Boutons

**Pour un utilisateur non-créateur** :
```tsx
<Text style={styles.participateButtonText}>
  {isParticipating ? 'Quitter le gémou' : isFull ? 'Complet' : 'Participer'}
</Text>
```

**Pour le créateur** :
```tsx
<Text style={styles.participateButtonText}>
  Modifier le Gémou
</Text>
```

## 📊 Flux de Données

### Inscription à un Événement

```
User clicks "Participer"
    ↓
Vérification du quota
    ↓
INSERT dans event_participants
    ↓
UPDATE events.current_participants (+1)
    ↓
Rechargement des données
    ↓
UI mise à jour immédiatement
```

### Désinscription d'un Événement

```
User clicks "Quitter le gémou"
    ↓
DELETE de event_participants
    ↓
UPDATE events.current_participants (-1)
    ↓
Rechargement des données
    ↓
UI mise à jour immédiatement
```

### Modification d'un Événement

```
Creator clicks "Modifier le Gémou"
    ↓
Navigation vers /create-event?eventId=xxx
    ↓
Chargement des données existantes
    ↓
Vérification que user.id === creator_id
    ↓
Affichage du formulaire pré-rempli
    ↓
Soumission → UPDATE de l'événement
    ↓
Retour à la page de détail
```

## 🎨 Structure des Composants

### Page de Détails d'Événement (`/events/[id]`)

```
EventDetailsPage
├── TopHeader
├── ScrollView
│   ├── Image (événement)
│   ├── Titre
│   ├── Métadonnées (hôte, lieu, date, capacité, coût)
│   ├── Description
│   ├── Jeux
│   ├── Tags
│   ├── Liste des Participants
│   └── Boutons d'Action
│       ├── Contacter l'hôte/participants
│       └── ParticipateButton
│           ├── [Non-créateur] "Participer" / "Quitter le gémou"
│           └── [Créateur] "Modifier le Gémou"
```

### Page de Création/Édition (`/create-event`)

```
CreateEventPage
├── Header
│   ├── Bouton Retour
│   └── Titre (dynamique)
└── Formulaire
    ├── Titre
    ├── Description
    ├── Date et Heure
    ├── Lieu
    ├── Nombre Max de Participants
    ├── Visibilité
    └── Boutons
        ├── Annuler
        └── Soumettre (dynamique)
```

## 🔐 Sécurité

### Vérifications Implémentées

1. **Authentification** : Vérification de l'utilisateur connecté
2. **Autorisation** : Seul le créateur peut modifier l'événement
3. **Validation** : Vérification du quota avant inscription
4. **Protection DB** : Clause `eq('creator_id', user.id)` dans les UPDATE

### Code de Sécurité

```typescript
// Vérification créateur avant chargement
if (event.creator_id !== userId) {
  Alert.alert('Erreur', 'Vous n\'êtes pas autorisé à modifier cet événement')
  router.back()
  return
}

// Double vérification lors de l'UPDATE
.update({...})
.eq('id', eventId)
.eq('creator_id', user.id) // Sécurité supplémentaire
```

## 📱 Gestion des États

### États Locaux

```typescript
const [user, setUser] = useState<any>(null)
const [event, setEvent] = useState<Event | null>(null)
const [isParticipating, setIsParticipating] = useState(false)
const [isLoadingAction, setIsLoadingAction] = useState(false)
const [participants, setParticipants] = useState<any[]>([])
```

### États Dérivés

```typescript
const isCreator = user?.id === event.creator_id
const isFull = (event.current_participants || 0) >= event.max_participants
```

## 🔄 Synchronisation des Données

### Rechargement Après Actions

Après chaque action (inscription, désinscription, modification), la fonction `loadEvent()` est appelée pour :

1. Recharger l'événement depuis la base
2. Actualiser le statut de participation
3. Mettre à jour la liste des participants
4. Synchroniser le compteur de participants

```typescript
await loadEvent() // Rafraîchissement immédiat
```

## 🎯 Cas d'Usage

### Cas 1 : Utilisateur consulte un événement auquel il ne participe pas

**État initial** :
- `isCreator = false`
- `isParticipating = false`
- Bouton affiché : "Participer"

**Action** : Click sur "Participer"
**Résultat** :
- Inscription dans `event_participants`
- `current_participants` incrémenté
- Bouton devient : "Quitter le gémou"

### Cas 2 : Utilisateur participant consulte l'événement

**État initial** :
- `isCreator = false`
- `isParticipating = true`
- Bouton affiché : "Quitter le gémou"

**Action** : Click sur "Quitter le gémou"
**Résultat** :
- Suppression de `event_participants`
- `current_participants` décrémenté
- Bouton devient : "Participer"

### Cas 3 : Créateur consulte son événement

**État initial** :
- `isCreator = true`
- `isParticipating = true` (créateur est automatiquement participant)
- Bouton affiché : "Modifier le Gémou"

**Action** : Click sur "Modifier le Gémou"
**Résultat** :
- Navigation vers `/create-event?eventId=xxx`
- Formulaire pré-rempli avec les données
- Possibilité de modifier et sauvegarder

## ⚠️ Points d'Attention

### 1. Gestion du Compteur de Participants

Le compteur `current_participants` est géré manuellement. Il est crucial de :
- Incrémenter lors de l'inscription
- Décrémenter lors de la désinscription
- Utiliser `Math.max(0, ...)` pour éviter les valeurs négatives

### 2. Rechargement des Données

Le rechargement via `loadEvent()` est essentiel pour :
- Afficher les changements immédiatement
- Éviter les incohérences d'état
- Synchroniser avec la base de données

### 3. Gestion des Erreurs

Tous les appels asynchrones sont enveloppés dans des blocs try-catch avec :
- Messages d'erreur explicites
- Gestion différenciée web/mobile (Alert vs alert)
- Reset des états de chargement

## 🚀 Améliorations Futures

### Suggestions

1. **Optimisation** : Utiliser un trigger PostgreSQL pour gérer automatiquement `current_participants`
2. **Temps réel** : Implémenter des subscriptions Supabase pour mettre à jour l'UI en temps réel
3. **Validation** : Ajouter plus de validations côté serveur (RLS, functions)
4. **UX** : Ajouter des animations de transition lors des changements d'état
5. **Notifications** : Envoyer des notifications aux participants lors de modifications d'événement

## 📝 Checklist de Test

- [ ] Inscription à un événement → compteur incrémenté
- [ ] Désinscription d'un événement → compteur décrémenté
- [ ] Modification d'événement par le créateur → changements sauvegardés
- [ ] Tentative d'inscription à un événement complet → message d'erreur
- [ ] Tentative de modification par un non-créateur → accès refusé
- [ ] Rechargement de la page après action → données à jour
- [ ] Navigation retour après modification → retour à la bonne page

## 🔗 Fichiers Modifiés

1. `apps/mobile/app/(tabs)/create-event.tsx`
   - Ajout du support d'édition
   - Gestion du paramètre `eventId`
   - Logique de chargement des données existantes

2. `apps/mobile/app/(tabs)/events/[id].tsx`
   - Modification de `handleParticipate()`
   - Mise à jour des textes de boutons
   - Gestion des compteurs de participants

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

**Fin de la documentation**


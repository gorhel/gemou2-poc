# Structure arborescente de la page de détails d'événement

**Date:** 11 novembre 2025  
**Fichier:** `apps/mobile/app/(tabs)/events/[id].tsx`

## 🌳 Arborescence des composants

```
EventDetailsPage (Page principale)
│
├─ [État de chargement] (si loading === true)
│  ├─ View (loadingContainer)
│  │  ├─ ActivityIndicator
│  │  └─ Text "Chargement..."
│
├─ [État d'erreur] (si !event)
│  ├─ View (errorContainer)
│  │  ├─ Text (emoji) "😕"
│  │  ├─ Text "Événement introuvable"
│  │  └─ TouchableOpacity (backButton)
│  │     └─ Text "← Retour"
│
└─ [Contenu principal] (si event existe)
   │
   └─ PageLayout (showHeader, refreshing, onRefresh)
      │
      └─ View (content)
         │
         ├─ 1️⃣ Image de l'événement
         │  └─ View (eventImageContainer)
         │     └─ Image (eventImage ou placeholder)
         │
         ├─ 2️⃣ Titre
         │  └─ Text (title) → event.title
         │
         ├─ 3️⃣ Métadonnées de l'événement
         │  └─ View (metaContainer)
         │     │
         │     ├─ View (metaItem) - Organisateur
         │     │  └─ View (organizerContainer)
         │     │     ├─ View (organizerAvatar)
         │     │     │  └─ Image | View (avatarFallback)
         │     │     ├─ Text (metaText) → "Hôte" + nom créateur
         │     │     └─ [SI isCreator]
         │     │        └─ TouchableOpacity (deleteButton) "🗑️"
         │     │
         │     ├─ View (metaItem) - Lieu
         │     │  ├─ Text (metaEmoji) "📍"
         │     │  └─ Text (metaText) → "Lieu" + location
         │     │
         │     ├─ View (metaItem) - Horaire
         │     │  ├─ Text (metaEmoji) "📅"
         │     │  └─ Text (metaText) → "Horaire" + date formatée
         │     │
         │     ├─ View (metaItem) - Capacité
         │     │  ├─ Text (metaEmoji) "👥"
         │     │  └─ Text (metaText) → "Capacité" + participants
         │     │
         │     └─ View (metaItem) - Coût
         │        ├─ Text (metaEmoji) "💰"
         │        └─ Text (metaText) → "Coût: Gratuit"
         │
         ├─ View (separator) - Ligne de séparation
         │
         ├─ 4️⃣ SECTION DESCRIPTION (toujours visible)
         │  └─ View (descriptionContainer)
         │     ├─ Text (descriptionTitle) "Description"
         │     └─ [Condition]
         │        ├─ SI description existe
         │        │  └─ Text (description) → event.description
         │        └─ SINON
         │           └─ Text (emptyStateText) "Aucune description..."
         │
         ├─ 5️⃣ SECTION JEUX (toujours visible)
         │  └─ View (descriptionContainer)
         │     ├─ Text (descriptionTitle) "Jeux ({eventGames.length})"
         │     └─ [Condition]
         │        ├─ SI eventGames.length > 0
         │        │  └─ [Map sur eventGames]
         │        │     └─ View (gameCard) [pour chaque jeu]
         │        │        ├─ [SI game.image_url]
         │        │        │  └─ View (gameImageContainer)
         │        │        │     └─ Image (gameImage)
         │        │        ├─ View (gameInfo)
         │        │        │  ├─ Text (gameTitle) → game.game_name
         │        │        │  ├─ [SI category]
         │        │        │  │  └─ Text (gameCategory) → game.category
         │        │        │  └─ View (gameDetailsRow)
         │        │        │     ├─ Text "👥 min-max joueurs"
         │        │        │     └─ Text "⏱️ min-max minutes"
         │        │        └─ View (arrowContainer)
         │        │           └─ Text (arrow) "›"
         │        └─ SINON
         │           └─ Text (emptyStateText) "Aucun jeu..."
         │
         ├─ 6️⃣ SECTION TAGS (toujours visible)
         │  └─ View (descriptionContainer)
         │     ├─ Text (descriptionTitle) "Tags événement et jeu"
         │     └─ [Condition]
         │        ├─ SI eventTags.length > 0 OU gameTags.length > 0
         │        │  └─ View (badgesContainer)
         │        │     ├─ [Map sur eventTags]
         │        │     │  └─ View (badge + eventTagBadge) [pour chaque tag]
         │        │     │     └─ Text (badgeText) → tag.name
         │        │     └─ [Map sur gameTags]
         │        │        └─ View (badge + gameTagBadge) [pour chaque tag]
         │        │           └─ Text (badgeText) → tag.name
         │        └─ SINON
         │           └─ Text (emptyStateText) "Aucun tag..."
         │
         ├─ 7️⃣ SECTION PARTICIPANTS (toujours visible)
         │  └─ View (participantsContainer)
         │     ├─ Text (participantsTitle) "Participants ({participants.length})"
         │     └─ [Condition]
         │        ├─ SI participants.length > 0
         │        │  └─ [Map sur participants]
         │        │     └─ TouchableOpacity (participantCard) [pour chaque participant]
         │        │        ├─ View (participantAvatar)
         │        │        │  └─ Image | View (participantAvatarFallback)
         │        │        │     └─ Text (participantAvatarInitials)
         │        │        └─ View (participantInfo)
         │        │           ├─ Text (participantName) → @username
         │        │           └─ [SI city]
         │        │              └─ Text (participantCity) → city
         │        └─ SINON
         │           └─ Text (emptyStateText) "Aucun participant..."
         │
         └─ 8️⃣ BOUTONS D'ACTION
            └─ View (actionsContainer)
               │
               ├─ [SI !isCreator] - Vue participant
               │  └─ View (creatorBadge)
               │     ├─ TouchableOpacity (GroupContactButton)
               │     │  └─ Text "Contacter l'hôte"
               │     └─ TouchableOpacity (participateButton)
               │        └─ [Condition]
               │           ├─ SI isLoadingAction
               │           │  └─ ActivityIndicator
               │           └─ SINON
               │              └─ Text → "Participer" | "Quitter" | "Complet"
               │
               └─ [SI isCreator] - Vue créateur
                  └─ View (creatorBadge)
                     ├─ TouchableOpacity (GroupContactButton)
                     │  └─ Text "Contacter les participants"
                     ├─ TouchableOpacity (participateButton)
                     │  └─ Text "Modifier"
                     └─ TouchableOpacity (deleteButton)
                        └─ Text "🗑️ Supprimer le Gémou"

[MODALES - Hors de PageLayout]
│
├─ ConfirmationModal (modalVisible)
│  └─ Affiche message de confirmation/erreur/info
│
├─ ConfirmModal (showConfirmDelete)
│  └─ Confirmation de suppression de l'événement
│
└─ SuccessModal (showSuccess)
   └─ Confirmation de suppression réussie
```

## 📊 États du composant

### Variables d'état principales

```typescript
// Données
- event: Event | null              // Données de l'événement
- creator: any | null              // Informations du créateur
- user: any | null                 // Utilisateur connecté
- participants: any[]              // Liste des participants
- eventTags: any[]                 // Tags de l'événement
- eventGames: any[]                // Jeux de l'événement
- gameTags: any[]                  // Tags des jeux

// États UI
- loading: boolean                 // Chargement initial
- refreshing: boolean              // Rafraîchissement pull-to-refresh
- isLoadingAction: boolean         // Chargement action (participer/quitter)
- isDeleting: boolean             // Suppression en cours
- isParticipating: boolean        // L'utilisateur participe-t-il ?

// Modales
- modalVisible: boolean           // Modale de confirmation générale
- showConfirmDelete: boolean      // Modale de confirmation de suppression
- showSuccess: boolean            // Modale de succès
- modalConfig: {                  // Configuration de la modale générale
    variant: ModalVariant
    title: string
    message: string
  }
```

## 🎨 Styles principaux par section

### Conteneurs principaux
- `loadingContainer` - Centre l'indicateur de chargement
- `errorContainer` - Centre le message d'erreur
- `content` - Conteneur principal (padding: 0)

### Image et titre
- `eventImageContainer` - Conteneur image (height: 200)
- `eventImage` - Image pleine largeur
- `title` - Titre principal (fontSize: 28, bold)

### Métadonnées
- `metaContainer` - Conteneur des métadonnées
- `metaItem` - Ligne de métadonnée (flexDirection: row)
- `metaEmoji` - Emoji icône (fontSize: 38)
- `metaText` - Texte de la métadonnée

### Sections de contenu
- `descriptionContainer` - Conteneur de section
- `descriptionTitle` - Titre de section (fontSize: 18, bold)
- `description` - Texte de description
- `emptyStateText` ⭐ - Message d'état vide (gris, italique, centré)

### Jeux
- `gameCard` - Carte de jeu
- `gameImageContainer` - Conteneur image du jeu (80x80)
- `gameInfo` - Informations du jeu
- `gameTitle` - Titre du jeu (fontSize: 20, bold)
- `gameCategory` - Catégorie du jeu
- `gameDetailsRow` - Détails (joueurs, durée)
- `arrowContainer` - Conteneur de la flèche

### Tags
- `badgesContainer` - Conteneur des badges (flexWrap: wrap)
- `badge` - Badge générique
- `eventTagBadge` - Badge tag événement (rose)
- `gameTagBadge` - Badge tag jeu (jaune)
- `badgeText` - Texte du badge

### Participants
- `participantsContainer` - Conteneur participants
- `participantCard` - Carte participant
- `participantAvatar` - Avatar (40x40, rond)
- `participantInfo` - Infos participant
- `participantName` - Nom (@username)

### Actions
- `actionsContainer` - Conteneur boutons
- `participateButton` - Bouton participer (bleu)
- `participateButtonActive` - État actif (rouge)
- `participateButtonDisabled` - État désactivé (gris)
- `GroupContactButton` - Bouton contacter (gris clair)
- `deleteButton` - Bouton supprimer (rouge)

## 🔄 Flux de données

### Au chargement (useEffect)
```
1. Vérification de l'ID de l'événement
2. Récupération de l'utilisateur connecté
3. Chargement de l'événement
4. Chargement du créateur
5. Vérification de la participation
6. Chargement des participants
7. Chargement des tags de l'événement
8. Chargement des jeux de l'événement
9. Chargement des tags des jeux
```

### Actions utilisateur

#### Participer/Quitter
```
handleParticipate()
├─ Vérification user + event
├─ SI créateur → Redirection vers édition
├─ SI participant → Quitter
├─ SINON
│  ├─ Vérification quota
│  └─ Appel RPC update_event_participation
└─ Rafraîchissement des données
```

#### Supprimer l'événement
```
handleDeleteEvent()
├─ Appel RPC soft_delete_event
├─ Fermeture modale confirmation
├─ Affichage modale succès
└─ Redirection après 2s → /events
```

#### Rafraîchir
```
onRefresh()
├─ setRefreshing(true)
└─ loadEvent()
```

## 📱 Responsive & Accessibilité

### Responsive
- Tous les éléments s'adaptent à la largeur de l'écran
- Images en largeur 100% avec hauteur fixe
- Text wrapping automatique
- FlexWrap pour les badges et détails

### Accessibilité
- `accessibilityRole="button"` sur les éléments cliquables
- Text alternatif pour les images
- Contraste de couleurs suffisant
- Taille de police lisible (min 14px)
- États visuels clairs (hover, pressed, disabled)

## 🎯 Points d'attention

### Performances
- Utilisation de `useCallback` pour `navigateToProfile`
- Keys uniques sur les éléments mappés
- Images optimisées avec `resizeMode="cover"`
- Conditional rendering efficace

### Sécurité
- Vérification de l'utilisateur connecté
- Vérification des permissions (créateur)
- Protection contre les actions non autorisées
- Validation des données avant affichage

### UX
- Messages d'erreur clairs et informatifs
- États de chargement visibles
- Feedback immédiat sur les actions
- Modales pour les actions critiques
- Messages d'état vide engageants

## 📚 Dépendances

### React Native
- View, Text, TouchableOpacity, StyleSheet
- ActivityIndicator, Platform, Image

### Expo
- useLocalSearchParams, router (expo-router)

### Composants personnalisés
- PageLayout
- ConfirmationModal, ConfirmModal, SuccessModal
- EventTags

### Services
- supabase (lib/supabase)

## 🔗 Navigation

### Entrée
- Route: `/(tabs)/events/[id]`
- Paramètre: `id` (string)

### Sorties possibles
- `router.back()` - Retour
- `router.push('/(tabs)/events')` - Liste événements
- `router.push('/(tabs)/create-event')` - Édition (avec eventId)
- `router.push('/profile/${username}')` - Profil participant
- `router.push('/')` - Contacter (TODO)

## ✅ Améliorations récentes

1. ✅ Affichage permanent de toutes les sections
2. ✅ Messages d'état vide informatifs
3. ✅ Style cohérent pour les états vides
4. ✅ Compteurs mis à jour dans les titres
5. ✅ Structure prévisible et cohérente





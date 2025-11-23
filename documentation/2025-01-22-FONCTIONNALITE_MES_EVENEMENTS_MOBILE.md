# Fonctionnalité "Mes événements" - Application Mobile

## Date de création
22 janvier 2025

## Description
Implémentation de la fonctionnalité "Mes événements" sur la page de profil mobile, permettant aux utilisateurs de visualiser la liste des événements auxquels ils participent ou qu'ils organisent.

## Contexte
Cette fonctionnalité existait déjà sur la partie web (`/apps/web/app/profile/page.tsx`) et a été adaptée pour l'application mobile afin d'assurer la cohérence entre les deux plateformes.

## Localisation
- **Fichier principal** : `/apps/mobile/app/(tabs)/profile/index.tsx`
- **Fonctionnalité web de référence** : `/apps/web/app/profile/page.tsx`

## Fonctionnalités implémentées

### 1. Ajout de la section "Mes événements"
- Ajout du type `'events'` dans le type `TabType`
- Ajout de la section dans la liste des sections cliquables avec l'icône 📅
- La section s'ouvre dans une modale, comme les autres sections du profil

### 2. Récupération des événements
La fonction `fetchUserEvents()` récupère :
- **Événements organisés** : événements où l'utilisateur est le créateur (`creator_id`)
- **Événements participés** : événements où l'utilisateur est inscrit via la table `event_participants` avec le statut `'registered'`

Les événements sont ensuite :
- Combinés en une seule liste
- Trier par date décroissante (les plus récents en premier)
- Formatés avec un champ `role` indiquant si l'utilisateur est 'organizer' ou 'participant'

### 3. Interface utilisateur

#### Affichage dans la modale
- **État de chargement** : Indicateur de chargement avec message "Chargement des événements..."
- **État vide** : Message informatif avec icône si aucun événement n'est trouvé
- **Liste des événements** : Affichage en timeline avec :
  - Icône de timeline (📅) pour chaque événement
  - Ligne de connexion entre les événements
  - Titre de l'événement (cliquable pour accéder aux détails)
  - Badge indiquant le rôle (Organisateur en violet, Participant en vert)
  - Date et heure formatées en français
  - Lieu de l'événement
  - Description (si disponible, limitée à 2 lignes)

#### Styles
- Design cohérent avec le reste de l'application mobile
- Cards avec ombres et bordures arrondies
- Badges colorés selon le rôle
- Timeline visuelle pour améliorer la lisibilité

### 4. Navigation
- Clic sur un événement : redirection vers la page de détails de l'événement (`/(tabs)/events/${event.id}`)

## Structure des données

### Interface UserEvent
```typescript
interface UserEvent {
  id: string
  title: string
  description: string | null
  date_time: string
  location: string
  status?: string
  role: 'organizer' | 'participant'
}
```

## Requêtes Supabase

### Événements organisés
```typescript
supabase
  .from('events')
  .select('id, title, description, date_time, location')
  .eq('creator_id', user.id)
  .order('date_time', { ascending: false })
```

### Événements participés
```typescript
supabase
  .from('event_participants')
  .select(`
    id,
    events!inner(id, title, description, date_time, location)
  `)
  .eq('user_id', user.id)
  .eq('status', 'registered')
  .order('joined_at', { ascending: false })
```

## Formatage des dates
Les dates sont formatées en français avec le format suivant :
- Jour numérique
- Mois abrégé
- Année
- Heure au format 24h avec minutes

Exemple : `22 jan. 2025, 14:30`

## Modifications apportées

### Fichier modifié
- `/apps/mobile/app/(tabs)/profile/index.tsx`

### Changements principaux
1. Ajout de l'interface `UserEvent`
2. Ajout du type `'events'` dans `TabType`
3. Ajout des états `userEvents` et `loadingEvents`
4. Création de la fonction `fetchUserEvents()`
5. Création de la fonction `formatDate()`
6. Ajout de la section 'events' dans la liste des sections
7. Ajout du handler pour charger les événements lors du clic
8. Ajout de l'affichage des événements dans la modale
9. Suppression du bouton "Mes événements" de la section Actions (remplacé par la section dans la liste)
10. Ajout des styles pour l'affichage des événements

## Arborescence des composants

```
ProfilePage (index.tsx)
├── PageLayout
│   ├── Header (avatar, nom, bio, ville)
│   ├── Stats (événements créés, participations, jeux, amis)
│   ├── SectionsListContainer
│   │   └── Sections cliquables
│   │       ├── Mes infos
│   │       ├── Mes amis
│   │       ├── Mes événements (NOUVEAU)
│   │       ├── Confidentialité
│   │       ├── Notifications
│   │       ├── Sécurité
│   │       ├── Préférences
│   │       └── Mon compte
│   └── ActionsContainer
│       └── Déconnexion
└── Modal
    └── Contenu selon activeTab
        └── activeTab === 'events'
            ├── LoadingState (si loadingEvents)
            ├── EmptyState (si aucun événement)
            └── EventsList
                └── EventCard[] (pour chaque événement)
                    ├── EventTimeline (icône + ligne)
                    └── EventContent
                        ├── EventHeader (titre + badge)
                        ├── EventDate (date + lieu)
                        └── EventDescription (optionnel)
```

## États gérés

1. **loadingEvents** : Indique si les événements sont en cours de chargement
2. **userEvents** : Liste des événements de l'utilisateur (organisés + participés)
3. **activeTab** : Onglet actif dans la modale (peut être 'events')

## Gestion des erreurs

- Les erreurs de récupération des événements sont loggées dans la console
- L'interface affiche un état vide si aucun événement n'est trouvé
- Les erreurs n'empêchent pas l'affichage de la modale

## Cohérence avec le web

La fonctionnalité mobile est alignée avec l'implémentation web :
- Même logique de récupération des événements
- Même formatage des données
- Même distinction entre organisateur et participant
- Interface adaptée au mobile (timeline verticale, cards tactiles)

## Tests recommandés

1. Tester avec un utilisateur ayant des événements organisés
2. Tester avec un utilisateur ayant des événements participés
3. Tester avec un utilisateur ayant les deux types d'événements
4. Tester avec un utilisateur sans événements
5. Tester la navigation vers les détails d'un événement
6. Tester le chargement des événements
7. Vérifier le formatage des dates en français

## Améliorations futures possibles

1. Ajout d'un filtre pour séparer les événements organisés et participés
2. Ajout d'un filtre par date (passés/futurs)
3. Ajout d'une recherche dans les événements
4. Ajout d'un pull-to-refresh pour recharger les événements
5. Mise en cache des événements pour améliorer les performances


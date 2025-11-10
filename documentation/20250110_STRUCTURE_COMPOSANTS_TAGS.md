# Structure des composants - Système de tags

Date de création : 10 janvier 2025

## Arborescence des fichiers créés

```
.
├── supabase/
│   └── migrations/
│       └── 20250110000000_create_tags_tables.sql
│
├── apps/
│   ├── web/
│   │   └── components/
│   │       └── events/
│   │           ├── TagSelector.tsx          (Sélection de tags)
│   │           └── EventTags.tsx          (Affichage des tags)
│   │
│   └── mobile/
│       └── components/
│           └── events/
│               ├── TagSelector.tsx         (Sélection de tags - React Native)
│               └── EventTags.tsx           (Affichage des tags - React Native)
│
└── documentation/
    ├── 20250110_TAGS_IMPLEMENTATION.md    (Documentation complète)
    ├── 20250110_STRUCTURE_COMPOSANTS_TAGS.md (Ce fichier)
    └── INTEGRATION_TAGS_GUIDE.md          (Guide d'intégration)
```

## Composants créés

### TagSelector (Web)
**Fichier** : `apps/web/components/events/TagSelector.tsx`

**Fonctionnalités** :
- Chargement automatique des tags depuis Supabase
- Sélection multiple avec checkboxes visuelles
- Validation : maximum 3 tags
- Feedback visuel pour les tags sélectionnés (badges roses)
- Gestion des erreurs et états de chargement
- Accessibilité : navigation au clavier, ARIA labels

**Props** :
```typescript
interface TagSelectorProps {
  selectedTags: string[]        // IDs des tags sélectionnés
  onTagsChange: (tagIds: string[]) => void  // Callback de changement
  error?: string                // Message d'erreur optionnel
  maxTags?: number             // Nombre maximum (défaut: 3)
}
```

### TagSelector (Mobile)
**Fichier** : `apps/mobile/components/events/TagSelector.tsx`

**Fonctionnalités** :
- Même fonctionnalité que la version web
- Interface adaptée à React Native
- Utilise TouchableOpacity pour l'interaction
- Styles avec StyleSheet

**Props** : Identiques à la version web

### EventTags (Web)
**Fichier** : `apps/web/components/events/EventTags.tsx`

**Fonctionnalités** :
- Affichage des tags sous forme de badges roses
- Style cohérent avec le design system
- Masquage automatique si aucun tag

**Props** :
```typescript
interface EventTagsProps {
  tags: Tag[]                   // Liste des tags à afficher
  className?: string            // Classes CSS additionnelles
}
```

### EventTags (Mobile)
**Fichier** : `apps/mobile/components/events/EventTags.tsx`

**Fonctionnalités** :
- Même fonctionnalité que la version web
- Styles React Native avec StyleSheet
- Layout flex pour l'affichage en ligne

**Props** :
```typescript
interface EventTagsProps {
  tags: Tag[]                   // Liste des tags à afficher
  style?: any                   // Styles additionnels
}
```

## Structure de la base de données

```
tags
├── id (uuid, PK)
├── name (text, unique)
├── color (text, nullable)
└── created_at (timestamptz)

event_tags
├── event_id (uuid, FK → events.id)
├── tag_id (uuid, FK → tags.id)
├── created_at (timestamptz)
└── PRIMARY KEY (event_id, tag_id)
```

## Flux de données

### Création d'événement avec tags

```
1. Utilisateur ouvre le formulaire de création
   ↓
2. TagSelector charge les tags disponibles depuis Supabase
   ↓
3. Utilisateur sélectionne jusqu'à 3 tags
   ↓
4. Lors de la soumission :
   - Création de l'événement
   - Insertion des relations dans event_tags
   ↓
5. Redirection vers la page de détails
```

### Affichage des tags dans les détails

```
1. Page de détails charge l'événement
   ↓
2. Requête Supabase pour charger les tags associés :
   SELECT tag_id, tags(id, name) FROM event_tags WHERE event_id = ?
   ↓
3. Transformation des données
   ↓
4. Affichage via le composant EventTags
```

## Intégration dans les pages existantes

### Page de création (Web)
**Fichier à modifier** : `apps/web/components/events/CreateEventForm.tsx`

**Modifications** :
1. Import de TagSelector
2. Ajout de l'état `selectedTags`
3. Ajout du composant dans le formulaire
4. Sauvegarde des tags dans `handleSubmit`

### Page de création (Mobile)
**Fichier à modifier** : `apps/mobile/app/(tabs)/create-event.tsx`

**Modifications** : Identiques à la version web

### Page de détails (Web)
**Fichier à modifier** : `apps/web/app/events/[id]/page.tsx`

**Modifications** :
1. Import de EventTags
2. Transformation des données de tags déjà chargées
3. Ajout du composant dans le JSX

### Page de détails (Mobile)
**Fichier à modifier** : `apps/mobile/app/(tabs)/events/[id].tsx`

**Modifications** :
1. Chargement des tags de l'événement
2. Import de EventTags
3. Ajout du composant dans le JSX

## Styles et design

### Couleurs des badges
- **Sélectionné** : `bg-pink-100 text-pink-800 border-pink-300`
- **Non sélectionné** : `bg-gray-100 text-gray-700 border-gray-300`
- **Désactivé** : Opacité 50%

### Tailles
- Padding : `px-3 py-1.5` (web) / `paddingHorizontal: 12, paddingVertical: 8` (mobile)
- Border radius : `rounded-full` (20px)
- Font size : `text-sm` (14px)
- Font weight : `font-medium` (500)

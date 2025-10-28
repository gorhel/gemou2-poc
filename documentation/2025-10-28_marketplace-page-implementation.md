# Implémentation de la Page Marketplace

**Date de création :** 28 octobre 2025  
**Auteur :** Assistant AI  
**Version :** 1.0

## 📋 Vue d'ensemble

Ce document détaille l'implémentation de la page `/marketplace` qui affiche les annonces de ventes, d'échanges et de dons de jeux de société. L'affichage est similaire à celui de la page `/events` pour assurer une cohérence dans l'interface utilisateur.

## 🎯 Objectifs

1. Afficher les annonces de marketplace (ventes, échanges, dons)
2. Permettre le filtrage par typologie d'annonce
3. Assurer une cohérence visuelle avec la page `/events`
4. Implémenter la fonctionnalité pour web et mobile

## 🏗️ Architecture

### Structure des composants Web

```
/marketplace
  ├── page.tsx (Page principale)
  └── /components
      ├── MarketplaceListings.tsx (Liste avec filtres)
      └── MarketplaceCard.tsx (Carte d'annonce)
```

### Structure des composants Mobile

```
/app/(tabs)
  ├── marketplace.tsx (Page principale)
  └── /components/marketplace
      ├── MarketplaceList.tsx (Liste avec filtres)
      └── MarketplaceCard.tsx (Carte d'annonce)
```

## 📦 Types et Interfaces

### MarketplaceItemType

Ajout du type `'donation'` aux types existants :

```typescript
export type MarketplaceItemType = 
  | 'sale'      // Vente
  | 'exchange'  // Échange
  | 'donation'  // Don (nouveau)
```

### MarketplaceItemStatus

Ajout du statut `'donated'` :

```typescript
export type MarketplaceItemStatus = 
  | 'draft'
  | 'available'
  | 'sold'
  | 'exchanged'
  | 'donated'    // Nouveau
  | 'closed'
```

### Emojis par Type

```typescript
const TYPE_ICONS = {
  sale: '💰',      // Vente
  exchange: '🔄', // Échange
  donation: '🎁'   // Don
}
```

## 🎨 Composants

### 1. MarketplaceCard (Web)

**Emplacement :** `apps/web/components/marketplace/MarketplaceCard.tsx`

**Fonctionnalités :**
- Affichage en format carte similaire à `EventCard`
- Image de l'annonce (ou image par défaut)
- Titre précédé de l'emoji correspondant au type
- Prix pour les ventes, "Gratuit" pour les dons
- Localisation de l'annonce
- Nom du jeu (si disponible)
- Jeu recherché (pour les échanges)
- Actions au hover (Voir détails, Contacter)

**Props :**
```typescript
interface MarketplaceCardProps {
  item: MarketplaceItemEnriched
  onViewDetails: (item: MarketplaceItemEnriched) => void
  onContact?: (itemId: string) => void
}
```

### 2. MarketplaceListings (Web)

**Emplacement :** `apps/web/components/marketplace/MarketplaceListings.tsx`

**Fonctionnalités :**
- Filtres par type (Tous, Vente, Échange, Don)
- Chargement des annonces depuis Supabase
- Grille responsive (1 col mobile, 2 cols tablette, 3 cols desktop)
- États : loading, error, empty
- Limite configurable d'annonces

**Props :**
```typescript
interface MarketplaceListingsProps {
  limit?: number  // Par défaut: 50
}
```

### 3. MarketplaceCard (Mobile)

**Emplacement :** `apps/mobile/components/marketplace/MarketplaceCard.tsx`

**Fonctionnalités :**
- Affichage en carte avec image de fond
- Overlay sombre pour la lisibilité
- Badge type en haut à droite
- Informations en bas de carte
- Format similaire à `EventCard` mobile

### 4. MarketplaceList (Mobile)

**Emplacement :** `apps/mobile/components/marketplace/MarketplaceList.tsx`

**Fonctionnalités :**
- Filtres horizontaux défilables
- Liste verticale d'annonces
- Pull-to-refresh
- États de chargement et erreur

## 🎨 Affichage des Annonces

### Informations affichées par item

1. **Image**
   - Image de l'annonce (si disponible)
   - Photo du jeu (si disponible)
   - Image par défaut (placeholder)

2. **En-tête**
   - Emoji du type d'annonce
   - Titre de l'annonce

3. **Contenu**
   - Prix (pour les ventes) : `XX.XX €`
   - "Gratuit" (pour les dons)
   - Localisation : `📍 Quartier, Ville`
   - Nom du jeu : `🎮 Nom du jeu`
   - Jeu recherché : `🔍 Cherche: Nom du jeu` (pour les échanges)

4. **Actions**
   - Bouton "Voir détails"
   - Bouton "Contacter" (si annonce disponible)

## 🔍 Filtres

Les filtres permettent de trier les annonces par type :

- **Tous** : Affiche toutes les annonces
- **💰 Vente** : Uniquement les ventes
- **🔄 Échange** : Uniquement les échanges
- **🎁 Don** : Uniquement les dons

## 📱 Pages

### Page Web (`/marketplace`)

**Emplacement :** `apps/web/app/marketplace/page.tsx`

**Structure :**
```tsx
<ResponsiveLayout>
  <PageHeader
    icon="🛒"
    title="Marketplace"
    subtitle="Achetez, vendez et échangez vos jeux de société"
    actions={<Button>Créer une annonce</Button>}
  />
  <MarketplaceListings limit={50} />
  <PageFooter />
</ResponsiveLayout>
```

### Page Mobile (`/marketplace`)

**Emplacement :** `apps/mobile/app/(tabs)/marketplace.tsx`

**Structure :**
```tsx
<SafeAreaView>
  <Header>
    <Title>🛒 Marketplace</Title>
    <CreateButton />
  </Header>
  <MarketplaceList limit={50} />
</SafeAreaView>
```

## 🗄️ Base de Données

### Table utilisée

```sql
marketplace_items_enriched  -- Vue enrichie avec infos du vendeur et du jeu
```

### Champs principaux

- `id` : Identifiant unique
- `title` : Titre de l'annonce
- `type` : Type d'annonce (sale, exchange, donation)
- `price` : Prix (pour les ventes)
- `status` : Statut de l'annonce
- `images` : Tableau d'URLs d'images
- `location_quarter` : Quartier
- `location_city` : Ville
- `game_name` : Nom du jeu
- `game_photo` : Photo du jeu
- `wanted_game` : Jeu recherché (pour les échanges)

## 🎨 Style et Design

### Grille responsive

- **Mobile** : 1 colonne
- **Tablette** : 2 colonnes
- **Desktop** : 3 colonnes

### Cartes d'annonce

- **Hauteur** : 192px (h-48)
- **Format** : Image de fond avec overlay
- **Coins** : Arrondis (rounded-lg)
- **Effet hover** : Scale 1.05, diminution de l'opacity de l'overlay
- **Shadow** : Légère ombre portée

### Couleurs

- **Vente** : Vert (#10b981) pour le prix
- **Don** : Badge violet pour le statut
- **Bouton primaire** : Bleu (#3b82f6)
- **Bouton secondaire** : Vert (#10b981)

## 🔄 Flux de Données

### Chargement des annonces

1. Appel à Supabase : `marketplace_items_enriched`
2. Filtrage par statut : `status = 'available'`
3. Tri par date : `order('created_at', { ascending: false })`
4. Limite : Configurable (par défaut 50)

### Filtrage côté client

```typescript
const filteredItems = items.filter(item => {
  if (filter === 'all') return true
  return item.type === filter
})
```

## 🧪 États de l'Interface

### 1. État de Chargement (Loading)

```tsx
<LoadingSpinner />
<Text>Chargement des annonces...</Text>
```

### 2. État d'Erreur (Error)

```tsx
<ErrorIcon />
<Title>Erreur de chargement</Title>
<Message>{error}</Message>
<Button onClick={retry}>Réessayer</Button>
```

### 3. État Vide (Empty)

```tsx
<Emoji>🛒</Emoji>
<Title>Aucune annonce trouvée</Title>
<Message>
  {filter === 'all' 
    ? 'Il n\'y a pas encore d\'annonces disponibles.'
    : `Aucune annonce de type "${TYPE_LABELS[filter]}" n'est disponible.`
  }
</Message>
```

## 📊 Arbre des Composants

### Page Web

```
MarketplacePage (page.tsx)
└── ResponsiveLayout
    ├── PageHeader
    │   ├── Icon: 🛒
    │   ├── Title: "Marketplace"
    │   ├── Subtitle
    │   └── Actions
    │       └── Button "Créer une annonce"
    ├── MarketplaceListings
    │   ├── Filters
    │   │   ├── Button "Tous"
    │   │   ├── Button "💰 Vente"
    │   │   ├── Button "🔄 Échange"
    │   │   └── Button "🎁 Don"
    │   └── Grid
    │       └── MarketplaceCard[] (pour chaque annonce)
    │           ├── ImageBackground
    │           ├── TypeBadge
    │           ├── Title (avec emoji)
    │           ├── Price/Location/GameInfo
    │           └── HoverActions
    │               ├── Button "Voir détails"
    │               └── Button "Contacter"
    └── PageFooter
```

### Page Mobile

```
MarketplacePage (marketplace.tsx)
└── SafeAreaView
    ├── Header
    │   ├── Title: "🛒 Marketplace"
    │   ├── Subtitle
    │   └── CreateButton
    └── MarketplaceList
        ├── FilterButtons (ScrollView horizontal)
        │   ├── Button "Tous"
        │   ├── Button "💰 Vente"
        │   ├── Button "🔄 Échange"
        │   └── Button "🎁 Don"
        └── ScrollView
            └── MarketplaceCard[] (pour chaque annonce)
                ├── ImageBackground
                ├── Overlay
                ├── TypeBadge
                ├── Title (avec emoji)
                └── InfoSection
                    ├── Price
                    ├── Location
                    ├── GameName
                    └── WantedGame (si échange)
```

## ✅ Améliorations Apportées

### 1. Ajout du type "Don"

- Type `'donation'` ajouté aux types d'annonces
- Emoji 🎁 pour les dons
- Affichage "Gratuit" au lieu d'un prix
- Statut `'donated'` ajouté

### 2. Cohérence avec `/events`

- Format de carte similaire
- Même système de filtres
- Même grille responsive
- États (loading, error, empty) identiques

### 3. Expérience utilisateur

- Affichage clair des informations essentielles
- Actions au hover (web)
- Navigation intuitive
- Filtrage rapide et simple

### 4. Performance

- Limite configurable d'annonces
- Chargement optimisé depuis Supabase
- Filtrage côté client pour réactivité

## 🔧 Configuration Requise

### Dépendances

- **Web** : React, Next.js, Supabase Client
- **Mobile** : React Native, Expo Router, Supabase Client

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=<votre_url_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre_cle_anon>
```

## 📝 Notes Techniques

### Images par défaut

- Web : `/placeholder-game.jpg`
- Mobile : `https://via.placeholder.com/400x200`

### Navigation

- **Web** : Redirection vers `/trade/${item.id}`
- **Mobile** : Router push vers `/trade/${item.id}`

### Gestion des erreurs

- Affichage d'un message d'erreur convivial
- Bouton "Réessayer" pour recharger
- Logs console pour le débogage

## 🚀 Prochaines Étapes

1. **Modal de détails** : Implémenter une modal pour voir les détails sans quitter la page
2. **Fonctionnalité de contact** : Permettre de contacter le vendeur
3. **Recherche** : Ajouter une barre de recherche
4. **Tri** : Options de tri (prix, date, proximité)
5. **Favoris** : Système de favoris pour les annonces

## 📚 Références

- **Types** : `apps/web/types/marketplace.ts`
- **Composants Web** : `apps/web/components/marketplace/`
- **Composants Mobile** : `apps/mobile/components/marketplace/`
- **Page Web** : `apps/web/app/marketplace/page.tsx`
- **Page Mobile** : `apps/mobile/app/(tabs)/marketplace.tsx`

---

**Fin du document**


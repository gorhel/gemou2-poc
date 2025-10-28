# Implémentation de la page Marketplace Web

**Date**: 27 octobre 2025  
**Auteur**: Assistant AI  
**Fichiers modifiés**:
- `apps/web/app/marketplace/page.tsx` (créé)
- `apps/web/components/marketplace/MarketplaceListings.tsx` (refonte complète)
- `apps/web/types/marketplace.ts` (ajout du type "donation")

## 📋 Vue d'ensemble

Création de la page Marketplace pour l'application web avec un affichage cohérent avec la version mobile. Cette page permet aux utilisateurs de consulter, rechercher et filtrer les annonces de vente, d'échange et de don de jeux de société.

## 🎯 Objectifs

1. Créer une page marketplace complète pour la version web
2. Implémenter un système de filtres par typologie (Tout / Vente / Échange / Don)
3. Ajouter une barre de recherche pour filtrer les annonces
4. Afficher les annonces dans un style liste similaire à la version mobile
5. Assurer la cohérence visuelle avec la page Events

## 🔄 Modifications principales

### 1. Création de la page Marketplace (`apps/web/app/marketplace/page.tsx`)

Nouvelle page Next.js qui suit le même pattern que la page Events :

```typescript
export default function MarketplacePage() {
  // Authentication check
  // Utilisation de ResponsiveLayout
  // PageHeader avec titre et actions
  // MarketplaceListings component
  // PageFooter
}
```

**Caractéristiques** :
- Vérification de l'authentification
- Redirection vers `/login` si non authentifié
- Layout responsive avec header et footer
- Bouton "Créer une annonce" dans le header

### 2. Ajout du type "donation" (`apps/web/types/marketplace.ts`)

Extension du type `MarketplaceItemType` pour inclure les dons :

```typescript
export type MarketplaceItemType = 
  | 'sale'
  | 'exchange'
  | 'donation';

export const TYPE_LABELS: Record<MarketplaceItemType, string> = {
  sale: 'Vente',
  exchange: 'Échange',
  donation: 'Don'
};
```

Mise à jour de la fonction `getTypeIcon` :

```typescript
export function getTypeIcon(type: MarketplaceItemType): string {
  const icons: Record<MarketplaceItemType, string> = {
    sale: '💰',
    exchange: '🔄',
    donation: '🎁'
  };
  
  return icons[type] || '📦';
}
```

### 3. Refonte complète du composant MarketplaceListings

#### États ajoutés

```typescript
const [filteredItems, setFilteredItems] = useState<MarketplaceItemEnriched[]>([])
const [filter, setFilter] = useState<'all' | MarketplaceItemType>('all')
const [searchQuery, setSearchQuery] = useState('')
```

#### Logique de filtrage

```typescript
useEffect(() => {
  let filtered = [...items]

  // Filtre par type
  if (filter !== 'all') {
    filtered = filtered.filter(item => item.type === filter)
  }

  // Filtre par recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(item =>
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.game_name?.toLowerCase().includes(query)
    )
  }

  setFilteredItems(filtered)
}, [items, filter, searchQuery])
```

#### Structure d'affichage

```
┌─────────────────────────────────────────────────┐
│ [Barre de recherche]                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ [Tout] [💰 Vente] [🔄 Échange] [🎁 Don]        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 💰 [Titre de l'annonce]             [IMAGE]    │
│                                                 │
│ Description de l'annonce...                     │
│                                                 │
│ 45€                        📍 Paris             │
└─────────────────────────────────────────────────┘
```

## 🎨 Arborescence des composants

```
MarketplacePage
└── ResponsiveLayout
    ├── PageHeader
    │   ├── Icon: 🛒
    │   ├── Title: "Marketplace"
    │   ├── Subtitle: "Achetez, vendez et échangez..."
    │   └── Actions
    │       └── Button "Créer une annonce"
    ├── MainContent
    │   └── MarketplaceListings
    │       ├── SearchBar
    │       │   └── Input (recherche)
    │       ├── Filters
    │       │   ├── Button "Tout"
    │       │   ├── Button "💰 Vente"
    │       │   ├── Button "🔄 Échange"
    │       │   └── Button "🎁 Don"
    │       └── ItemsList
    │           ├── EmptyState (si aucune annonce)
    │           └── Items (si annonces présentes)
    │               └── ItemCard (pour chaque annonce)
    │                   ├── TextContent
    │                   │   ├── Header (emoji + titre)
    │                   │   ├── Description
    │                   │   └── Meta (prix + localisation)
    │                   └── Image
    └── PageFooter
```

## 🎨 Design & Styling

### Barre de recherche

```tsx
<input
  type="text"
  placeholder="Rechercher un jeu..."
  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-primary-500 
             focus:border-transparent"
/>
```

### Filtres

```tsx
<button
  className={`px-4 py-2 rounded-full font-medium transition-colors ${
    filter === 'sale'
      ? 'bg-primary-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  💰 Vente
</button>
```

**États visuels** :
- Actif : fond bleu primaire (`bg-primary-600`), texte blanc
- Inactif : fond gris clair (`bg-gray-100`), texte gris foncé
- Hover : fond gris plus foncé (`hover:bg-gray-200`)

### Cartes d'annonces

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 
                overflow-hidden transition-all hover:shadow-md 
                hover:-translate-y-0.5">
  <div className="flex p-4">
    <div className="flex-1 min-w-0 mr-4">
      {/* Contenu texte */}
    </div>
    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32">
      {/* Image */}
    </div>
  </div>
</div>
```

**Effets interactifs** :
- Hover : ombre plus prononcée + légère translation vers le haut
- Transitions fluides sur tous les changements d'état

## 📊 Gestion des images

### Ordre de priorité

1. **Image personnalisée** : Si `item.images` existe et contient au moins une image
2. **Photo du jeu** : Si `item.game_photo` existe
3. **Placeholder** : Affichage de l'emoji de la typologie

```typescript
const imageUrl = item.images && item.images.length > 0 
  ? item.images[0] 
  : item.game_photo

{imageUrl ? (
  <img
    src={imageUrl}
    alt={item.title}
    className="w-full h-full object-cover rounded-lg"
  />
) : (
  <div className="w-full h-full bg-gray-100 rounded-lg 
                  flex items-center justify-center">
    <span className="text-4xl">{emoji}</span>
  </div>
)}
```

## 🎯 Typologies d'annonces

| Type | Emoji | Label | Affichage prix | Couleur |
|------|-------|-------|----------------|---------|
| `sale` | 💰 | Vente | Oui | Vert (`text-green-600`) |
| `exchange` | 🔄 | Échange | Non | - |
| `donation` | 🎁 | Don | Non | - |

## 🔍 Fonctionnalités de recherche et filtrage

### Recherche textuelle

La recherche s'effectue dans :
- Le **titre** de l'annonce (`item.title`)
- La **description** de l'annonce (`item.description`)
- Le **nom du jeu** (`item.game_name`)

**Comportement** :
- Insensible à la casse (`.toLowerCase()`)
- Recherche par inclusion (`.includes()`)
- Temps réel (mise à jour à chaque frappe)

### Filtres par typologie

**Options disponibles** :
1. **Tout** : Affiche toutes les annonces
2. **💰 Vente** : Annonces de type `sale`
3. **🔄 Échange** : Annonces de type `exchange`
4. **🎁 Don** : Annonces de type `donation`

**Comportement** :
- Un seul filtre actif à la fois
- Combine avec la recherche textuelle
- Mise à jour instantanée de la liste

## 📱 Responsive Design

### Breakpoints

- **Mobile** : Affichage pleine largeur, image 24x24 (w-24 h-24)
- **Desktop** : Affichage large, image 32x32 (sm:w-32 sm:h-32)

### Adaptations

```tsx
className="w-24 h-24 sm:w-32 sm:h-32"  // Image
className="max-w-7xl mx-auto"          // Container principal
className="px-4 py-6 sm:px-0"          // Padding responsive
```

## 🚀 Performances

### Optimisations implémentées

1. **Filtrage côté client** : Évite les requêtes répétées à la base de données
2. **Limit 50** : Limite le nombre d'annonces chargées initialement
3. **useEffect dependencies** : Recalcul uniquement quand nécessaire
4. **Transitions CSS** : Utilisation de `transition-all` pour les animations fluides

### Chargement des données

```typescript
const { data, error: fetchError } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('status', 'available')
  .order('created_at', { ascending: false })
  .limit(limit)
```

**Critères** :
- Statut : `available` uniquement
- Tri : Par date de création décroissante
- Limite : 50 annonces par défaut

## ✅ États de l'interface

### État Loading

```tsx
<div className="flex justify-center py-8">
  <LoadingSpinner size="lg" />
</div>
```

### État Error

```tsx
<div className="text-center py-8">
  <p className="text-red-600">{error}</p>
</div>
```

### État Empty

```tsx
<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
  <div className="text-4xl mb-3">🛒</div>
  <p className="text-gray-600 mb-2">Aucune annonce</p>
  <p className="text-sm text-gray-500">
    {searchQuery ? 'Aucun résultat' : 'Soyez le premier à publier !'}
  </p>
</div>
```

**Message adaptatif** :
- Si recherche active : "Aucun résultat"
- Sinon : "Soyez le premier à publier !"

## 🔗 Navigation

### Routes

- **Page liste** : `/marketplace`
- **Détail annonce** : `/trade/[id]`
- **Création** : `/create-trade`

### Liens

Toutes les cartes d'annonces sont cliquables et redirigent vers la page de détail :

```tsx
<Link href={`/trade/${item.id}`} className="block">
  {/* Contenu de la carte */}
</Link>
```

## 📊 Base de données

### Vue utilisée

`marketplace_items_enriched` : Vue Supabase qui joint les données des annonces avec :
- Informations du vendeur (`seller_*`)
- Informations du jeu (`game_*`)

### Champs affichés

- `id` : Identifiant unique
- `title` : Titre de l'annonce
- `description` : Description
- `type` : Type (sale / exchange / donation)
- `price` : Prix (si vente)
- `images` : Tableau d'URLs d'images
- `game_photo` : Photo du jeu (fallback)
- `location_city` : Ville
- `location_quarter` : Quartier

## 🔮 Améliorations futures

### Fonctionnalités

1. **Pagination** : Charger plus d'annonces au scroll (infinite scroll)
2. **Tri avancé** : Par prix, date, distance
3. **Filtres supplémentaires** :
   - Par prix (min/max)
   - Par ville
   - Par état du jeu
   - Avec/sans livraison
4. **Favoris** : Système de sauvegarde d'annonces
5. **Comparaison** : Comparer plusieurs annonces
6. **Alertes** : Notifications pour nouvelles annonces correspondant aux critères

### UX/UI

1. **Skeleton loading** : Placeholder pendant le chargement
2. **Images carousel** : Afficher toutes les images d'une annonce
3. **Preview modal** : Aperçu rapide sans quitter la page
4. **Filtres persistants** : Sauvegarder les préférences de filtrage
5. **Vue grille/liste** : Toggle entre différents modes d'affichage
6. **Badges** : Annonces récentes, populaires, proches

### Performances

1. **Virtualisation** : Pour les longues listes
2. **Cache d'images** : Optimisation du chargement
3. **Lazy loading** : Chargement progressif des images
4. **Service Worker** : Cache pour mode hors ligne

## 🧪 Tests à effectuer

### Fonctionnels

- [ ] Authentification requise (redirection si non connecté)
- [ ] Affichage correct de toutes les annonces
- [ ] Filtres fonctionnels (tous les types)
- [ ] Recherche textuelle fonctionnelle
- [ ] Combinaison recherche + filtres
- [ ] Navigation vers le détail
- [ ] Bouton "Créer une annonce"

### Visuels

- [ ] Affichage des images personnalisées
- [ ] Fallback sur game_photo
- [ ] Placeholder avec emoji si pas d'image
- [ ] Emoji correct selon la typologie
- [ ] Prix affiché uniquement pour les ventes
- [ ] Localisation affichée pour tous les items
- [ ] Responsive mobile et desktop

### Performance

- [ ] Temps de chargement initial < 2s
- [ ] Filtrage instantané (< 100ms)
- [ ] Recherche fluide sans lag
- [ ] Animations fluides (60fps)

## 🔒 Sécurité

### Authentification

- Vérification de l'utilisateur au chargement
- Redirection automatique vers `/login` si non authentifié
- Protection des routes sensibles

### Données

- Utilisation de la vue enrichie (pas de données sensibles exposées)
- Filtrage côté serveur (status = 'available')
- Validation des images avant affichage

## 📝 Notes techniques

### Dépendances

- `next`: Framework React
- `react`: Bibliothèque UI
- `@supabase/supabase-js`: Client Supabase
- Composants UI custom (`LoadingSpinner`, `Button`, etc.)

### Composants réutilisables

- `ResponsiveLayout` : Layout responsive avec navigation
- `PageHeader` : Header de page avec actions
- `PageFooter` : Footer de page
- `LoadingSpinner` : Indicateur de chargement

### Configuration Tailwind

Classes personnalisées utilisées :
- `primary-*` : Couleurs principales de la marque
- `line-clamp-2` : Limitation à 2 lignes
- Breakpoints : `sm:`, `md:`, `lg:`

## 🔗 Cohérence avec la version mobile

### Points communs

1. **Filtres identiques** : Même typologie de filtres
2. **Emojis** : Mêmes emojis pour chaque type
3. **Structure** : Image à droite, contenu à gauche
4. **Informations** : Titre, description, prix, localisation
5. **Navigation** : Vers `/trade/[id]` pour le détail

### Différences

| Aspect | Mobile | Web |
|--------|--------|-----|
| Layout | FlatList natif | Div avec space-y |
| Images | 80x80 fixe | 24x24 → 32x32 responsive |
| Filtres | ScrollView horizontal | Flex-wrap |
| Recherche | TextInput | Input HTML |
| Transitions | Native animations | CSS transitions |

## 📚 Références

- Fichier page : `apps/web/app/marketplace/page.tsx`
- Composant liste : `apps/web/components/marketplace/MarketplaceListings.tsx`
- Types : `apps/web/types/marketplace.ts`
- Version mobile : `apps/mobile/app/(tabs)/marketplace.tsx`
- Design inspiré de : `apps/web/app/events/page.tsx`


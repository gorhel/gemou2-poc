# Refonte de l'affichage de la page Marketplace

**Date**: 27 octobre 2025  
**Auteur**: Assistant AI  
**Fichier modifié**: `apps/mobile/app/(tabs)/marketplace.tsx`

## 📋 Vue d'ensemble

Refonte complète de l'affichage de la page Marketplace pour améliorer l'expérience utilisateur et aligner le design avec celui de la page Events.

## 🎯 Objectifs

1. Afficher les images des annonces avec fallback pour les annonces sans image
2. Aligner le design avec la page Events pour une cohérence visuelle
3. Afficher clairement la typologie des annonces avec des emojis
4. Mettre en évidence le prix et la localisation

## 🔄 Modifications principales

### 1. Imports ajoutés

```typescript
import {
  // ... imports existants
  Image,      // Pour afficher les images des annonces
  FlatList    // Pour un rendu optimisé de la liste
} from 'react-native'
```

### 2. Nouvelle fonction de rendu des items

Création de la fonction `renderItem` qui gère l'affichage de chaque annonce :

```typescript
const renderItem = ({ item }: { item: MarketplaceItem }) => {
  const emoji = getTypeEmoji(item.type);
  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/trade/${item.id}`)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemTextContent}>
          {/* Contenu à gauche */}
        </View>
        <View style={styles.itemImageContainer}>
          {/* Image à droite */}
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

### 3. Structure de l'affichage

#### Layout des cartes d'annonces

```
┌─────────────────────────────────────────┐
│ 💰 [Titre de l'annonce]        [IMAGE] │
│                                         │
│ Description courte...                   │
│                                         │
│ 45€            📍 Paris                 │
└─────────────────────────────────────────┘
```

- **Gauche** : Emoji + Titre, Description, Prix + Localisation
- **Droite** : Image (80x80) ou placeholder avec emoji

#### Composants visuels

1. **Header de l'item** : Emoji + Titre sur une même ligne
2. **Description** : Limitée à 2 lignes avec ellipse
3. **Meta** : Prix (si vente) + Localisation
4. **Image** : 
   - Si disponible : première image du tableau `images`
   - Sinon : placeholder avec emoji de la typologie

### 4. Remplacement de la liste simple par FlatList

```typescript
<FlatList
  data={filteredItems}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  style={styles.itemsList}
  contentContainerStyle={styles.itemsListContent}
  showsVerticalScrollIndicator={false}
/>
```

**Avantages** :
- Performances optimisées pour de longues listes
- Rendu virtuel (seuls les éléments visibles sont rendus)
- Meilleure gestion de la mémoire

### 5. Styles mis à jour

#### Nouveaux styles ajoutés

```typescript
itemContent: {
  flexDirection: 'row',
  padding: 16,
},
itemTextContent: {
  flex: 1,
  marginRight: 12,
},
itemImageContainer: {
  width: 80,
  height: 80,
  borderRadius: 8,
  overflow: 'hidden',
},
itemImage: {
  width: '100%',
  height: '100%',
},
itemImagePlaceholder: {
  width: '100%',
  height: '100%',
  backgroundColor: '#e5e7eb',
  justifyContent: 'center',
  alignItems: 'center',
},
itemImageEmoji: {
  fontSize: 32,
},
```

#### Styles modifiés

- `itemHeader` : Maintenant flex-row avec emoji et titre côte à côte
- `itemEmoji` : Taille réduite (20 au lieu de 32) car il est inline avec le titre
- `itemTitle` : Ajout de `flex: 1` pour occuper l'espace disponible
- `itemCard` : Suppression du padding (déplacé vers itemContent)

### 6. Logique d'affichage des images

```typescript
const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

{imageUrl ? (
  <Image 
    source={{ uri: imageUrl }} 
    style={styles.itemImage}
    resizeMode="cover"
  />
) : (
  <View style={styles.itemImagePlaceholder}>
    <Text style={styles.itemImageEmoji}>{emoji}</Text>
  </View>
)}
```

**Logique** :
1. Vérifie si le tableau `images` existe et contient au moins une image
2. Si oui : affiche la première image
3. Si non : affiche un placeholder avec l'emoji correspondant à la typologie

### 7. Affichage conditionnel du prix

```typescript
{item.price && item.type === 'sale' && (
  <Text style={styles.itemPrice}>{item.price}€</Text>
)}
```

Le prix n'est affiché que pour les annonces de type "vente" et si un prix est défini.

## 🎨 Arborescence des composants

```
MarketplacePage
├── PageLayout (avec header et pull-to-refresh)
│   ├── SearchContainer
│   │   └── TextInput (recherche)
│   ├── Filters (ScrollView horizontal)
│   │   ├── FilterButton "Tout"
│   │   ├── FilterButton "💰 Vente"
│   │   ├── FilterButton "🔄 Échange"
│   │   └── FilterButton "🎁 Don"
│   └── ItemsList
│       ├── EmptyState (si aucune annonce)
│       └── FlatList (si annonces présentes)
│           └── ItemCard (pour chaque annonce)
│               └── ItemContent
│                   ├── ItemTextContent
│                   │   ├── ItemHeader (emoji + titre)
│                   │   ├── ItemDescription
│                   │   └── ItemMeta (prix + localisation)
│                   └── ItemImageContainer
│                       └── Image OU ImagePlaceholder
```

## 🎯 Typologies d'annonces

| Type | Emoji | Label | Affichage prix |
|------|-------|-------|----------------|
| `sale` | 💰 | Vente | Oui |
| `exchange` | 🔄 | Échange | Non |
| `donation` | 🎁 | Don | Non |
| `default` | 📦 | Autre | Non |

## 📱 Responsive & Accessibilité

### Responsive
- Layout flex adaptatif
- Image fixe 80x80 pour cohérence visuelle
- Textes avec `numberOfLines` pour éviter les débordements

### Accessibilité
- Emojis visuels pour identification rapide
- Contraste de couleurs conforme (textes sombres sur fond clair)
- Zones tactiles suffisamment grandes (cards entières cliquables)
- Feedback visuel sur les filtres actifs

## 🔍 Filtres disponibles

1. **Par typologie** : Tout / Vente / Échange / Don
2. **Par recherche** : Recherche textuelle dans titre et description

### Comportement des filtres
- Les filtres de typologie sont exclusifs (un seul actif à la fois)
- La recherche se combine avec le filtre de typologie
- L'état vide affiche un message adapté selon le contexte (recherche ou filtre)

## 📊 Gestion des états

### États gérés
1. **Loading** : Indicateur de chargement initial
2. **Refreshing** : Pull-to-refresh
3. **Empty** : Aucune annonce (avec CTA "Créer une annonce")
4. **Error** : Géré via console.error (à améliorer)

### État vide

```
🛒
Aucune annonce
[Aucun résultat | Soyez le premier à publier !]
[Créer une annonce]
```

## 🚀 Performances

### Optimisations implémentées
1. **FlatList** au lieu de map() pour virtualisation
2. **Image lazy loading** natif avec React Native
3. **Limite de 20 items** dans la requête Supabase
4. **Rendu conditionnel** pour éviter les calculs inutiles

## 🔮 Améliorations futures possibles

1. **Pagination** : Charger plus d'annonces au scroll
2. **Cache des images** : Utiliser une bibliothèque de cache d'images
3. **Filtres avancés** : Par prix, par distance, par état
4. **Skeleton loading** : Placeholder pendant le chargement
5. **Images multiples** : Carousel pour afficher toutes les images
6. **Localisation** : Tri par distance depuis la position de l'utilisateur
7. **Favoris** : Possibilité de sauvegarder des annonces

## 📝 Notes techniques

### Base de données
- Table : `marketplace_items`
- Champs utilisés : `id`, `title`, `description`, `type`, `price`, `location_city`, `images`, `status`
- Filtre : `status = 'active'`
- Tri : `created_at DESC`

### Navigation
- Route liste : `/(tabs)/marketplace`
- Route détail : `/trade/[id]`
- Route création : `/create-trade`

## ✅ Tests à effectuer

- [ ] Affichage correct avec images
- [ ] Affichage correct sans images (placeholder)
- [ ] Filtres de typologie fonctionnels
- [ ] Recherche textuelle fonctionnelle
- [ ] Navigation vers le détail
- [ ] Pull-to-refresh
- [ ] État vide avec différents scénarios
- [ ] Performances avec 100+ annonces
- [ ] Affichage du prix uniquement pour les ventes
- [ ] Affichage de la localisation sur tous les items

## 🔗 Références

- Fichier source : `apps/mobile/app/(tabs)/marketplace.tsx`
- Design inspiré de : `apps/mobile/app/(tabs)/events/index.tsx`
- Configuration header : `apps/mobile/config/headers.config.ts`


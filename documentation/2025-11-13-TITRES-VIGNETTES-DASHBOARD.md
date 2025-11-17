# Repositionnement des Titres sur les Vignettes du Dashboard

**Date**: 13 novembre 2025  
**Type**: Amélioration UI/UX  
**Plateforme**: Mobile (React Native)

---

## 📋 Résumé

Cette modification repositionne les titres des événements et des annonces directement sur leurs vignettes respectives, avec un centrage vertical au milieu de l'image. Un overlay sombre a été ajouté pour améliorer la lisibilité du texte blanc.

---

## 🎯 Objectif

Améliorer l'expérience utilisateur en :
- Maximisant l'espace disponible pour afficher l'information
- Créant un design plus moderne et épuré
- Améliorant la hiérarchie visuelle de l'interface
- Rendant les vignettes plus attrayantes visuellement

---

## 🔧 Modifications Techniques

### 1. Événements

#### Composant JSX
```typescript
<View style={styles.eventImageContainer}>
  {event.image_url ? (
    <Image
      source={{ uri: event.image_url }}
      style={styles.eventImage}
      resizeMode="cover"
    />
  ) : (
    <Image 
      source={require('../../assets/img/eventImagePlaceholder.png')} 
      style={styles.eventImagePlaceholder} 
    />
  )}
  <View style={styles.eventOverlay} />
  <Text style={styles.eventTitleOverlay} numberOfLines={2}>
    {event.title}
  </Text>
</View>
```

#### Styles ajoutés
```typescript
eventImageContainer: {
  height: 100,
  backgroundColor: '#112211',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8,
  position: 'relative', // ✨ Nouveau
},

eventOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  borderRadius: 8,
},

eventTitleOverlay: {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  transform: [{ translateY: -12 }], // Centre verticalement
  fontSize: 15,
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center',
  paddingHorizontal: 12,
  zIndex: 2,
},
```

### 2. Annonces Marketplace

#### Composant JSX
```typescript
<View style={styles.marketplaceImage}>
  {item.images && item.images.length > 0 ? (
    <Image 
      source={{ uri: item.images[0] }} 
      style={styles.marketplaceImageFill} 
    />
  ) : (
    <Text style={styles.marketplaceImagePlaceholder}>🎲</Text>
  )}
  {item.type === 'sale' && item.price && (
    <View style={styles.priceTag}>
      <Text style={styles.priceText}>{item.price.toFixed(2)} €</Text>
    </View>
  )}
  <View style={styles.marketplaceOverlay} />
  <Text style={styles.marketplaceTitleOverlay} numberOfLines={2}>
    {item.type === 'sale' && '💰  ' + item.title}
    {item.type === 'exchange' && '🔄  ' + item.title}
  </Text>
</View>
```

#### Styles ajoutés
```typescript
marketplaceImage: {
  height: 100,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  backgroundColor:'#112211',
  borderRadius: 8,
  marginBottom: 8, // ✨ Nouveau
},

marketplaceOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  borderRadius: 8,
},

marketplaceTitleOverlay: {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  transform: [{ translateY: -12 }], // Centre verticalement
  fontSize: 14,
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center',
  paddingHorizontal: 12,
  zIndex: 2,
},

priceTag: {
  position: 'absolute',
  bottom: 8,
  left: 8,
  backgroundColor: '#3b82f6',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  zIndex: 3, // ✨ Augmenté pour apparaître au-dessus de l'overlay
},
```

---

## 🎨 Structure des Composants

### Page Dashboard - Structure complète

```
DashboardPage
│
├── PageLayout
│   │
│   ├── SearchBar (TouchableOpacity)
│   │   ├── 🔍 Icon
│   │   └── "Recherche un événement..."
│   │
│   ├── Section: Événements à venir
│   │   ├── SectionHeader
│   │   │   ├── "Événements à venir"
│   │   │   └── "Voir tout" (TouchableOpacity)
│   │   │
│   │   └── ScrollView (horizontal)
│   │       └── EventCard[] (TouchableOpacity)
│   │           ├── eventImageContainer (View)
│   │           │   ├── Image (event.image_url ou placeholder)
│   │           │   ├── eventOverlay (View) ✨ NOUVEAU
│   │           │   └── eventTitleOverlay (Text) ✨ NOUVEAU - CENTRÉ
│   │           ├── eventLocation (Text)
│   │           │   └── 📍 {location}
│   │           └── eventDate (Text)
│   │               └── 📅 {date} 👤 {participants}
│   │
│   ├── Section: Annonces de vente et d'échange
│   │   ├── SectionHeader
│   │   │   ├── "Annonces de vente et d'échange"
│   │   │   └── "Voir tout" (TouchableOpacity)
│   │   │
│   │   └── ScrollView (horizontal)
│   │       └── MarketplaceCard[] (TouchableOpacity)
│   │           ├── marketplaceImage (View)
│   │           │   ├── Image (item.images[0] ou emoji)
│   │           │   ├── priceTag (View, si sale)
│   │           │   │   └── priceText (Text)
│   │           │   ├── marketplaceOverlay (View) ✨ NOUVEAU
│   │           │   └── marketplaceTitleOverlay (Text) ✨ NOUVEAU - CENTRÉ
│   │           │       └── 💰/🔄 + {title}
│   │           └── marketplaceGame (Text)
│   │               └── 📍 {location} 📅 {date}
│   │
│   ├── Section: Suggestions de joueurs
│   │   ├── SectionHeader
│   │   │   ├── "Suggestions de joueurs"
│   │   │   └── "Voir tout" (TouchableOpacity)
│   │   │
│   │   └── ScrollView (horizontal)
│   │       └── UserCard[] (TouchableOpacity)
│   │           ├── userAvatar (View)
│   │           │   └── Image ou Text (initiale)
│   │           ├── userName (Text)
│   │           └── userUsername (Text)
│   │
│   └── Section: Recommandations de jeux
│       ├── SectionHeader
│       │   ├── "🎮 Recommandations de jeux"
│       │   └── "Actualiser" (TouchableOpacity)
│       │
│       └── ScrollView (horizontal)
│           └── GameCard[] (TouchableOpacity)
│               └── ImageBackground
│                   ├── gameOverlay (View)
│                   ├── complexityBadge (View, si complexity existe)
│                   └── gameContent (View)
│                       ├── gameName (Text)
│                       ├── gameCategory (Text)
│                       └── gameInfo (View)
│                           └── gameInfoText (Text)
```

---

## 💡 Détails de Conception

### Centrage Vertical

Le centrage vertical est réalisé avec la combinaison :
```typescript
top: '50%',
transform: [{ translateY: -12 }]
```

- `top: '50%'` : Positionne le point de départ du texte à 50% de la hauteur du conteneur
- `transform: [{ translateY: -12 }]` : Décale le texte vers le haut de la moitié de sa hauteur approximative (12px) pour un centrage parfait

### Overlay Semi-Transparent

L'overlay utilise :
```typescript
...StyleSheet.absoluteFillObject,
backgroundColor: 'rgba(0, 0, 0, 0.4)',
```

- `absoluteFillObject` : Remplit tout l'espace du conteneur parent
- `rgba(0, 0, 0, 0.4)` : Noir avec 40% d'opacité pour assombrir l'image sans la masquer complètement

### Gestion des z-index

```
Image (fond)          → z-index: auto (0)
Overlay               → z-index: auto (1)
Titre                 → z-index: 2
Étiquette de prix     → z-index: 3
```

---

## 🎯 Points d'Attention

### 1. Lisibilité
- L'overlay sombre (40% d'opacité) assure une bonne lisibilité sur toutes les images
- Le texte blanc en gras (bold) contraste bien avec le fond assombri
- Limitation à 2 lignes (`numberOfLines={2}`) pour éviter le débordement

### 2. Responsive
- Les titres s'adaptent automatiquement à la largeur de la vignette
- Le padding horizontal (12px) évite que le texte touche les bords
- La troncature automatique (`numberOfLines`) gère les titres longs

### 3. Accessibilité
- Contraste suffisant entre le texte blanc et le fond assombri
- Taille de police lisible (15px pour événements, 14px pour annonces)
- Les emojis ajoutent du contexte visuel

---

## 🔄 Flux de Données

Les modifications n'impactent pas le flux de données, seule la présentation change :

```
1. Chargement des données (inchangé)
   ├── loadEvents()
   ├── loadMarketplace()
   ├── loadUsers()
   └── loadGames()

2. Affichage (modifié)
   └── Rendu des vignettes avec titres en overlay
```

---

## 📱 Impact sur l'Infrastructure

**Aucun impact infrastructure** :
- Pas de modification des requêtes API/Supabase
- Pas de changement dans la structure des données
- Modification uniquement au niveau de la présentation (UI)
- Pas de nouvelles dépendances

---

## ♿ Accessibilité

### Améliorations
- ✅ Meilleur contraste texte/fond grâce à l'overlay
- ✅ Taille de police suffisante (14-15px)
- ✅ Utilisation d'emojis pour le contexte visuel

### Points à surveiller
- ⚠️ Vérifier le contraste sur des images très claires ou très sombres
- ⚠️ Tester avec des lecteurs d'écran pour s'assurer que le texte en overlay est bien lu

---

## 🧪 États Gérés

Les différents états de l'interface restent inchangés :

### États vides
```jsx
<View style={styles.emptyState}>
  <Text style={styles.emptyEmoji}>🎲</Text>
  <Text style={styles.emptyText}>Aucun événement à venir</Text>
</View>
```

### États de chargement
```jsx
<ActivityIndicator color="#3b82f6" style={{ marginVertical: 20 }} />
```

### États avec données
- Affichage des vignettes avec titres en overlay

### État hors ligne
- Géré par le PageLayout (inchangé)

---

## 🎨 Considérations de Design

### Cohérence Visuelle
Les modifications maintiennent la cohérence avec :
- Les cartes de jeux existantes (qui utilisent déjà des overlays)
- La palette de couleurs du dashboard
- Les espacements et paddings standards

### Mobile-First
- Vignettes de taille fixe (200px de largeur)
- Hauteur d'image constante (100px)
- Défilement horizontal pour gérer de nombreux items

---

## 🚀 Améliorations Futures Possibles

1. **Animation au survol**
   - Transition douce de l'overlay au hover
   - Zoom léger de l'image

2. **Personnalisation de l'overlay**
   - Opacité adaptative selon la luminosité de l'image
   - Dégradé au lieu d'un overlay uni

3. **Informations supplémentaires**
   - Badges de statut sur l'image
   - Compteur de favoris

4. **Optimisation des performances**
   - Lazy loading des images
   - Optimisation de la taille des images chargées

---

## 📝 Notes de Développement

### Pourquoi `transform: [{ translateY: -12 }]` ?

La valeur `-12` est approximativement la moitié de la hauteur d'une ligne de texte en taille 15px. Pour un centrage plus précis avec des textes multilignes, on pourrait utiliser `flexbox` sur le conteneur, mais cette approche avec `transform` :
- Est plus performante (pas de recalcul de layout)
- Fonctionne bien pour 1-2 lignes de texte
- Est compatible avec tous les appareils

### Alternatives considérées

1. **Flexbox avec justifyContent: 'center'**
   - Plus précis mais moins performant
   - Peut causer des problèmes avec `position: absolute`

2. **Calcul dynamique avec onLayout**
   - Trop complexe pour le besoin
   - Impact sur les performances

3. **Position bottom au lieu de top**
   - Moins lisible avec les informations en bas
   - Conflit visuel avec le price tag

---

## ✅ Checklist de Validation

- [x] Titres centrés verticalement sur les vignettes
- [x] Overlay semi-transparent pour la lisibilité
- [x] Gestion des titres longs (troncature)
- [x] Compatibilité avec images et placeholders
- [x] z-index correct pour tous les éléments
- [x] Pas d'erreurs de linting
- [x] Aucun impact sur la logique métier
- [x] Documentation complète

---

## 📚 Fichiers Modifiés

```
apps/mobile/app/(tabs)/dashboard.tsx
├── Composant des événements (lignes 298-327)
├── Composant des annonces (lignes 352-390)
└── Styles (lignes 587-755)
```

---

**Statut**: ✅ Implémenté et testé  
**Auteur**: Assistant IA  
**Date de révision**: 13 novembre 2025




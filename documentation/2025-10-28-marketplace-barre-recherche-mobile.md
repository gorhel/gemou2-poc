# Barre de recherche Marketplace Mobile

**Date de création** : 28 octobre 2025  
**Composant** : `apps/mobile/components/marketplace/MarketplaceList.tsx`  
**Route** : `/marketplace` (mobile)

## 📋 Vue d'ensemble

Ajout d'une barre de recherche interactive permettant de filtrer les annonces de la marketplace en temps réel lors de la saisie de caractères.

## 🎯 Fonctionnalités

### 1. Recherche textuelle en temps réel

- **Déclenchement** : À chaque caractère saisi dans la barre de recherche
- **Champs recherchés** :
  - Titre de l'annonce (`title`)
  - Description (`description`)
  - Nom du jeu (`game_name`)
  - Localisation complète (`location`)
  - Ville (`location_city`)
  - Quartier (`location_quarter`)

### 2. Filtrage combiné

La recherche fonctionne en combinaison avec les filtres de type existants :
- Type de transaction (Vente, Échange, Don)
- ET recherche textuelle

**Exemple** :
- Filtre actif : "Vente"
- Recherche : "monopoly"
- Résultat : Uniquement les annonces de **vente** contenant "monopoly"

### 3. Interface utilisateur

#### Barre de recherche
```
┌─────────────────────────────────────────┐
│ 🔍  Rechercher une annonce, un jeu...  ✕│
└─────────────────────────────────────────┘
```

**Éléments** :
- **Icône de recherche** : 🔍 (gauche)
- **Champ de saisie** : Placeholder informatif
- **Bouton effacer** : ✕ (droite, visible uniquement si du texte est saisi)

#### États vides

**Aucun résultat de recherche** :
```
🛒
Aucune annonce trouvée
Aucun résultat pour "monopoly"
```

**Aucune annonce (sans recherche)** :
```
🛒
Aucune annonce trouvée
Il n'y a pas encore d'annonces disponibles.
```

## 🏗️ Architecture technique

### State Management

```typescript
const [searchQuery, setSearchQuery] = useState('')
```

### Logique de filtrage

```typescript
const filteredItems = items.filter(item => {
  // Filtre par type
  const typeMatch = filter === 'all' || item.type === filter

  // Filtre par recherche textuelle
  if (!searchQuery.trim()) {
    return typeMatch
  }

  const query = searchQuery.toLowerCase().trim()
  const searchableText = [
    item.title,
    item.description,
    item.game_name,
    item.location,
    item.location_city,
    item.location_quarter
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const textMatch = searchableText.includes(query)

  return typeMatch && textMatch
})
```

### Caractéristiques de la recherche

- **Insensible à la casse** : `toLowerCase()`
- **Trim automatique** : Suppression des espaces avant/après
- **Filtre des valeurs nulles** : `.filter(Boolean)`
- **Recherche par inclusion** : `.includes(query)`

## 🎨 Styles et UX

### Corrections d'espacement

Les styles ont été optimisés pour résoudre le problème d'espacement vertical excessif :

#### Barre de recherche
```typescript
searchContainer: {
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 8,
  backgroundColor: 'white',
}

searchInputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f3f4f6',
  borderRadius: 12,
  paddingHorizontal: 12,
  height: 44,  // Hauteur fixe
  borderWidth: 1,
  borderColor: '#e5e7eb',
}
```

#### Filtres optimisés
```typescript
filtersScrollView: {
  flexGrow: 0,      // Ne grandit pas
  flexShrink: 0,    // Ne rétrécit pas
  maxHeight: 50,    // Hauteur maximale fixe
  paddingVertical: 8,
  backgroundColor: 'white',
}
```

### Améliorations visuelles

| Élément | Avant | Après |
|---------|-------|-------|
| **ScrollView filtres** | Pas de contrainte de hauteur | `maxHeight: 50px` |
| **Espacement** | `gap: 8` + `marginRight: 8` | `marginRight: 8` uniquement |
| **Container filtres** | `flex: 1` (expansif) | `flexGrow: 0, flexShrink: 0` (fixe) |
| **Liste** | Pas de padding top | `paddingTop: 12` |

## 📱 Structure de la page

```
SafeAreaView (marketplace.tsx)
  ├─ TopHeader
  └─ MarketplaceList
      ├─ Barre de recherche (nouveau)
      │   ├─ Icône 🔍
      │   ├─ TextInput
      │   └─ Bouton ✕ (conditionnel)
      ├─ Filtres horizontaux
      │   ├─ Tous
      │   ├─ 💰 Vente
      │   ├─ 🔄 Échange
      │   └─ 🎁 Don
      └─ ScrollView (liste des annonces)
          └─ MarketplaceCard[]
```

## 🔍 Comportements

### 1. Saisie de texte
- **Action** : L'utilisateur tape dans la barre de recherche
- **Résultat** : Filtrage immédiat de la liste
- **Indicateur** : Bouton ✕ apparaît pour effacer

### 2. Effacement
- **Action** : Clic sur le bouton ✕
- **Résultat** : 
  - Champ de recherche vidé
  - Affichage de toutes les annonces (selon le filtre de type)
  - Bouton ✕ disparaît

### 3. Combinaison avec filtres
- **Action** : Recherche active + changement de filtre de type
- **Résultat** : Les deux critères sont appliqués (AND logique)

### 4. État vide
- **Cas 1** : Recherche sans résultat
  - Message : `Aucun résultat pour "texte recherché"`
- **Cas 2** : Pas d'annonces disponibles
  - Message générique selon le filtre actif

## 🧪 Scénarios de test

### Test 1 : Recherche basique
1. Ouvrir `/marketplace`
2. Taper "monopoly" dans la barre de recherche
3. ✅ Vérifier que seules les annonces contenant "monopoly" s'affichent

### Test 2 : Recherche insensible à la casse
1. Taper "MONOPOLY" (majuscules)
2. ✅ Vérifier que les résultats incluent "monopoly" (minuscules)

### Test 3 : Filtrage combiné
1. Sélectionner le filtre "Vente"
2. Taper "chess" dans la recherche
3. ✅ Vérifier que seules les ventes de jeux d'échecs s'affichent

### Test 4 : Effacement
1. Rechercher "scrabble"
2. Cliquer sur le bouton ✕
3. ✅ Vérifier que toutes les annonces réapparaissent

### Test 5 : Recherche sans résultat
1. Taper "xyz123nonexistent"
2. ✅ Vérifier l'affichage du message "Aucun résultat pour "xyz123nonexistent""

### Test 6 : Espaces avant/après
1. Taper "  monopoly  " (avec espaces)
2. ✅ Vérifier que la recherche fonctionne (trim automatique)

## 📊 Métriques UX

| Métrique | Valeur |
|----------|--------|
| Hauteur barre de recherche | 44px |
| Hauteur zone filtres | 50px max |
| Padding horizontal | 16px |
| Temps de réponse | Instantané (pas de debounce) |

## 🚀 Prochaines améliorations possibles

1. **Debounce** : Ajouter un délai (300ms) pour optimiser les performances avec de grandes listes
2. **Mise en évidence** : Surligner les termes recherchés dans les résultats
3. **Suggestions** : Proposer des recherches populaires ou récentes
4. **Historique** : Sauvegarder les dernières recherches
5. **Filtres avancés** : Prix, localisation, condition
6. **Tri** : Par pertinence de recherche

## 🐛 Problèmes résolus

### Problème d'espacement vertical excessif

**Cause identifiée** :
1. ❌ ScrollView horizontal sans contrainte de hauteur
2. ❌ Double espacement (`gap` + `marginRight`)
3. ❌ Container avec `flex: 1` forçant l'expansion

**Solution appliquée** :
1. ✅ `maxHeight: 50px` sur filtersScrollView
2. ✅ `flexGrow: 0` et `flexShrink: 0`
3. ✅ `paddingVertical: 8px` au lieu de `marginBottom: 16px`
4. ✅ Suppression du `gap: 8` dans filtersContent

## 💡 Bonnes pratiques appliquées

- ✅ **Recherche client-side** : Pas d'appel serveur à chaque frappe
- ✅ **État local** : State simple avec `useState`
- ✅ **Filtrage composé** : AND logique entre les critères
- ✅ **UX claire** : Feedback visuel immédiat
- ✅ **Accessibilité** : Placeholder descriptif, autocomplete désactivé
- ✅ **Performance** : `.filter()` natif, pas de re-render inutile

## 📝 Code key snippets

### TextInput de recherche

```tsx
<TextInput
  style={styles.searchInput}
  placeholder="Rechercher une annonce, un jeu..."
  placeholderTextColor="#9ca3af"
  value={searchQuery}
  onChangeText={setSearchQuery}
  autoCapitalize="none"
  autoCorrect={false}
/>
```

### Bouton effacer conditionnel

```tsx
{searchQuery.length > 0 && (
  <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
    <Text style={styles.clearButtonText}>✕</Text>
  </TouchableOpacity>
)}
```

## 🔗 Fichiers modifiés

- `apps/mobile/components/marketplace/MarketplaceList.tsx` (modifications majeures)

## 🌐 Synchronisation web

**Note** : La version web de la marketplace possède déjà une fonctionnalité de recherche similaire. Cette implémentation mobile assure la **parité fonctionnelle** entre les deux plateformes.

---

**Auteur** : Assistant IA  
**Revue** : À compléter  
**Status** : ✅ Implémenté


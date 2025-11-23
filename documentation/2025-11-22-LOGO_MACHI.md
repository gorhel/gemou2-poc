# Logo Machi - Guide de marque

## Concept du logo

Le logo Machi représente un **dé de jeu stylisé** avec la lettre "M" intégrée, évoquant :
- **Le jeu** : Élément central du dé/pion
- **La curiosité** : Forme dynamique et perspective isométrique
- **La convivialité** : Arrondis et approcheable
- **La sobriété** : Lignes épurées et design minimaliste

## Élément figuratif

Le logo principal est composé d'un dé de jeu en perspective isométrique avec :
- La lettre "M" intégrée dans la face principale
- Des points de dé stylisés (5 points visibles)
- Un dégradé de couleurs pour la profondeur
- Des faces en perspective pour un effet 3D moderne

## Palette de couleurs

### Couleurs principales

| Couleur | Code Hex | Usage | Signification |
|---------|----------|-------|---------------|
| **Primaire** | `#6366F1` | Dé, éléments principaux | Indigo moderne - curiosité, jeu |
| **Secondaire** | `#8B5CF6` | Dégradé, accents | Violet - convivialité |
| **Accent** | `#F59E0B` | Points de dé | Ambre - énergie, découverte |
| **Neutre** | `#F0F2F5` | Fond, lettre M | Gris clair - sobriété |
| **Texte** | `#1F2937` | Typographie | Gris foncé - lisibilité |

### Utilisation des couleurs

- **Fond du logo** : Transparent ou blanc selon le contexte
- **Dégradé du dé** : Du primaire (#6366F1) au secondaire (#8B5CF6)
- **Points de dé** : Accent (#F59E0B) pour attirer l'attention
- **Lettre M** : Neutre (#F0F2F5) pour contraste
- **Typographie** : Texte (#1F2937) pour lisibilité maximale

## Variantes du logo

### 1. Logo complet (`logo-full.svg`)
- Dé + texte "Machi" + slogan "Trouve ton game"
- Dimensions : 400x200px
- Usage : Headers, pages d'accueil, documentation

### 2. Logo standard (`logo.svg`)
- Même que logo-full.svg
- Usage : Référence principale

### 3. Logo icône (`logo-icon.svg`)
- Dé seul sans texte
- Dimensions : 200x200px
- Usage : Favicons, icônes d'application, petits espaces

## Typographie

- **Police** : Plus Jakarta Sans (déjà chargée dans l'app)
- **Nom "Machi"** : Bold (700), 48px
- **Slogan "Trouve ton game"** : Regular (400), 20px
- **Couleur texte** : #1F2937 (gris foncé)
- **Couleur slogan** : #6366F1 (primaire)

## Tailles et formats

### Fichiers SVG (vectoriels)
- `logo.svg` : 400x200px - Logo complet
- `logo-full.svg` : 400x200px - Logo complet (duplicata)
- `logo-icon.svg` : 200x200px - Icône seule

### Fichiers PNG (raster)
- `icon.png` : 1024x1024px - Icône principale iOS/Android
- `adaptive-icon.png` : 1024x1024px - Icône adaptative Android
- `splash.png` : 1284x2778px - Splash screen avec fond #6366F1
- `favicon.png` : 48x48px - Favicon web

## Guidelines d'utilisation

### Espacements minimums

- **Logo complet** : Zone de protection = 20% de la hauteur du logo de chaque côté
- **Logo icône** : Zone de protection = 10% de la taille de l'icône de chaque côté

### Tailles recommandées

- **Header desktop** : Logo complet, hauteur 60-80px
- **Header mobile** : Logo icône, hauteur 40-50px
- **Favicon** : 48x48px minimum
- **Splash screen** : Plein écran avec logo centré

### Contextes d'utilisation

#### ✅ Utilisations autorisées
- Fond blanc ou clair
- Fond transparent
- Fond avec couleur primaire (#6366F1) en version inversée
- Sur images avec zone de protection suffisante

#### ❌ Utilisations à éviter
- Sur fonds très sombres sans version inversée
- Déformation ou rotation du logo
- Modification des couleurs
- Ajout d'effets (ombres, contours) non prévus
- Utilisation à une taille inférieure à 24px pour l'icône

## Intégration technique

### Mobile (Expo)
- Configuration dans `app.config.js`
- Icon : `./assets/icon.png`
- Splash : `./assets/splash.png` avec fond #6366F1
- Adaptive icon Android : `./assets/adaptive-icon.png`

### Web (Next.js)
- Favicon : `/public/favicon.ico`
- Logo : `/public/logo.svg`
- Métadonnées dans `app/layout.tsx`

## Versions alternatives

### Version monochrome
Pour utilisation sur fonds colorés, une version monochrome peut être créée :
- Dé en blanc (#FFFFFF) ou noir (#1F2937)
- Points en blanc ou noir selon le fond
- Lettre M en contraste approprié

### Version inversée
Pour utilisation sur fonds sombres :
- Couleurs inversées (dé clair, texte clair)
- Maintien du contraste pour lisibilité

## Fichiers de référence

- `apps/mobile/assets/logo.svg` - Logo complet
- `apps/mobile/assets/logo-icon.svg` - Icône seule
- `apps/mobile/assets/logo-full.svg` - Logo complet (duplicata)
- `apps/web/public/logo.svg` - Logo pour web

## Génération des assets PNG

Voir `apps/mobile/assets/generate-png-assets.md` pour les instructions de génération des fichiers PNG depuis les SVG.

## Évolution future

Le logo peut évoluer avec :
- Variantes saisonnières (couleurs d'accent)
- Animations pour interactions
- Versions simplifiées pour très petits formats
- Adaptations pour thèmes sombres


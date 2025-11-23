# Maquette Dashboard Mobile - Machi

## Palette de couleurs appliquée

- **Primaire** : #6366F1 (Indigo) - Éléments principaux, liens, accents
- **Secondaire** : #8B5CF6 (Violet) - Dégradés, éléments secondaires
- **Accent** : #F59E0B (Ambre) - Badges, indicateurs, call-to-action
- **Neutre** : #F0F2F5 (Gris clair) - Fonds de cartes, zones de contenu
- **Texte** : #1F2937 (Gris foncé) - Textes principaux
- **Texte secondaire** : #6B7280 (Gris moyen) - Textes secondaires
- **Fond principal** : #FFFFFF (Blanc) - Fond de l'application

## Structure de la page

```
┌─────────────────────────────────────┐
│  [Header - Logo Machi + Navigation] │
│  Fond: Blanc                         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🔍 [Barre de recherche]             │
│  Fond: #F0F2F5                      │
│  Bordure: #E5E7EB                    │
│  Texte: #6B7280                      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  📅 Événements à venir    [Voir tout]│
│  Titre: #1F2937, Bold 18px          │
│  Lien: #6366F1, Medium 14px         │
├─────────────────────────────────────┤
│  [Scroll horizontal]                 │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Event1│ │Event2│ │Event3│         │
│  └──────┘ └──────┘ └──────┘         │
│  Carte:                              │
│  - Image avec overlay #6366F1 (30%) │
│  - Titre blanc, Bold 15px            │
│  - Info bloc: Fond #F0F2F5          │
│  - Texte: #4B5563, 12px              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🛒 Annonces          [Voir tout]    │
│  Titre: #1F2937, Bold 18px          │
│  Lien: #6366F1, Medium 14px         │
├─────────────────────────────────────┤
│  [Scroll horizontal]                 │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Item1 │ │Item2 │ │Item3 │         │
│  └──────┘ └──────┘ └──────┘         │
│  Carte:                              │
│  - Image avec overlay #8B5CF6 (30%) │
│  - Badge prix: #F59E0B               │
│  - Titre blanc, Bold 14px            │
│  - Info bloc: Fond #F0F2F5           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  👥 Suggestions de joueurs [Voir tout]│
│  Titre: #1F2937, Bold 18px          │
│  Lien: #6366F1, Medium 14px         │
├─────────────────────────────────────┤
│  [Scroll horizontal]                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │ 👤 │ │ 👤 │ │ 👤 │ │ 👤 │        │
│  │Nom │ │Nom │ │Nom │ │Nom │        │
│  └────┘ └────┘ └────┘ └────┘        │
│  Avatar:                              │
│  - Fond: Dégradé #6366F1 → #8B5CF6  │
│  - Texte: Blanc, Bold 24px           │
│  - Nom: #1F2937, SemiBold 13px       │
│  - Username: #6B7280, 11px           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🎲 Recommandations de jeux [Actual.]│
│  Titre: #1F2937, Bold 18px          │
│  Lien: #6366F1, Medium 14px         │
├─────────────────────────────────────┤
│  [Scroll horizontal]                 │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Game1 │ │Game2 │ │Game3 │         │
│  └──────┘ └──────┘ └──────┘         │
│  Carte:                              │
│  - Image avec overlay noir (30%)     │
│  - Nom: Blanc, Bold 14px             │
│  - Catégorie: #D1D5DB, 12px          │
│  - Info: #9CA3AF, 11px               │
│  - Badge complexité: #6366F1         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  [Tab Bar - Navigation bas]          │
│  Fond: Blanc                         │
│  Bordure: #E5E7EB                    │
│  Actif: #6366F1                      │
│  Inactif: #6B7280                    │
└─────────────────────────────────────┘
```

## Détails visuels par section

### 1. Barre de recherche
- **Fond** : #F0F2F5 (Gris clair)
- **Bordure** : #E5E7EB (Gris très clair)
- **Icône** : #6366F1 (Indigo)
- **Texte placeholder** : #6B7280 (Gris moyen)
- **Ombre** : Légère (opacité 5%)
- **Border radius** : 12px
- **Padding** : 16px

### 2. Section Événements
- **Titre section** : #1F2937, Bold 18px
- **Lien "Voir tout"** : #6366F1, Medium 14px
- **Carte événement** :
  - Fond : Blanc
  - Image avec overlay : rgba(99, 102, 241, 0.3) - 30% d'opacité
  - Titre sur image : Blanc, Bold 15px
  - Bloc info : Fond #F0F2F5, bordure #E5E7EB
  - Texte info : #4B5563, 12px
  - Ombre : Élevation 3
  - Border radius : 12px

### 3. Section Marketplace
- **Titre section** : #1F2937, Bold 18px
- **Lien "Voir tout"** : #6366F1, Medium 14px
- **Carte annonce** :
  - Fond : Blanc
  - Image avec overlay : rgba(139, 92, 246, 0.3) - 30% d'opacité (violet)
  - Badge prix : #F59E0B (Ambre), texte blanc
  - Titre sur image : Blanc, Bold 14px
  - Bloc info : Fond #F0F2F5, bordure #E5E7EB
  - Texte info : #4B5563, 12px
  - Ombre : Élevation 3
  - Border radius : 12px

### 4. Section Suggestions de joueurs
- **Titre section** : #1F2937, Bold 18px
- **Lien "Voir tout"** : #6366F1, Medium 14px
- **Carte utilisateur** :
  - Fond : Blanc
  - Avatar : Dégradé #6366F1 → #8B5CF6 (cercle)
  - Texte avatar : Blanc, Bold 24px
  - Nom : #1F2937, SemiBold 13px
  - Username : #6B7280, 11px
  - Ombre : Élevation 3
  - Border radius : 12px

### 5. Section Recommandations de jeux
- **Titre section** : #1F2937, Bold 18px
- **Lien "Actualiser"** : #6366F1, Medium 14px
- **Carte jeu** :
  - Image background avec overlay : rgba(0, 0, 0, 0.3)
  - Nom : Blanc, Bold 14px
  - Catégorie : #D1D5DB, 12px
  - Info joueurs : #9CA3AF, 11px
  - Badge complexité : Fond #6366F1, texte blanc, 11px
  - Ombre : Élevation 3
  - Border radius : 12px

### 6. États vides
- **Emoji** : 48px
- **Texte** : #6B7280, 14px
- **Espacement** : Padding vertical 24px

### 7. Tab Bar (Navigation bas)
- **Fond** : Blanc
- **Bordure supérieure** : #E5E7EB, 2px
- **Onglet actif** : #6366F1 (Indigo)
- **Onglet inactif** : #6B7280 (Gris moyen)
- **Hauteur** : 85px (iOS/Android)

## Spécifications techniques

### Espacements
- **Padding sections** : 16px horizontal
- **Margin entre sections** : 8px vertical
- **Espacement cartes** : 12px horizontal
- **Padding cartes** : 12px

### Typographie
- **Police** : Plus Jakarta Sans (déjà chargée)
- **Titres sections** : Bold 18px
- **Titres cartes** : Bold 14-15px
- **Textes info** : Regular 12px
- **Textes secondaires** : Regular 11px

### Ombres et élévations
- **Cartes** : Élévation 3, ombre légère
- **Barre de recherche** : Élévation 2, ombre très légère
- **Tab bar** : Bordure supérieure, pas d'ombre

### Border radius
- **Cartes** : 12px
- **Barre de recherche** : 12px
- **Avatars** : 50% (cercle)
- **Badges** : 6px

## Exemple de rendu visuel

```
╔═══════════════════════════════════════╗
║  [Logo Machi]          [Notifications]║
╠═══════════════════════════════════════╣
║  🔍 Recherche un événement, un joueur ║
║  [Fond #F0F2F5, Bordure #E5E7EB]      ║
╠═══════════════════════════════════════╣
║  📅 Événements à venir    Voir tout  ║
║  ┌──────────┐ ┌──────────┐           ║
║  │ [Image]  │ │ [Image]  │           ║
║  │ Soirée   │ │ Tournoi  │           ║
║  │ Jeux     │ │ Catan    │           ║
║  │ 📍 Paris │ │ 📍 Lyon  │           ║
║  └──────────┘ └──────────┘           ║
╠═══════════════════════════════════════╣
║  🛒 Annonces              Voir tout   ║
║  ┌──────────┐ ┌──────────┐           ║
║  │ [Image]  │ │ [Image]  │           ║
║  │ 💰 25€   │ │ 🔄 Échange│           ║
║  │ Catan    │ │ Ticket   │           ║
║  │ 📍 Paris │ │ 📍 Lyon  │           ║
║  └──────────┘ └──────────┘           ║
╠═══════════════════════════════════════╣
║  👥 Suggestions         Voir tout    ║
║  ┌────┐ ┌────┐ ┌────┐ ┌────┐         ║
║  │ 👤 │ │ 👤 │ │ 👤 │ │ 👤 │         ║
║  │Jean│ │Marie│ │Paul│ │Soph│        ║
║  │@j1 │ │@m2 │ │@p3 │ │@s4 │         ║
║  └────┘ └────┘ └────┘ └────┘         ║
╠═══════════════════════════════════════╣
║  🎲 Recommandations      Actualiser  ║
║  ┌──────────┐ ┌──────────┐           ║
║  │ [Image]  │ │ [Image]  │           ║
║  │ Catan    │ │ Ticket   │           ║
║  │ Stratégie│ │ Familial │           ║
║  │ 3-4 jou. │ │ 2-5 jou. │           ║
║  │ [3/5]    │ │ [2/5]    │           ║
║  └──────────┘ └──────────┘           ║
╠═══════════════════════════════════════╣
║  🏠  📅  🛒  💬  👤                   ║
║  [Tab Bar - Fond blanc]               ║
╚═══════════════════════════════════════╝
```

## Codes couleurs détaillés

### Couleurs principales
```css
--color-primary: #6366F1;      /* Indigo - Éléments principaux */
--color-secondary: #8B5CF6;     /* Violet - Dégradés */
--color-accent: #F59E0B;        /* Ambre - Badges, CTA */
--color-neutral: #F0F2F5;       /* Gris clair - Fonds */
--color-text: #1F2937;          /* Gris foncé - Textes */
--color-text-secondary: #6B7280; /* Gris moyen - Textes secondaires */
--color-border: #E5E7EB;        /* Gris très clair - Bordures */
--color-background: #FFFFFF;    /* Blanc - Fond principal */
```

### Overlays
```css
--overlay-primary: rgba(99, 102, 241, 0.3);   /* 30% Indigo */
--overlay-secondary: rgba(139, 92, 246, 0.3); /* 30% Violet */
--overlay-dark: rgba(0, 0, 0, 0.3);           /* 30% Noir */
```

## Principes de design

1. **Hiérarchie visuelle** : Utilisation de la couleur primaire (#6366F1) pour les éléments interactifs et importants
2. **Contraste** : Fond clair (#F0F2F5) pour les zones de contenu, blanc pour les cartes
3. **Cohérence** : Même style de cartes avec variations de couleurs selon le type de contenu
4. **Accessibilité** : Contraste suffisant entre texte et fond (ratio WCAG AA)
5. **Modernité** : Dégradés subtils, ombres légères, border radius généreux

## Responsive et adaptabilité

- **Largeur cartes** : 200px (événements, marketplace)
- **Largeur cartes utilisateurs** : 150px
- **Largeur cartes jeux** : 176px
- **Espacement horizontal** : 12px entre cartes
- **Padding sections** : 16px de chaque côté

Cette maquette respecte la palette Machi tout en conservant une lisibilité optimale et une expérience utilisateur moderne et conviviale.


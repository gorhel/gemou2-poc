# 🌳 Arbre des Composants - Gémou2

Ce document présente l'arbre des composants pour chaque écran de l'application Gémou2.

## 📋 Table des Matières

- [Format avec liens](#format-avec-liens)
- [Format sans liens](#format-sans-liens)
- [Tous les écrans](#tous-les-écrans)

---

## 🔗 Format avec liens

### Exemple : `/dashboard`

```
DashboardPage
├── ResponsiveLayout
│   ├── Header (logo, navigation)
│   ├── Sidebar (navigation desktop)
│   └── MobileNavigation
├── Header Section
│   ├── Title ("Tableau de bord")
│   ├── User info (email)
│   └── Button ("Se déconnecter")
├── Welcome Section
│   ├── Gradient background
│   ├── Title ("🎲 Bienvenue sur Gémou2 !")
│   ├── Description
│   └── User card (desktop only)
├── Events Section
│   ├── Section header
│   │   ├── Title ("📅 Événements à venir")
│   │   └── Button ("Voir tous les événements") → /events
│   └── EventsSlider
│       ├── EventCard (x3-10)
│       │   ├── Event image
│       │   ├── Event title
│       │   ├── Event date
│       │   ├── Event location
│       │   ├── Participants count
│       │   └── Action buttons
│       ├── Navigation arrows
│       └── Pagination dots
├── Users Section
│   ├── Section header
│   │   ├── Title ("👥 Suggestions de joueurs")
│   │   └── Button ("Voir la communauté") → /community
│   └── UsersRecommendations
└── Games Section
    ├── Section header
    │   ├── Title ("🎮 Recommandations de jeux")
    │   └── Button ("Explorer plus")
    └── GamesRecommendations
```

---

## 📝 Format sans liens

### Exemple : `/dashboard`

```
DashboardPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title
│   ├── User info
│   └── Button
├── Welcome Section
│   ├── Gradient background
│   ├── Title
│   ├── Description
│   └── User card
├── Events Section
│   ├── Section header
│   │   ├── Title
│   │   └── Button
│   └── EventsSlider
│       ├── EventCard (x3-10)
│       ├── Navigation arrows
│       └── Pagination dots
├── Users Section
│   ├── Section header
│   │   ├── Title
│   │   └── Button
│   └── UsersRecommendations
└── Games Section
    ├── Section header
    │   ├── Title
    │   └── Button
    └── GamesRecommendations
```

---

# 🖥️ Tous les Écrans

## 1. `/` - Page d'Accueil

```
LandingPage
├── AuthProvider
├── Header
│   ├── Logo ("🎲 Gémou2")
│   ├── Navigation menu
│   └── UserMenu
├── Sidebar
│   ├── Navigation items
│   └── User menu items
├── MobileNavigation
├── Hero Section
│   ├── Title ("Connectez-vous aux jeux de société")
│   ├── Description
│   ├── CTA Button ("Commencer")
│   └── Background image
├── Features Section
│   ├── Feature cards (x4)
│   │   ├── Icon
│   │   ├── Title
│   │   └── Description
├── Events Preview
│   ├── Section title
│   └── Events grid
├── Community Preview
│   ├── Section title
│   └── Users grid
└── Footer
    ├── Links
    ├── Social media
    └── Copyright
```

## 2. `/login` - Connexion

```
LoginPage
├── Background gradient
├── Card
│   ├── CardHeader
│   │   ├── CardTitle ("Connexion")
│   │   └── CardDescription
│   ├── CardContent
│   │   ├── Input (email)
│   │   ├── Input (password)
│   │   ├── Button ("Se connecter")
│   │   └── Error messages
│   └── CardFooter
│       ├── Link ("Mot de passe oublié?")
│       └── Link ("Créer un compte")
└── LoadingSpinner (conditional)
```

## 3. `/register` - Inscription

```
RegisterPage
├── Background gradient
├── Card
│   ├── CardHeader
│   │   ├── CardTitle ("Créer un compte")
│   │   └── CardDescription
│   ├── CardContent
│   │   ├── Input (prénom)
│   │   ├── Input (nom)
│   │   ├── Input (username) + validation
│   │   ├── Input (email)
│   │   ├── Input (password)
│   │   ├── Input (confirm password)
│   │   ├── Button ("Créer le compte")
│   │   └── Error messages
│   └── CardFooter
│       └── Link ("Déjà un compte?")
└── LoadingSpinner (conditional)
```

## 4. `/dashboard` - Tableau de Bord

```
DashboardPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title ("Tableau de bord")
│   ├── User info (email)
│   └── Button ("Se déconnecter")
├── Welcome Section
│   ├── Gradient background
│   ├── Title ("🎲 Bienvenue sur Gémou2 !")
│   ├── Description
│   └── User card (desktop only)
├── Events Section
│   ├── Section header
│   │   ├── Title ("📅 Événements à venir")
│   │   └── Button ("Voir tous les événements")
│   └── EventsSlider
│       ├── EventCard (x3-10)
│       ├── Navigation arrows
│       └── Pagination dots
├── Users Section
│   ├── Section header
│   │   ├── Title ("👥 Suggestions de joueurs")
│   │   └── Button ("Voir la communauté")
│   └── UsersRecommendations
└── Games Section
    ├── Section header
    │   ├── Title ("🎮 Recommandations de jeux")
    │   └── Button ("Explorer plus")
    └── GamesRecommendations
```

## 5. `/profile` - Profil Utilisateur

```
ProfilePage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title ("👤 Profil")
│   ├── Description
│   └── Button ("Se déconnecter")
├── Main Content
│   ├── Profile Card
│   │   ├── Avatar
│   │   ├── User info (email, ID, dates)
│   │   └── Profile details
│   └── Actions Card
│       ├── Button ("Modifier le profil")
│       ├── Button ("Changer le mot de passe")
│       ├── Button ("Préférences")
│       ├── Button ("Notifications")
│       └── Info box ("Fonctionnalités à venir")
└── Friends Section
    ├── Section header
    │   ├── Title ("👥 Mes amis")
    │   └── Button ("Gérer mes amis")
    └── FriendsSlider
        ├── FriendCard (x3-6)
        ├── Navigation arrows
        └── Pagination dots
```

## 6. `/profile/[username]` - Profil Autre Utilisateur

```
UserProfilePage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Loading State
│   └── LoadingSpinner
├── Error State
│   └── Error message
├── Profile Header
│   ├── Avatar (128px)
│   ├── Full name
│   ├── Username
│   ├── Organizer tag
│   └── Bio
├── Preferences Section
│   ├── Title ("Préférences")
│   └── SmallPill tags (user_tags)
├── Games Section
│   ├── Section header
│   └── UserGames grid
├── Events Timeline
│   ├── Section header
│   └── Event cards with timeline
├── Friends Section
│   ├── Section header
│   │   ├── Title ("👥 Amis de {nom}")
│   │   └── Button ("Voir tous les amis")
│   └── FriendsSlider
│       ├── FriendCard (x3-6)
│       ├── Navigation arrows
│       └── Pagination dots
└── Action Buttons
    ├── Button ("💬 Envoyer message")
    └── Button ("👥 Ajouter en ami")
```

## 7. `/events` - Liste des Événements

```
EventsPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title ("📅 Événements")
│   └── User info
├── Filters Section
│   ├── Search input
│   ├── Date filter
│   ├── Location filter
│   └── Status filter
├── Events Grid
│   └── EventCard (xN)
│       ├── Event image
│       ├── Event title
│       ├── Event date
│       ├── Event location
│       ├── Participants count
│       └── Action buttons
└── Pagination
    ├── Previous button
    ├── Page numbers
    └── Next button
```

## 8. `/events/[id]` - Détail Événement

```
EventDetailPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Loading State
│   └── LoadingSpinner
├── Event Header
│   ├── Event image
│   ├── Event title
│   ├── Event date/time
│   ├── Event location
│   ├── Event description
│   └── Action buttons (Join/Leave)
├── Event Info Grid
│   ├── Participants count
│   ├── Max participants
│   ├── Creator info
│   └── Event status
├── Games Section
│   ├── Section header
│   └── EventGames grid
├── Participants Section
│   ├── Section header
│   └── Participants slider
│       ├── Participant card (x4)
│       │   ├── Avatar (128px)
│       │   ├── Username
│       │   ├── City
│       │   └── Event tags
│       ├── Navigation arrows
│       └── Pagination dots
├── Creator Section
│   ├── Creator avatar (128px)
│   ├── Creator name
│   └── Organizer tag
└── Event Actions
    ├── Button ("Rejoindre l'événement")
    └── Button ("Quitter l'événement")
```

## 9. `/create-event` - Création Événement

```
CreateEventPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title ("Créer un événement")
│   └── Back button
├── CreateEventForm
│   ├── Basic Info Section
│   │   ├── Input (titre)
│   │   ├── Textarea (description)
│   │   ├── Input (date/heure)
│   │   ├── Input (lieu)
│   │   └── Input (max participants)
│   ├── Image Section
│   │   ├── Image upload
│   │   └── Image preview
│   ├── Games Section
│   │   ├── GameSelector
│   │   └── Selected games list
│   ├── Visibility Section
│   │   └── Radio buttons (public/private)
│   └── Actions
│       ├── Button ("Créer l'événement")
│       └── Button ("Annuler")
└── LoadingSpinner (conditional)
```

## 10. `/community` - Communauté

```
CommunityPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title ("👥 Communauté")
│   └── Search input
├── Filters Section
│   ├── Tags filter
│   ├── Location filter
│   └── Sort options
├── Users Grid
│   └── UserCard (xN)
│       ├── Avatar
│       ├── Username
│       ├── Full name
│       ├── Bio
│       ├── City
│       ├── Tags
│       └── Action buttons
└── Pagination
    ├── Previous button
    ├── Page numbers
    └── Next button
```

## 11. `/search` - Recherche

```
SearchPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Search Header
│   ├── Search input
│   ├── Search filters
│   └── Sort options
├── Search Results
│   ├── Events results
│   │   └── EventCard (xN)
│   ├── Users results
│   │   └── UserCard (xN)
│   └── Games results
│       └── GameCard (xN)
└── Pagination
    ├── Previous button
    ├── Page numbers
    └── Next button
```

## 12. `/onboarding` - Onboarding

```
OnboardingPage
├── Background gradient
├── Progress indicator
├── Step 1: Welcome
│   ├── Title ("Bienvenue sur Gémou2!")
│   ├── Description
│   └── Button ("Commencer")
├── Step 2: Profile Setup
│   ├── Avatar upload
│   ├── Bio input
│   ├── Location input
│   └── Button ("Continuer")
├── Step 3: Preferences
│   ├── Game types selection
│   ├── Tags selection
│   └── Button ("Terminer")
└── Navigation
    ├── Previous button
    ├── Progress dots
    └── Next button
```

## 13. `/forgot-password` - Mot de Passe Oublié

```
ForgotPasswordPage
├── Background gradient
├── Card
│   ├── CardHeader
│   │   ├── CardTitle ("Mot de passe oublié")
│   │   └── CardDescription
│   ├── CardContent
│   │   ├── Input (email)
│   │   ├── Button ("Envoyer le lien")
│   │   └── Success message
│   └── CardFooter
│       └── Link ("Retour à la connexion")
└── LoadingSpinner (conditional)
```

## 14. `/create` - Création

```
CreatePage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   ├── Title ("Créer")
│   └── Description
├── Creation Options
│   ├── Event Card
│   │   ├── Icon ("📅")
│   │   ├── Title ("Événement")
│   │   ├── Description
│   │   └── Button ("Créer un événement")
│   ├── Group Card
│   │   ├── Icon ("👥")
│   │   ├── Title ("Groupe")
│   │   ├── Description
│   │   └── Button ("Créer un groupe")
│   └── Content Card
│       ├── Icon ("📝")
│       ├── Title ("Contenu")
│       ├── Description
│       └── Button ("Créer du contenu")
└── Help Section
    └── Help text
```

## 15. `/style-guide` - Guide de Style

```
StyleGuidePage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   └── Title ("Guide de Style")
├── Colors Section
│   ├── Primary colors
│   ├── Secondary colors
│   └── Neutral colors
├── Typography Section
│   ├── Headings
│   ├── Body text
│   └── Captions
├── Components Section
│   ├── Buttons
│   ├── Cards
│   ├── Forms
│   └── Navigation
└── Spacing Section
    ├── Margins
    ├── Paddings
    └── Grid system
```

## 16. `/components-demo` - Démo des Composants

```
ComponentsDemoPage
├── ResponsiveLayout
│   ├── Header
│   ├── Sidebar
│   └── MobileNavigation
├── Header Section
│   └── Title ("Démo des Composants")
├── UI Components
│   ├── Buttons demo
│   ├── Cards demo
│   ├── Forms demo
│   ├── Modals demo
│   └── Navigation demo
├── Custom Components
│   ├── EventCard demo
│   ├── UserCard demo
│   ├── GameCard demo
│   └── Sliders demo
└── Interactive Examples
    ├── Form validation
    ├── Modal interactions
    └── Slider navigation
```

---

## 📱 Composants Responsive

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px  
- **Desktop** : > 1024px

### Composants Adaptatifs
- **Header** : Logo + menu burger (mobile) / Logo + navigation (desktop)
- **Sidebar** : Masquée (mobile) / Visible (desktop)
- **Navigation** : Bottom nav (mobile) / Side nav (desktop)
- **Cards** : Stacked (mobile) / Grid (desktop)

---

## 🎨 Styles et Classes

### Couleurs Principales
- **Primary** : Blue (600, 700)
- **Secondary** : Purple (600, 700)
- **Success** : Green (500, 600)
- **Warning** : Yellow (500, 600)
- **Error** : Red (500, 600)

### Typography
- **Font Family** : Inter
- **Headings** : font-bold
- **Body** : font-normal
- **Captions** : text-sm

### Spacing
- **xs** : 0.25rem (4px)
- **sm** : 0.5rem (8px)
- **md** : 1rem (16px)
- **lg** : 1.5rem (24px)
- **xl** : 2rem (32px)

---

## 🔄 Navigation Flow Complet

### 🏠 **Navigation Principale**

```
/ (Landing Page)
├── /login (Connexion)
├── /register (Inscription)
├── /forgot-password (Mot de passe oublié)
├── /onboarding (Première connexion)
└── /dashboard (Tableau de bord) [Authentifié]
```

### 👤 **Navigation Authentifiée**

```
/dashboard
├── /profile (Mon profil)
├── /profile/[username] (Profil utilisateur)
├── /events (Liste événements)
├── /events/[id] (Détail événement)
├── /create-event (Créer événement)
├── /create (Sélection création)
├── /community (Communauté)
├── /search (Recherche)
└── /login (Déconnexion)
```

### 🔗 **Flows Détaillés**

#### **Flow d'Authentification**
```
/ → /login → /dashboard
  ↓
/register → /login?message=check-email → /login → /dashboard
  ↓
/forgot-password → /login (avec message)
```

#### **Flow Profil**
```
/dashboard → /profile
/profile → /profile/[username] (via FriendCard)
/profile/[username] → /profile/[autre-username] (via amis)
/profile/[username] → /events/[id] (via événements créés)
```

#### **Flow Événements**
```
/dashboard → /events (bouton "Voir tous les événements")
/events → /events/[id] (clic sur EventCard)
/events/[id] → /profile/[username] (via créateur/participants)
/events → /create-event (bouton "Créer événement")
/create-event → /events/[id] (après création)
/create-event → /dashboard (annulation)
```

#### **Flow Communauté**
```
/dashboard → /community (bouton "Voir la communauté")
/community → /profile/[username] (clic sur UserCard)
/profile → /community (bouton "Gérer mes amis")
/profile/[username] → /community (bouton "Voir tous les amis")
```

#### **Flow Recherche**
```
/community → /search (via search input)
/events → /search (via search input)
/search → /events/[id] (résultats événements)
/search → /profile/[username] (résultats utilisateurs)
```

#### **Flow Création**
```
/dashboard → /create (bouton création)
/create → /create-event (sélection "Événement")
/create → /community (sélection "Groupe")
/create → /profile (sélection "Contenu")
```

### 🚪 **Flows de Déconnexion**

```
Toute page authentifiée → /login (logout)
/events/[id] → /login (si non connecté)
/profile → /login (si non connecté)
/dashboard → /login (si non connecté)
/create-event → /login (si non connecté)
```

### 🔄 **Flows de Redirection**

```
/ → /dashboard (si déjà connecté)
/login → /dashboard (après connexion)
/register → /login (après inscription)
/forgot-password → /login (après envoi email)
/onboarding → /dashboard (après onboarding)
```

### 📱 **Navigation Mobile**

```
MobileNavigation
├── /dashboard (🏠)
├── /events (📅)
├── /community (👥)
├── /profile (👤)
└── /create (➕)
```

### 🎯 **Navigation Contextuelle**

#### **Depuis EventCard**
```
EventCard → /events/[id]
EventCard → /profile/[creator-username] (via créateur)
```

#### **Depuis UserCard**
```
UserCard → /profile/[username]
```

#### **Depuis FriendCard**
```
FriendCard → /profile/[username]
```

#### **Depuis ParticipantCard**
```
ParticipantCard → /profile/[username]
```

### 🔍 **Navigation de Recherche**

```
Search Input (any page) → /search
/search → /events/[id] (filter: events)
/search → /profile/[username] (filter: users)
/search → /community (filter: community)
```

### ⚙️ **Navigation Admin/Utilitaire**

```
/configure-supabase → /test-supabase → /dashboard
/test-registration → /register → /dashboard
/admin/create-event → /dashboard
/admin/add-user-tags → /dashboard
/style-guide (développement)
/components-demo (développement)
/header-demo (développement)
```

### 🎨 **Navigation Développement**

```
/style-guide (Guide de style)
/components-demo (Démo composants)
/header-demo (Démo header responsive)
/test-registration (Test inscription)
/test-supabase (Test connexion)
```

### 📊 **Matrice de Navigation**

| Page Source | Destinations Possibles |
|-------------|----------------------|
| `/` | `/login`, `/register`, `/dashboard` |
| `/login` | `/dashboard`, `/register`, `/forgot-password` |
| `/register` | `/login`, `/dashboard` |
| `/dashboard` | `/profile`, `/events`, `/community`, `/create`, `/login` |
| `/profile` | `/community`, `/login`, `/profile/[username]` |
| `/profile/[username]` | `/community`, `/events/[id]`, `/profile/[autre]` |
| `/events` | `/events/[id]`, `/create-event`, `/search` |
| `/events/[id]` | `/profile/[username]`, `/login` |
| `/create-event` | `/events/[id]`, `/dashboard` |
| `/community` | `/profile/[username]`, `/search` |
| `/search` | `/events/[id]`, `/profile/[username]`, `/community` |
| `/create` | `/create-event`, `/community`, `/profile` |

### 🔐 **Contrôles d'Accès**

```
Pages Publiques: /, /login, /register, /forgot-password
Pages Authentifiées: /dashboard, /profile, /events, /community, /search, /create-event, /create
Pages Admin: /admin/*, /configure-supabase, /test-*
Pages Dev: /style-guide, /components-demo, /header-demo
```

---

*Dernière mise à jour : $(date)*

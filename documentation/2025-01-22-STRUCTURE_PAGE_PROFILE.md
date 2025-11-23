# Structure de la Page Profile - Navigation par Liste avec Modales

## Date de création
22 janvier 2025

## Dernière mise à jour
22 janvier 2025 - Ajout des modales avec bouton de validation

## Vue d'ensemble
La page `/profile` affiche les sections en liste verticale. Lorsqu'un utilisateur clique sur une section, le contenu correspondant s'affiche dans une modale avec un bouton de validation. Cette approche offre une meilleure expérience utilisateur en concentrant l'attention sur une section à la fois.

## Modifications apportées

### Version Web (`apps/web/app/profile/page.tsx`)

#### Structure des composants

```
ProfilePage
├── ResponsiveLayout
│   ├── Header
│   │   ├── Title ("👤 Profil")
│   │   ├── Description
│   │   └── Button ("Se déconnecter")
│   └── Main Content
│       ├── Grid (lg:grid-cols-4)
│       │   ├── Sections List (lg:col-span-1)
│       │   │   └── Card
│       │   │       ├── CardHeader
│       │   │       │   └── CardTitle ("Sections")
│       │   │       └── CardContent
│       │   │           └── Navigation List
│       │   │               ├── Section Item (Informations)
│       │   │               ├── Section Item (Jeux)
│       │   │               ├── Section Item (Préférences)
│       │   │               ├── Section Item (Événements)
│       │   │               ├── Section Item (Amis)
│       │   │               └── Section Item (Actions)
│       │   └── Message d'information (lg:col-span-3)
│       │       └── Card
│       │           └── CardContent
│       │               └── Message ("Sélectionnez une section")
│       └── Modal (affichée au clic sur une section)
│           ├── Modal Header
│           │   └── Title (nom de la section)
│           ├── Modal Content
│           │   ├── Section: Informations
│           │   │   └── Card
│           │   │       ├── CardHeader
│           │   │       │   └── CardTitle ("👤 Informations du profil")
│           │   │       └── CardContent
│           │   │           ├── Avatar
│           │   │           └── User Info (Email, ID, Dates, Bio)
│           │   ├── Section: Jeux
│           │   │   └── Card
│           │   │       ├── CardHeader
│           │   │       │   └── CardTitle ("🎮 Mes jeux")
│           │   │       └── CardContent
│           │   │           └── Games Grid
│           │   ├── Section: Préférences
│           │   │   └── UserPreferences Component
│           │   ├── Section: Événements
│           │   │   └── Card
│           │   │       ├── CardHeader
│           │   │       │   └── CardTitle ("📅 Mes événements")
│           │   │       └── CardContent
│           │   │           └── Events Timeline
│           │   ├── Section: Amis
│           │   │   ├── Section Header
│           │   │   │   ├── Title ("👥 Mes amis")
│           │   │   │   └── Button ("Gérer mes amis")
│           │   │   └── FriendsSlider Component
│           │   └── Section: Actions
│           │       └── Card
│           │           ├── CardHeader
│           │           │   └── CardTitle ("⚙️ Actions")
│           │           └── CardContent
│           │               ├── Button ("Modifier le profil")
│           │               ├── Button ("Changer le mot de passe")
│           │               ├── Button ("Préférences")
│           │               ├── Button ("Notifications")
│           │               └── Info Box
│           └── Modal Footer
│               ├── Button ("Annuler")
│               └── Button ("Valider")
```

#### Sections disponibles

1. **Mes informations** (👤)
   - Email
   - ID utilisateur
   - Date d'inscription
   - Dernière connexion
   - Bio

2. **Mes jeux** (🎮)
   - Grille des jeux de la collection
   - État vide si aucun jeu

3. **Mes préférences** (⭐)
   - Composant UserPreferences

4. **Mes événements** (📅)
   - Timeline des événements organisés et participés
   - Badge de rôle (Organisateur/Participant)

5. **Mes amis** (👥)
   - Composant FriendsSlider
   - Bouton de gestion

6. **Actions** (⚙️)
   - Modifier le profil
   - Changer le mot de passe
   - Préférences
   - Notifications

#### États et interactions

- **Section active** : Mise en surbrillance avec `bg-blue-50` et bordure gauche bleue
- **Navigation** : Clic sur un élément de la liste pour ouvrir la modale avec le contenu de la section
- **Sticky sidebar** : La liste des sections reste visible lors du scroll (`sticky top-6`)
- **Modale** : S'ouvre au clic sur une section, affiche le contenu correspondant
- **Bouton de validation** : Ferme la modale et réinitialise la section active
- **Bouton d'annulation** : Ferme la modale sans action

### Version Mobile (`apps/mobile/app/(tabs)/profile/index.tsx`)

#### Structure des composants

```
ProfilePage
├── PageLayout
│   ├── Header
│   │   ├── Avatar
│   │   ├── Full Name
│   │   ├── Username
│   │   ├── Bio (optionnel)
│   │   └── Location (optionnel)
│   ├── Stats Container
│   │   ├── Stat Card (Événements créés)
│   │   ├── Stat Card (Participations)
│   │   ├── Stat Card (Jeux)
│   │   └── Stat Card (Amis)
│   ├── Sections List Container
│   │   └── ScrollView (vertical)
│   │       ├── Section Item (Informations)
│   │       ├── Section Item (Amis)
│   │       ├── Section Item (Confidentialité)
│   │       ├── Section Item (Notifications)
│   │       ├── Section Item (Sécurité)
│   │       ├── Section Item (Préférences)
│   │       └── Section Item (Mon compte)
│   └── Modal (affichée au clic sur une section)
│       ├── Modal Header
│       │   └── Title (nom de la section)
│       ├── Modal Content
│       │   ├── Section: Informations
│       │   │   └── Profile Info Card
│       │   ├── Section: Amis
│       │   │   ├── UserSearchBar
│       │   │   ├── Received Requests
│       │   │   ├── Sent Requests
│       │   │   └── Friends List
│       │   ├── Section: Confidentialité
│       │   │   └── PrivacySettings Component
│       │   ├── Section: Notifications
│       │   │   └── NotificationsSettings Component
│       │   ├── Section: Sécurité
│       │   │   └── SecuritySettings Component
│       │   ├── Section: Préférences
│       │   │   └── PreferencesSettings Component
│       │   └── Section: Mon compte
│       │       └── Account Info Card
│       └── Modal Footer
│           ├── Button ("Annuler")
│           └── Button ("Valider")
└── Actions Container
    ├── Action Button (Mes événements)
    ├── Action Button (Communauté)
    ├── Action Button (Paramètres)
    └── Action Button (Déconnexion)
```

#### Sections disponibles (Mobile)

1. **Mes infos** (👤)
   - Nom d'utilisateur
   - Nom complet
   - Bio
   - Ville

2. **Mes amis** (👥)
   - Barre de recherche d'utilisateurs
   - Demandes reçues
   - Demandes envoyées
   - Liste d'amis

3. **Confidentialité** (🔒)
   - Composant PrivacySettings

4. **Notifications** (🔔)
   - Composant NotificationsSettings

5. **Sécurité** (🛡️)
   - Composant SecuritySettings

6. **Préférences** (⭐)
   - Composant PreferencesSettings

7. **Mon compte** (📧)
   - Email
   - Date d'inscription

#### Styles et interactions

- **Section active** : 
  - `backgroundColor: '#eff6ff'` (bleu clair)
  - `borderLeftWidth: 4` avec `borderLeftColor: '#3b82f6'` (bleu)
  - Texte en bleu et gras

- **Section inactive** :
  - Fond transparent
  - Texte gris

- **Navigation** : TouchableOpacity avec feedback visuel
- **Modale** : S'ouvre au clic sur une section, affiche le contenu correspondant
- **Bouton de validation** : Ferme la modale et réinitialise la section active
- **Bouton d'annulation** : Ferme la modale sans action

## Différences entre Web et Mobile

### Web
- Layout en grille (1 colonne sur mobile, 4 colonnes sur desktop)
- Sidebar sticky avec liste des sections à gauche
- Contenu principal à droite (3 colonnes sur desktop)
- Design responsive avec Tailwind CSS

### Mobile
- Layout vertical empilé
- Liste des sections après les stats
- Contenu de la section active en dessous
- Design avec StyleSheet React Native

## Avantages de cette approche

1. **Meilleure UX** : Navigation plus claire et intuitive avec modales
2. **Focus** : L'utilisateur se concentre sur une section à la fois
3. **Accessibilité** : Liste verticale plus facile à parcourir
4. **Responsive** : S'adapte mieux aux différentes tailles d'écran
5. **Cohérence** : Structure similaire entre web et mobile
6. **Performance** : Chargement conditionnel du contenu selon la section active
7. **Validation explicite** : Le bouton de validation permet de confirmer les actions

## État par défaut

- **Web** : Aucune section active par défaut, message d'information affiché
- **Mobile** : Aucune section active par défaut, contenu affiché dans la modale au clic

## Notes techniques

- Les sections sont définies dans un tableau `sections` pour faciliter la maintenance
- Chaque section a une clé unique, un label et une icône
- Le state `activeSection` (web) ou `activeTab` (mobile) gère la section actuellement affichée
- Le state `modal.isOpen` (web) ou `modalOpen` (mobile) gère l'ouverture/fermeture de la modale
- Le contenu est rendu conditionnellement dans la modale selon la section active
- Le composant `Modal` est utilisé pour afficher le contenu avec un footer personnalisé
- Les boutons "Valider" et "Annuler" sont présents dans le footer de chaque modale
- La fonction `handleValidate` peut être personnalisée selon la section pour effectuer des actions spécifiques


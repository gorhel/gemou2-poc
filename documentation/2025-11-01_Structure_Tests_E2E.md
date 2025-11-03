# Structure des tests E2E

**Date :** 1er novembre 2025

## 🏗️ Architecture des tests

### Tests Web (Playwright)

```
apps/web/
├── e2e/
│   ├── login.spec.ts          # Tests d'authentification
│   ├── events.spec.ts         # Tests des événements (à créer)
│   ├── marketplace.spec.ts    # Tests marketplace (à créer)
│   └── profile.spec.ts        # Tests profil (à créer)
├── playwright.config.ts       # Configuration Playwright
└── playwright-report/         # Rapports générés
```

#### Arborescence des composants testés - Web

```
Page Login (/login)
├── Formulaire de connexion
│   ├── Input Email
│   ├── Input Password
│   └── Bouton Connexion
├── Lien "Créer un compte"
└── Lien "Mot de passe oublié"

Page Accueil (/)
├── Header
│   ├── Logo
│   ├── Navigation
│   └── Profil utilisateur
├── Liste des événements
│   ├── Carte événement
│   │   ├── Image
│   │   ├── Titre
│   │   ├── Date/Lieu
│   │   └── Bouton "Rejoindre"
└── Footer

Page Événement (/events/[id])
├── Détails événement
│   ├── Image principale
│   ├── Informations
│   └── Liste des participants
├── Actions
│   ├── Rejoindre/Quitter
│   └── Partager
└── Commentaires
```

### Tests Mobile (Detox)

```
apps/mobile/
├── e2e/
│   ├── jest.config.js         # Configuration Jest pour Detox
│   ├── login.e2e.ts           # Tests d'authentification
│   ├── navigation.e2e.ts      # Tests navigation (à créer)
│   ├── events.e2e.ts          # Tests événements (à créer)
│   └── profile.e2e.ts         # Tests profil (à créer)
├── .detoxrc.js                # Configuration Detox
└── artifacts/                 # Screenshots/vidéos des tests
```

#### Arborescence des composants testés - Mobile

```
App Mobile
├── Tabs Navigation
│   ├── Tab Home (index)
│   │   ├── Header
│   │   ├── Liste événements
│   │   └── Bouton "Créer événement"
│   ├── Tab Événements
│   │   ├── Filtres
│   │   └── Liste complète
│   ├── Tab Marketplace
│   │   ├── Recherche
│   │   └── Grille produits
│   └── Tab Profil
│       ├── Avatar
│       ├── Informations
│       └── Paramètres
│
├── Screens
│   ├── Login Screen (login.tsx)
│   │   ├── testID: 'login-screen'
│   │   ├── testID: 'email-input'
│   │   ├── testID: 'password-input'
│   │   ├── testID: 'login-button'
│   │   └── testID: 'register-link'
│   │
│   ├── Register Screen (register.tsx)
│   │   ├── testID: 'register-screen'
│   │   ├── testID: 'username-input'
│   │   ├── testID: 'email-input'
│   │   ├── testID: 'password-input'
│   │   └── testID: 'register-button'
│   │
│   ├── Event Details Screen
│   │   ├── testID: 'event-details'
│   │   ├── testID: 'join-button'
│   │   └── testID: 'participants-list'
│   │
│   └── Create Event Screen
│       ├── testID: 'create-event-form'
│       ├── testID: 'event-title-input'
│       ├── testID: 'event-date-picker'
│       └── testID: 'submit-button'
│
└── Components réutilisables
    ├── testID: 'app-root'
    ├── testID: 'tab-home'
    ├── testID: 'tab-events'
    ├── testID: 'tab-marketplace'
    └── testID: 'tab-profile'
```

---

## 🎯 TestIDs à ajouter

### Priorité Haute (pour les tests E2E)

#### Login/Register
```tsx
// login.tsx
<View testID="login-screen">
  <TextInput testID="email-input" />
  <TextInput testID="password-input" />
  <Button testID="login-button" />
  <Link testID="register-link" />
</View>

// register.tsx
<View testID="register-screen">
  <TextInput testID="username-input" />
  <TextInput testID="email-input" />
  <TextInput testID="password-input" />
  <Button testID="register-button" />
</View>
```

#### Navigation
```tsx
// _layout.tsx
<View testID="app-root">
  <Tabs>
    <Tabs.Screen testID="tab-home" />
    <Tabs.Screen testID="tab-events" />
    <Tabs.Screen testID="tab-marketplace" />
    <Tabs.Screen testID="tab-profile" />
  </Tabs>
</View>
```

#### Événements
```tsx
// events/[id].tsx
<View testID="event-details">
  <Text testID="event-title" />
  <Button testID="join-button" />
  <View testID="participants-list" />
</View>

// create-event.tsx
<View testID="create-event-form">
  <TextInput testID="event-title-input" />
  <DatePicker testID="event-date-picker" />
  <Button testID="submit-button" />
</View>
```

---

## 📝 Conventions de nommage TestID

### Format recommandé

```
{component}-{element}-{action?}
```

### Exemples

```typescript
// ✅ Bon
testID="login-button"
testID="email-input"
testID="event-card-join-button"
testID="profile-avatar"

// ❌ Éviter
testID="btn1"
testID="input"
testID="div"
```

### Par catégorie

| Catégorie | Préfixe | Exemple |
|-----------|---------|---------|
| Screens | `{name}-screen` | `login-screen` |
| Inputs | `{name}-input` | `email-input` |
| Buttons | `{name}-button` | `submit-button` |
| Lists | `{name}-list` | `events-list` |
| Cards | `{name}-card` | `event-card` |
| Tabs | `tab-{name}` | `tab-home` |

---

## 🧪 Patterns de tests

### Pattern 1 : Test de navigation

```typescript
describe('Navigation', () => {
  it('navigue vers les détails d\'un événement', async () => {
    // Arrange
    await element(by.id('events-list')).toBeVisible()
    
    // Act
    await element(by.id('event-card')).atIndex(0).tap()
    
    // Assert
    await expect(element(by.id('event-details'))).toBeVisible()
  })
})
```

### Pattern 2 : Test de formulaire

```typescript
describe('Formulaire de connexion', () => {
  it('permet de se connecter', async () => {
    // Arrange
    await element(by.id('email-input')).typeText('user@test.com')
    await element(by.id('password-input')).typeText('password123')
    
    // Act
    await element(by.id('login-button')).tap()
    
    // Assert
    await expect(element(by.id('home-screen'))).toBeVisible()
  })
})
```

### Pattern 3 : Test d'erreur

```typescript
describe('Validation', () => {
  it('affiche une erreur pour email invalide', async () => {
    // Arrange
    await element(by.id('email-input')).typeText('invalid')
    
    // Act
    await element(by.id('login-button')).tap()
    
    // Assert
    await expect(element(by.text(/email invalide/i))).toBeVisible()
  })
})
```

---

## 🔄 Workflow de création de tests

### 1. Identifier les user flows critiques

- Inscription/Connexion
- Création d'événement
- Rejoindre un événement
- Acheter sur marketplace
- Modifier son profil

### 2. Ajouter les testIDs nécessaires

```tsx
// Avant
<Button onPress={handleSubmit}>
  Valider
</Button>

// Après
<Button testID="submit-button" onPress={handleSubmit}>
  Valider
</Button>
```

### 3. Écrire le test

```typescript
it('user flow complet', async () => {
  // Setup
  // Actions
  // Vérifications
})
```

### 4. Exécuter localement

```bash
# Web
cd apps/web
npm run test:e2e

# Mobile
cd apps/mobile
npm run test:e2e:ios
```

### 5. Valider en CI

Push le code et vérifier que le CI passe.

---

## 📊 Couverture des tests E2E

### Objectifs

- ✅ **Critiques** : 100% des flows critiques
- ✅ **Importants** : 80% des fonctionnalités principales
- ✅ **Secondaires** : 50% des fonctionnalités secondaires

### Flows critiques (priorité 1)

- [ ] Inscription utilisateur
- [ ] Connexion utilisateur
- [ ] Création d'événement
- [ ] Rejoindre un événement
- [ ] Quitter un événement
- [ ] Voir son profil

### Flows importants (priorité 2)

- [ ] Recherche d'événements
- [ ] Filtres événements
- [ ] Liste des amis
- [ ] Ajouter un ami
- [ ] Acheter sur marketplace
- [ ] Créer une annonce marketplace

### Flows secondaires (priorité 3)

- [ ] Modifier son avatar
- [ ] Changer mot de passe
- [ ] Notifications
- [ ] Paramètres

---

## 🐛 Debugging des tests

### Playwright

```bash
# Mode UI
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug

# Générer un rapport HTML
npx playwright show-report
```

### Detox

```bash
# Mode verbose
detox test --loglevel verbose

# Screenshots automatiques
# (configuré dans .detoxrc.js)

# Voir les artifacts
open apps/mobile/artifacts
```

---

## 📚 Ressources

### Documentation

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Detox Introduction](https://wix.github.io/Detox/docs/introduction/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

### Exemples dans le projet

- `apps/web/e2e/login.spec.ts` - Tests Playwright
- `apps/mobile/e2e/login.e2e.ts` - Tests Detox

---

**Dernière mise à jour** : 1er novembre 2025


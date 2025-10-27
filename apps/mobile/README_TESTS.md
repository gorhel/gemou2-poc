# 🧪 Guide des Tests - Application Mobile

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Structure des tests](#structure-des-tests)
4. [Commandes disponibles](#commandes-disponibles)
5. [Écrire des tests](#écrire-des-tests)
6. [Mocks et helpers](#mocks-et-helpers)
7. [Couverture de code](#couverture-de-code)
8. [CI/CD](#cicd)
9. [Bonnes pratiques](#bonnes-pratiques)

---

## 🎯 Vue d'ensemble

Cette application mobile utilise **Jest** et **React Native Testing Library** pour les tests unitaires et d'intégration.

### Objectifs de couverture

- **Branches** : 80%
- **Fonctions** : 80%
- **Lignes** : 80%
- **Statements** : 80%

### Technologies

- **Jest 29** : Framework de test
- **React Native Testing Library** : Tests de composants
- **Jest Expo** : Preset pour Expo
- **TypeScript** : Typage des tests

---

## ⚙️ Configuration

### Fichiers de configuration

- `jest.config.js` : Configuration principale de Jest
- `jest.setup.js` : Setup global (mocks, helpers)
- `tsconfig.json` : Configuration TypeScript

### Installation

```bash
npm install --legacy-peer-deps
```

---

## 📁 Structure des tests

```
apps/mobile/
├── __tests__/
│   ├── unit/                    # Tests unitaires
│   │   ├── components/
│   │   │   ├── ui/              # Composants UI
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Input.test.tsx
│   │   │   │   └── Card.test.tsx
│   │   │   ├── auth/            # Authentification
│   │   │   │   └── AuthProvider.test.tsx
│   │   │   ├── events/          # Événements
│   │   │   └── games/           # Jeux
│   │   ├── hooks/               # Hooks personnalisés
│   │   └── utils/               # Utilitaires
│   │       └── validation.test.ts
│   ├── integration/             # Tests d'intégration
│   │   └── auth-flow.test.tsx
│   └── setup/                   # Configuration des tests
│       ├── helpers/
│       │   ├── render.tsx       # Render personnalisé
│       │   └── test-utils.tsx   # Utilitaires de test
│       └── mocks/
│           ├── data.ts          # Données mockées
│           └── supabase.ts      # Mocks Supabase
├── components/
├── lib/
└── utils/
```

---

## 🚀 Commandes disponibles

### Commandes principales

```bash
# Lancer tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests en CI
npm run test:ci
```

### Commandes avancées

```bash
# Mettre à jour les snapshots
npm run test:update

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration

# Tests verbeux
npm run test:verbose

# Déboguer les tests
npm run test:debug
```

### Tests spécifiques

```bash
# Tester un fichier spécifique
npm test Button.test.tsx

# Tester avec un pattern
npm test -- --testPathPattern=components/ui

# Tester en mode watch pour un fichier
npm test -- --watch Button.test.tsx
```

---

## ✍️ Écrire des tests

### Test d'un composant UI

```typescript
import React from 'react';
import { render, fireEvent } from '../../../setup/helpers/render';
import { Button } from '../../../../components/ui/Button';

describe('Button Component', () => {
  it('devrait afficher le texte du bouton', () => {
    const { getByText } = render(<Button>Cliquez ici</Button>);
    expect(getByText('Cliquez ici')).toBeTruthy();
  });

  it('devrait appeler onPress au clic', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Cliquez</Button>);
    
    fireEvent.press(getByText('Cliquez'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Test d'un hook

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../../../components/auth/AuthProvider';

describe('useAuth Hook', () => {
  it('devrait retourner les valeurs du contexte', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('session');
  });
});
```

### Test d'un utilitaire

```typescript
import { validateEmail } from '../../../utils/validation';

describe('validateEmail', () => {
  it('devrait valider un email correct', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('devrait rejeter un email invalide', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

---

## 🎭 Mocks et helpers

### Utiliser le render personnalisé

```typescript
// ✅ Utiliser le render personnalisé (avec providers)
import { render } from '../../../setup/helpers/render';

// ❌ Ne pas utiliser le render standard
import { render } from '@testing-library/react-native';
```

### Utiliser les données mockées

```typescript
import { mockUser, mockSession, mockEvent } from '../../../setup/mocks/data';

it('devrait afficher les infos utilisateur', () => {
  const { getByText } = render(<UserCard user={mockUser} />);
  expect(getByText(mockUser.email)).toBeTruthy();
});
```

### Utiliser les utilitaires de test

```typescript
import { wait, createTestDate } from '../../../setup/helpers/test-utils';

it('devrait attendre le chargement', async () => {
  render(<AsyncComponent />);
  await wait(100);
  expect(screen.getByText('Chargé')).toBeTruthy();
});
```

---

## 📊 Couverture de code

### Visualiser la couverture

Après avoir exécuté `npm run test:coverage` :

```bash
# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

### Rapport de couverture

```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   82.45 |    78.32 |   85.12 |   83.67 |
 components/ui            |   95.23 |    91.45 |   97.83 |   96.12 |
  Button.tsx              |   98.45 |    95.32 |  100.00 |   99.12 |
  Input.tsx               |   92.12 |    87.65 |   95.45 |   93.23 |
 components/auth          |   88.34 |    82.15 |   90.12 |   89.45 |
 utils                    |   85.23 |    78.45 |   87.12 |   86.23 |
--------------------------|---------|----------|---------|---------|
```

### Fichiers ignorés

Les fichiers suivants sont exclus de la couverture :

- `**/*.d.ts` : Fichiers de déclaration TypeScript
- `**/node_modules/**` : Dépendances
- `**/__tests__/**` : Tests eux-mêmes
- `**/coverage/**` : Rapports de couverture

---

## 🔄 CI/CD

### GitHub Actions

Les tests s'exécutent automatiquement sur :

- **Push** sur `main` ou `develop`
- **Pull Request** vers `main` ou `develop`

### Workflow

1. ✅ Installation des dépendances
2. 🔍 Vérification du linter
3. 🔍 Vérification TypeScript
4. 🧪 Exécution des tests
5. 📊 Upload de la couverture vers Codecov
6. 💬 Commentaire sur la PR avec les résultats

### Badge de couverture

Ajoutez ce badge dans votre README :

```markdown
![Coverage](https://codecov.io/gh/VOTRE_USER/VOTRE_REPO/branch/main/graph/badge.svg)
```

---

## ✅ Bonnes pratiques

### À FAIRE ✅

- ✅ Tester le **comportement**, pas l'implémentation
- ✅ Utiliser des **noms descriptifs** en français
- ✅ Tester les **cas limites** et les **erreurs**
- ✅ **Mocker** les dépendances externes (Supabase, API)
- ✅ Utiliser `data-testid` pour les éléments complexes
- ✅ **Nettoyer** après chaque test (`afterEach`)
- ✅ Tests **isolés** et **indépendants**
- ✅ Utiliser `waitFor` pour les opérations asynchrones

### À ÉVITER ❌

- ❌ Tests trop **couplés** à l'implémentation
- ❌ Tests qui **dépendent** d'autres tests
- ❌ Tests **trop longs** (> 50 lignes)
- ❌ Tester des **détails d'implémentation**
- ❌ **Snapshots** pour tout (uniquement UI stable)
- ❌ Tests **sans assertions**

### Exemples de bons tests

```typescript
// ✅ BON : Teste le comportement
it('devrait afficher une erreur si l\'email est invalide', () => {
  const { getByText } = render(<LoginForm />);
  fireEvent.press(getByText('Se connecter'));
  expect(getByText('Email invalide')).toBeTruthy();
});

// ❌ MAUVAIS : Teste l'implémentation
it('devrait appeler validateEmail avec l\'email', () => {
  const spy = jest.spyOn(utils, 'validateEmail');
  render(<LoginForm />);
  // ...
});
```

### Organisation des tests

```typescript
describe('Composant', () => {
  describe('Rendu de base', () => {
    it('devrait ...');
  });

  describe('Interactions', () => {
    it('devrait ...');
  });

  describe('États', () => {
    it('devrait ...');
  });

  describe('Cas d\'erreur', () => {
    it('devrait ...');
  });
});
```

---

## 🐛 Débogage

### Afficher l'arbre de rendu

```typescript
import { debug } from '@testing-library/react-native';

it('debug test', () => {
  const { debug } = render(<Component />);
  debug(); // Affiche l'arbre complet
});
```

### Logs dans les tests

```typescript
it('debug avec logs', () => {
  console.log('Avant render');
  const { getByText } = render(<Component />);
  console.log('Après render');
  // ...
});
```

### Mode verbose

```bash
npm run test:verbose
```

---

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Expo Testing](https://docs.expo.dev/guides/testing-with-jest/)

---

## 🎯 Prochaines étapes

1. ✅ Augmenter la couverture à 80%+
2. 🔄 Ajouter des tests E2E avec Detox
3. 📊 Configurer les rapports de couverture automatiques
4. 🚀 Intégrer les tests de performance
5. 📱 Ajouter des tests de snapshot pour les composants UI

---

**Maintenu avec ❤️ par l'équipe Gemou2**

*Dernière mise à jour : Octobre 2025*







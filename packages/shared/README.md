# @gemou2/shared

Package partagé entre l'application web (Next.js) et mobile (Expo).

## Contenu

### `components/`
Composants partagés (logique uniquement, pas de UI spécifique)

### `hooks/`
Hooks React réutilisables

### `utils/`
Fonctions utilitaires pures

## Utilisation

### Dans web
```typescript
import { useOnboarding } from '@gemou2/shared/hooks';
```

### Dans mobile
```typescript
import { useOnboarding } from '@gemou2/shared/hooks';
```

## Principes

1. **Pas de dépendances UI spécifiques** - Ni `next/*` ni `expo-*` dans ce package
2. **Logique pure** - Business logic, validation, formatage
3. **Type-safe** - Tout doit être typé en TypeScript
4. **Testé** - Chaque fonction doit avoir des tests


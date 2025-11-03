# Pipeline CI/CD Automatisé - Configuration Complète

**Date de création :** 1er novembre 2025  
**Version :** 1.0.0  
**Auteur :** Système de documentation automatique

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du pipeline](#architecture-du-pipeline)
3. [Configuration Prettier & ESLint](#configuration-prettier--eslint)
4. [Tests E2E](#tests-e2e)
5. [Workflows GitHub Actions](#workflows-github-actions)
6. [Configuration des secrets](#configuration-des-secrets)
7. [Déploiement](#déploiement)
8. [Maintenance et monitoring](#maintenance-et-monitoring)

---

## Vue d'ensemble

Le pipeline CI/CD automatisé de Gemou2 assure :

- ✅ **Qualité du code** : Linting, formatage, vérification TypeScript
- ✅ **Tests automatisés** : Tests unitaires, intégration et E2E
- ✅ **Builds automatiques** : Web (Next.js) et Mobile (Expo)
- ✅ **Déploiement continu** : Vercel (web) et EAS (mobile)

### Technologies utilisées

- **CI/CD** : GitHub Actions
- **Tests E2E Web** : Playwright
- **Tests E2E Mobile** : Detox
- **Déploiement Web** : Vercel
- **Déploiement Mobile** : Expo Application Services (EAS)
- **Code Quality** : ESLint, Prettier, TypeScript

---

## Architecture du pipeline

```
┌─────────────────────────────────────────────────────────┐
│                    Push / Pull Request                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│   Lint & Format│         │  Type Check  │
└───────┬───────┘         └──────┬───────┘
        │                         │
        └──────────┬──────────────┘
                   │
                   ▼
          ┌────────────────┐
          │  Tests Unitaires│
          └────────┬────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌─────────────┐       ┌──────────────┐
│  Build Web  │       │ Build Mobile │
└──────┬──────┘       └──────┬───────┘
       │                     │
       ▼                     ▼
┌─────────────┐       ┌──────────────┐
│  E2E Web    │       │  E2E Mobile  │
│ (Playwright)│       │   (Detox)    │
└──────┬──────┘       └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Status Check   │
         └────────┬────────┘
                  │
                  ▼ (si main)
         ┌────────────────┐
         │   Déploiement   │
         │ Production      │
         └─────────────────┘
```

---

## Configuration Prettier & ESLint

### Prettier (`.prettierrc.json`)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Scripts disponibles

```bash
# Formater automatiquement le code
npm run format

# Vérifier le formatage (utilisé en CI)
npm run format:check

# Linter
npm run lint

# Vérification TypeScript
npm run type-check
```

### Standards de code

- **Indentation** : 2 espaces
- **Quotes** : Simple quotes
- **Semicolons** : Non (sauf si nécessaire)
- **Trailing commas** : ES5

---

## Tests E2E

### Tests Web - Playwright

**Configuration** : `apps/web/playwright.config.ts`

#### Structure des tests

```
apps/web/
├── e2e/
│   ├── login.spec.ts
│   └── ... (autres tests)
└── playwright.config.ts
```

#### Commandes

```bash
# Lancer les tests E2E
cd apps/web
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug
```

#### Exemple de test

```typescript
test('affiche le formulaire de connexion', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('input[type="email"]')).toBeVisible()
})
```

### Tests Mobile - Detox

**Configuration** : `apps/mobile/.detoxrc.js`

#### Structure des tests

```
apps/mobile/
├── e2e/
│   ├── jest.config.js
│   ├── login.e2e.ts
│   └── ... (autres tests)
└── .detoxrc.js
```

#### Commandes

```bash
# Build pour Detox (iOS)
cd apps/mobile
npm run build:e2e:ios

# Lancer les tests E2E (iOS)
npm run test:e2e:ios

# Tests Android
npm run build:e2e:android
npm run test:e2e:android
```

#### Exemple de test

```typescript
it('devrait afficher l\'écran de connexion', async () => {
  await expect(element(by.id('login-screen'))).toBeVisible()
})
```

---

## Workflows GitHub Actions

### Workflow CI (`.github/workflows/ci.yml`)

**Déclenchement** : Push ou Pull Request sur `main` ou `develop`

#### Jobs exécutés

1. **Lint** : Vérification du formatage et linting
2. **Type Check** : Validation TypeScript
3. **Test Unit** : Tests unitaires mobile
4. **Build Web** : Compilation Next.js
5. **Build Mobile** : Build Expo
6. **E2E Web** : Tests Playwright
7. **E2E Mobile** : Tests Detox
8. **Status Check** : Vérification globale

#### Durée estimée

- **Lint + Type Check** : ~2-3 minutes
- **Tests unitaires** : ~3-5 minutes
- **Builds** : ~5-8 minutes
- **Tests E2E** : ~10-15 minutes
- **Total** : ~20-30 minutes

### Workflow Deploy Production (`.github/workflows/deploy-production.yml`)

**Déclenchement** : Push sur `main` ou manuel

#### Jobs exécutés

1. **Deploy Web** : Déploiement Vercel
2. **Deploy Mobile** : Build et soumission EAS
3. **Post-deploy** : Vérifications post-déploiement

#### Durée estimée

- **Web** : ~3-5 minutes
- **Mobile** : ~15-25 minutes (build iOS + Android)

---

## Configuration des secrets

### Secrets GitHub requis

Allez dans **GitHub → Settings → Secrets and variables → Actions**

#### Pour Vercel (Web)

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `VERCEL_TOKEN` | Token d'authentification | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | ID de l'organisation | `.vercel/project.json` après `vercel link` |
| `VERCEL_PROJECT_ID` | ID du projet | `.vercel/project.json` après `vercel link` |

#### Pour Expo/EAS (Mobile)

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `EXPO_TOKEN` | Token Expo | `expo login` puis `expo whoami --token` |

#### Pour Supabase

| Secret | Description | Source |
|--------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | Supabase Dashboard → Settings → API |

### Configuration locale

Créez un fichier `.env.local` à la racine :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Déploiement

### Déploiement Web (Vercel)

#### Automatique (via CI/CD)

1. Push sur `main`
2. Le workflow `deploy-production.yml` se déclenche
3. Build Next.js
4. Déploiement sur Vercel
5. URL de production mise à jour

#### Manuel (depuis votre machine)

```bash
# Installer Vercel CLI
npm i -g vercel

# Lier le projet
cd apps/web
vercel link

# Déployer en production
vercel --prod
```

### Déploiement Mobile (EAS)

#### Configuration EAS

Le fichier `eas.json` est déjà configuré avec :

- **Distribution** : Store (App Store + Google Play)
- **Auto-increment** : Numéro de version automatique
- **Profiles** : development, preview, production

#### Automatique (via CI/CD)

1. Push sur `main`
2. Le workflow `deploy-production.yml` se déclenche
3. Build iOS et Android sur EAS
4. Soumission automatique aux stores

#### Manuel (depuis votre machine)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Build production
cd apps/mobile
eas build --platform all --profile production

# Soumettre aux stores
eas submit --platform all --profile production
```

### Configuration des stores

#### App Store (iOS)

Modifiez dans `eas.json` :

```json
"ios": {
  "appleId": "votre-email@exemple.com",
  "ascAppId": "votre-app-store-connect-id",
  "appleTeamId": "votre-team-id"
}
```

#### Google Play (Android)

1. Créez un compte de service dans Google Cloud Console
2. Téléchargez le fichier JSON
3. Placez-le dans `apps/mobile/google-service-account.json`
4. Ajoutez-le à `.gitignore`

---

## Maintenance et monitoring

### Vérification de la santé du pipeline

#### Statut des workflows

```bash
# Voir les derniers runs
gh workflow list

# Voir l'historique d'un workflow
gh run list --workflow=ci.yml

# Voir les détails d'un run
gh run view <run-id>
```

#### Badges à ajouter au README

```markdown
![CI](https://github.com/votre-org/gemou2/workflows/CI/badge.svg)
![Deploy](https://github.com/votre-org/gemou2/workflows/Deploy%20Production/badge.svg)
```

### Monitoring des déploiements

#### Vercel

- Dashboard : https://vercel.com/dashboard
- Logs en temps réel
- Analytics de performance
- Rollback en un clic

#### EAS

- Dashboard : https://expo.dev/accounts/[your-account]/projects/[your-project]
- Statut des builds
- Logs détaillés
- Distribution testflight/internal

### Actions en cas d'échec

#### CI échoue

1. **Lint/Format** → Exécuter `npm run format` localement
2. **Type Check** → Corriger les erreurs TypeScript
3. **Tests** → Debugger avec `npm run test:watch`
4. **Build** → Vérifier les variables d'environnement

#### Déploiement échoue

1. **Vercel** → Vérifier les logs dans le dashboard
2. **EAS** → Consulter les logs de build EAS
3. **Secrets** → Vérifier que tous les secrets sont configurés

### Optimisations possibles

#### Réduire le temps CI

```yaml
# Paralléliser plus de jobs
# Utiliser un cache npm plus agressif
# Limiter les tests E2E aux chemins critiques
```

#### Améliorer la fiabilité

```yaml
# Augmenter les retries
retries: 3

# Ajouter des timeouts
timeout-minutes: 30
```

---

## Checklist de déploiement

### Avant le premier déploiement

- [ ] Configurer tous les secrets GitHub
- [ ] Lier le projet Vercel
- [ ] Configurer EAS avec `eas build:configure`
- [ ] Vérifier les identifiants App Store/Google Play
- [ ] Tester le workflow CI sur une branche de test
- [ ] Vérifier que `.env.local` est dans `.gitignore`

### Pour chaque déploiement

- [ ] Vérifier que tous les tests passent localement
- [ ] Mettre à jour la version dans `package.json`
- [ ] Créer un tag Git pour la version
- [ ] Vérifier le changelog
- [ ] Surveiller les workflows GitHub Actions
- [ ] Tester l'application déployée

---

## Ressources

### Documentation officielle

- [GitHub Actions](https://docs.github.com/en/actions)
- [Playwright](https://playwright.dev/)
- [Detox](https://wix.github.io/Detox/)
- [Vercel CLI](https://vercel.com/docs/cli)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

### Support

- **Issues GitHub** : Pour les bugs du pipeline
- **Discussions** : Pour les questions générales
- **Documentation interne** : `/documentation/`

---

## Notes importantes

⚠️ **Sécurité**

- Ne jamais committer de secrets dans le code
- Utiliser GitHub Secrets pour toutes les variables sensibles
- Restreindre l'accès aux secrets aux workflows nécessaires

⚠️ **Coûts**

- GitHub Actions : 2000 minutes gratuites/mois (plan Free)
- Vercel : Illimité pour les projets personnels
- EAS : Builds limités sur le plan gratuit

⚠️ **Limitations**

- Tests E2E mobile nécessitent macOS (runners coûteux)
- Builds EAS peuvent prendre 15-25 minutes
- Tests Detox nécessitent des simulateurs iOS/émulateurs Android

---

**Dernière mise à jour** : 1er novembre 2025


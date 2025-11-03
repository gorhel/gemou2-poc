# Pipeline CI/CD - Guide complet

> Pipeline d'intégration et déploiement continus pour Gemou2

## 📦 Ce qui a été configuré

✅ **Prettier & ESLint** - Formatage et linting automatiques  
✅ **GitHub Actions CI** - Tests, builds et validations automatiques  
✅ **GitHub Actions Deploy** - Déploiement automatique production  
✅ **Playwright** - Tests E2E web  
✅ **Detox** - Tests E2E mobile  
✅ **Vercel** - Déploiement web automatique  
✅ **EAS** - Build et soumission mobile automatiques  

---

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les secrets

Ajoutez ces secrets dans **GitHub → Settings → Secrets → Actions** :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
EXPO_TOKEN
```

### 3. Tester localement

```bash
# Formatter le code
npm run format

# Linter
npm run lint

# Tests
cd apps/mobile && npm test
cd apps/web && npm run test:e2e
```

### 4. Déclencher le CI

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push
```

Le pipeline se déclenche automatiquement ! 🎉

---

## 📁 Structure des fichiers

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Workflow CI (tests, builds)
│       └── deploy-production.yml     # Workflow déploiement
│
├── apps/
│   ├── web/
│   │   ├── e2e/                      # Tests Playwright
│   │   │   └── login.spec.ts
│   │   ├── playwright.config.ts
│   │   └── package.json
│   │
│   └── mobile/
│       ├── e2e/                      # Tests Detox
│       │   ├── jest.config.js
│       │   └── login.e2e.ts
│       ├── .detoxrc.js
│       └── package.json
│
├── documentation/
│   ├── 2025-11-01_Pipeline_CICD_Configuration.md    # Doc complète
│   ├── 2025-11-01_Quick_Start_CICD.md               # Démarrage rapide
│   └── 2025-11-01_Structure_Tests_E2E.md            # Structure tests
│
├── .prettierrc.json                  # Config Prettier
├── .prettierignore                   # Fichiers ignorés
├── eas.json                          # Config EAS
└── package.json                      # Scripts racine
```

---

## 🔄 Workflow CI/CD

### Workflow CI (sur push/PR)

```
Lint & Format → Type Check → Tests unitaires
                                    ↓
                          Build Web + Mobile
                                    ↓
                            Tests E2E
                                    ↓
                          Status Check ✅
```

**Durée** : ~20-30 minutes

### Workflow Deploy (sur push main)

```
Build Web → Deploy Vercel → ✅
Build Mobile → Deploy EAS → Soumission stores → ✅
```

**Durée** : ~20-30 minutes

---

## 💻 Commandes disponibles

### Racine du projet

```bash
# Formatage
npm run format              # Formater tout le code
npm run format:check        # Vérifier le formatage

# Linting et types
npm run lint                # Linter (tous workspaces)
npm run type-check          # Vérification TypeScript

# Build
npm run build:web           # Build Next.js
npm run build:mobile        # Build Expo
npm run build               # Build tous

# Dev
npm run dev:web             # Dev Next.js
npm run dev:mobile          # Dev Expo
npm run dev                 # Dev tous
```

### Web (apps/web)

```bash
cd apps/web

# Tests E2E
npm run test:e2e            # Lancer les tests Playwright
npm run test:e2e:ui         # Mode UI interactif
npm run test:e2e:debug      # Mode debug

# Dev et build
npm run dev                 # Serveur dev
npm run build               # Build production
```

### Mobile (apps/mobile)

```bash
cd apps/mobile

# Tests
npm run test                # Tests unitaires
npm run test:ci             # Tests CI (avec coverage)
npm run test:e2e            # Tests E2E Detox
npm run test:e2e:ios        # Tests iOS
npm run test:e2e:android    # Tests Android

# Build E2E
npm run build:e2e:ios       # Build pour Detox iOS
npm run build:e2e:android   # Build pour Detox Android

# Dev
npm run dev                 # Expo dev
npm run dev:ios             # iOS
npm run dev:android         # Android
```

---

## 🎯 Configuration des services

### Vercel

```bash
# Installer CLI
npm i -g vercel

# Lier le projet
cd apps/web
vercel link

# Récupérer les IDs
cat .vercel/project.json
```

Ajoutez `VERCEL_ORG_ID` et `VERCEL_PROJECT_ID` aux secrets GitHub.

### EAS (Expo)

```bash
# Installer CLI
npm i -g eas-cli

# Login
eas login

# Configuration
cd apps/mobile
eas build:configure

# Récupérer le token
eas whoami --token
```

Ajoutez `EXPO_TOKEN` aux secrets GitHub.

---

## 📊 Monitoring

### GitHub Actions

**Voir les workflows** : GitHub → Actions

**Statut en temps réel** : Les workflows apparaissent dans les PR

**Logs détaillés** : Cliquez sur un workflow pour voir les logs

### Vercel

**Dashboard** : https://vercel.com/dashboard

- Voir les déploiements
- Consulter les logs
- Rollback si nécessaire
- Analytics

### EAS

**Dashboard** : https://expo.dev

- Statut des builds
- Logs de compilation
- Distribution (TestFlight, etc.)

---

## 🐛 Dépannage

### Le CI échoue sur le formatage

```bash
npm run format
git add .
git commit -m "fix: formatage"
git push
```

### Tests E2E échouent

**Playwright (web)**
```bash
cd apps/web
npx playwright install --with-deps
npm run test:e2e:debug
```

**Detox (mobile)**
```bash
# macOS uniquement
brew tap wix/brew
brew install applesimutils

cd apps/mobile
npm run build:e2e:ios
npm run test:e2e:ios
```

### Build échoue

1. Vérifier les variables d'environnement
2. Vérifier les secrets GitHub
3. Consulter les logs du workflow
4. Tester le build localement

### Déploiement échoue

**Vercel**
- Vérifier `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Consulter les logs Vercel

**EAS**
- Vérifier `EXPO_TOKEN`
- Consulter les logs EAS
- Vérifier `eas.json`

---

## 📚 Documentation

### Documentation complète

📖 [Pipeline CI/CD Configuration](./documentation/2025-11-01_Pipeline_CICD_Configuration.md)  
🚀 [Quick Start Guide](./documentation/2025-11-01_Quick_Start_CICD.md)  
🧪 [Structure des tests E2E](./documentation/2025-11-01_Structure_Tests_E2E.md)

### Ressources externes

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright Docs](https://playwright.dev/)
- [Detox Docs](https://wix.github.io/Detox/)
- [Vercel Docs](https://vercel.com/docs)
- [EAS Docs](https://docs.expo.dev/build/introduction/)

---

## ✅ Checklist première utilisation

### Configuration initiale

- [ ] Installer toutes les dépendances (`npm install`)
- [ ] Configurer les secrets GitHub (voir section ci-dessus)
- [ ] Lier le projet Vercel (`vercel link`)
- [ ] Configurer EAS (`eas build:configure`)
- [ ] Tester le workflow CI sur une branche

### Avant chaque déploiement

- [ ] Tests passent localement
- [ ] Code formaté (`npm run format`)
- [ ] Pas d'erreurs de linting (`npm run lint`)
- [ ] Version mise à jour dans `package.json`
- [ ] Changelog à jour

### Après déploiement

- [ ] Vérifier le workflow GitHub Actions
- [ ] Tester l'application déployée (web)
- [ ] Vérifier les builds EAS (mobile)
- [ ] Monitorer les erreurs

---

## 🎉 Prochaines étapes

### Améliorations possibles

1. **Tests E2E** : Ajouter plus de scénarios de test
2. **Monitoring** : Intégrer Sentry pour le tracking d'erreurs
3. **Performance** : Ajouter Lighthouse CI
4. **Security** : Scanner de vulnérabilités automatique
5. **Preview deployments** : Déploiements automatiques des PR

### Tests à ajouter

Voir [Structure des tests E2E](./documentation/2025-11-01_Structure_Tests_E2E.md) pour la liste complète des tests à implémenter.

---

## 💡 Astuces

### Développement local

```bash
# Formater automatiquement avant chaque commit
npm run format && git add -u
```

### CI plus rapide

- Limiter les tests E2E aux chemins critiques
- Utiliser le cache npm agressivement
- Paralléliser les jobs indépendants

### Debugging

```bash
# Voir les logs en temps réel
gh run watch

# Télécharger les artifacts
gh run download <run-id>
```

---

## 📞 Support

**Questions** : Ouvrir une discussion GitHub  
**Bugs** : Créer une issue GitHub  
**Documentation** : Voir `/documentation/`

---

**Dernière mise à jour** : 1er novembre 2025  
**Version du pipeline** : 1.0.0


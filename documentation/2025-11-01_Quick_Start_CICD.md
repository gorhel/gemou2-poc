# Guide de démarrage rapide - Pipeline CI/CD

**Date :** 1er novembre 2025

## 🚀 Mise en route en 5 minutes

### 1. Installer les dépendances

```bash
# À la racine du projet
npm install
```

### 2. Configurer les secrets GitHub

Allez dans **GitHub → Settings → Secrets → Actions** et ajoutez :

#### Obligatoires
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `EXPO_TOKEN`

### 3. Tester localement

```bash
# Formater le code
npm run format

# Vérifier le linting
npm run lint

# Vérifier TypeScript
npm run type-check

# Tests unitaires
cd apps/mobile && npm run test
```

### 4. Tester les workflows

```bash
# Créer une branche de test
git checkout -b test-ci

# Faire un commit
git add .
git commit -m "test: vérification CI"

# Push pour déclencher le CI
git push origin test-ci
```

### 5. Surveiller l'exécution

Allez sur **GitHub → Actions** pour voir le pipeline en action.

---

## 📋 Commandes utiles

### Développement

```bash
# Formater automatiquement
npm run format

# Dev web
npm run dev:web

# Dev mobile
npm run dev:mobile
```

### Tests

```bash
# Tests unitaires mobile
cd apps/mobile && npm run test:ci

# Tests E2E web
cd apps/web && npm run test:e2e

# Tests E2E mobile
cd apps/mobile && npm run test:e2e:ios
```

### Build

```bash
# Build web
npm run build:web

# Build mobile
npm run build:mobile
```

---

## 🔧 Configuration Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Lier le projet
cd apps/web
vercel link

# Les fichiers .vercel/project.json contiennent les IDs nécessaires
```

---

## 📱 Configuration EAS

```bash
# Installer EAS CLI
npm i -g eas-cli

# Login
eas login

# Configurer le projet
cd apps/mobile
eas build:configure
```

---

## ⚡ Déclenchement du déploiement

```bash
# Option 1 : Push sur main
git checkout main
git merge votre-branche
git push origin main

# Option 2 : Déclenchement manuel
# GitHub → Actions → Deploy Production → Run workflow
```

---

## 🐛 Dépannage rapide

### Le CI échoue sur le formatting

```bash
npm run format
git add .
git commit -m "fix: formatage automatique"
git push
```

### Tests E2E échouent localement

```bash
# Web
cd apps/web
npx playwright install --with-deps

# Mobile
brew tap wix/brew
brew install applesimutils
```

### Build échoue

Vérifiez les variables d'environnement dans GitHub Secrets.

---

## 📚 Documentation complète

Voir : [Pipeline_CICD_Configuration.md](./2025-11-01_Pipeline_CICD_Configuration.md)


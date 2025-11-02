# 🛠️ Stack Technique - Gemou2

## 📦 Architecture
**Monorepo** (Turbo) → 2 apps + 2 packages partagés

```
gemou2-poc/
├── apps/
│   ├── web/         # Application Web
│   └── mobile/      # Application Mobile
└── packages/
    ├── database/    # Logique Supabase
    └── shared/      # Utils partagés
```

---

## 🌐 App Web

| Techno | Version | Usage |
|--------|---------|-------|
| **Next.js** | 15.1.0 | Framework React SSR/SSG |
| **React** | 19.1.0 | UI Library |
| **TypeScript** | 5.3.0 | Typage statique |
| **Tailwind CSS** | 3.3.0 | Styling utility-first |
| **Supabase** | 2.38.0 | Backend (Auth + DB) |

**Features** : App Router, Server Components, API Routes

---

## 📱 App Mobile

| Techno | Version | Usage |
|--------|---------|-------|
| **Expo** | 54.0.13 | Framework React Native |
| **React Native** | 0.81.4 | Mobile natif iOS/Android |
| **React** | 19.1.0 | UI Library |
| **TypeScript** | 5.3.0 | Typage statique |
| **NativeWind** | 4.2.1 | Tailwind pour RN |
| **Expo Router** | 6.0.12 | Navigation file-based |

**Features** : Universal (Web + Mobile), File-based routing

---

## 🗄️ Backend

| Service | Usage |
|---------|-------|
| **Supabase** | BaaS (Postgres + Auth + Storage + Realtime) |
| **PostgreSQL** | Base de données relationnelle |
| **Row Level Security** | Sécurité au niveau base |

---

## 🎨 UI/UX

### Web
- **Tailwind CSS** : Utility-first
- **Radix UI** : Composants accessibles
- **Shadcn UI** : Design system

### Mobile
- **NativeWind** : Tailwind pour React Native
- **React Native components** : UI natives

---

## 🔧 Tooling

| Outil | Usage |
|-------|-------|
| **Turbo** | Monorepo build system |
| **npm** | Package manager |
| **ESLint** | Linter JavaScript/TypeScript |
| **TypeScript** | Type checking |
| **Git** | Version control |

---

## 📂 Structure Simplifiée

```
📦 Gemou2 Monorepo
│
├── 🌐 apps/web (Next.js 15)
│   ├── React 19 + TypeScript
│   ├── Tailwind CSS
│   └── Supabase Client
│
├── 📱 apps/mobile (Expo 54)
│   ├── React Native 0.81
│   ├── React 19 + TypeScript
│   ├── NativeWind
│   └── Expo Router
│
├── 💾 packages/database
│   └── Supabase helpers
│
└── 🔧 packages/shared
    └── Utils communs
```

---

## 🚀 Commandes Clés

```bash
# Dev
npm run dev           # Tous les apps
npm run dev:web       # Web only
npm run dev:mobile    # Mobile only

# Build
npm run build         # Tous les apps
npm run build:web     # Web production
npm run build:mobile  # Mobile export

# Quality
npm run type-check    # TypeScript
npm run lint          # ESLint
```

---

## 🎯 Points Forts

✅ **Monorepo** : Code partagé entre Web & Mobile  
✅ **Type-safe** : 100% TypeScript  
✅ **Modern** : React 19 + Next.js 15  
✅ **Universal** : Une base de code, 3 plateformes (Web, iOS, Android)  
✅ **Backend ready** : Supabase intégré  
✅ **DX optimale** : Turbo, Hot reload, TypeScript  

---

**Version** : 0.1.0  
**Dernière mise à jour** : 21 octobre 2025


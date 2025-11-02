# 📋 Audit de Migration vers Expo Router Universel

**Date**: 21 octobre 2025  
**Objectif**: Migrer de 2 apps (web + mobile) vers 1 app universelle Expo Router

---

## 🗺️ AUDIT DES ROUTES

### Routes Web uniquement (à migrer)
| Route Web | Existe dans Mobile | Action requise |
|-----------|-------------------|----------------|
| `/admin/add-user-tags` | ❌ Non | Migrer vers mobile |
| `/components-demo` | ❌ Non | Migrer (utile pour dev) |
| `/configure-supabase` | ❌ Non | Migrer (config) |
| `/create` | ❌ Non | Migrer ou fusionner avec create-event |
| `/header-demo` | ❌ Non | Migrer (utile pour dev) |
| `/style-guide` | ❌ Non | Migrer (utile pour dev) |
| `/test-registration` | ❌ Non | Migrer (tests) |
| `/test-supabase` | ❌ Non | Migrer (tests) |
| `/not-found` | ❌ Non | Créer dans mobile |
| `/error` | ❌ Non | Créer dans mobile |

### Routes communes (à vérifier et harmoniser)
| Route | Web | Mobile | Action |
|-------|-----|--------|--------|
| `/` | ✅ `page.tsx` | ✅ `index.tsx` | Comparer et unifier |
| `/login` | ✅ | ✅ | Comparer et unifier |
| `/register` | ✅ | ✅ | Comparer et unifier |
| `/forgot-password` | ✅ | ✅ | Comparer et unifier |
| `/onboarding` | ✅ | ✅ | Comparer et unifier |
| `/dashboard` | ✅ | ✅ (tabs) | Comparer et unifier |
| `/events` | ✅ | ✅ | Comparer et unifier |
| `/events/[id]` | ✅ (6 versions!) | ✅ | Unifier versions web |
| `/community` | ✅ | ✅ | Comparer et unifier |
| `/search` | ✅ | ✅ | Comparer et unifier |
| `/marketplace` | ✅ | ✅ (tabs) | Comparer et unifier |
| `/profile` | ✅ | ✅ | Comparer et unifier |
| `/profile/[username]` | ✅ | ✅ | Comparer et unifier |
| `/create-event` | ✅ | ✅ | Comparer et unifier |
| `/admin/create-event` | ✅ | ✅ | Comparer et unifier |
| `/create-trade` | ✅ | ✅ | Comparer et unifier |
| `/trade/[id]` | ✅ | ✅ | Comparer et unifier |

### Routes spéciales
| Route | Type | Action |
|-------|------|--------|
| `/api/events` | API Route | Migrer vers Supabase Edge Function |
| `/api/games/popular` | API Route | Migrer vers Supabase Edge Function |
| `/api/games/search` | API Route | Migrer vers Supabase Edge Function |
| `/api/test-user-tags` | API Route | Migrer vers Supabase Edge Function |
| `/api/username/check` | API Route | Migrer vers Supabase Edge Function |
| `/auth/callback` | Auth callback | Adapter pour Expo |
| `layout.tsx` | Root layout | Adapter pour Expo Router |

---

## 🧩 AUDIT DES COMPOSANTS

### Composants Web à migrer vers Mobile

#### **Auth (2 composants)**
| Composant | Status | Action |
|-----------|--------|--------|
| `AuthForm.tsx` | Dupliqué | Comparer versions et unifier |
| `AuthProvider.tsx` | Dupliqué | Comparer versions et unifier |

#### **Events (9 composants)** 
| Composant | Mobile | Action |
|-----------|--------|--------|
| `CreateEventForm.tsx` | ❌ | Migrer avec adaptation RN |
| `EventCard.tsx` | ❌ | Migrer avec adaptation RN |
| `EventDetailsModal.tsx` | ❌ | Migrer avec adaptation RN |
| `EventParticipationButton.tsx` | ❌ | Migrer avec adaptation RN |
| `EventsList.tsx` | ❌ | Migrer avec adaptation RN |
| `EventsSlider.tsx` | ❌ | Migrer avec adaptation RN |
| `GameSelector.tsx` | ❌ | Migrer avec adaptation RN |
| `ParticipantCard.tsx` | ❌ | Migrer avec adaptation RN |
| `index.ts` | ❌ | Créer |

#### **Games (3 composants)**
| Composant | Mobile | Action |
|-----------|--------|--------|
| `GameCard.tsx` | ❌ | Migrer avec adaptation RN |
| `GameDetailsModal.tsx` | ❌ | Migrer avec adaptation RN |
| `GamesRecommendations.tsx` | ❌ | Migrer avec adaptation RN |

#### **Layout (1 composant)**
| Composant | Mobile | Action |
|-----------|--------|--------|
| `ResponsiveLayout.tsx` | ❌ | Migrer avec adaptation RN |

#### **Marketplace (4 composants)**
| Composant | Mobile | Action |
|-----------|--------|--------|
| `GameSelect.tsx` | ❌ | Migrer avec adaptation RN |
| `ImageUpload.tsx` | ❌ | Migrer avec adaptation RN |
| `LocationAutocomplete.tsx` | ❌ | Migrer avec adaptation RN |
| `MarketplaceListings.tsx` | ❌ | Migrer avec adaptation RN |

#### **Navigation (2 composants)**
| Composant | Mobile | Action |
|-----------|--------|--------|
| `DesktopSidebar.tsx` | ❌ | Migrer (variant `.web.tsx`) |
| `MobileNavigation.tsx` | ❌ | Migrer (variant `.native.tsx`) |

#### **Onboarding (3 composants)**
| Composant | Mobile | Action |
|-----------|--------|--------|
| `OnboardingCarousel.tsx` | ❌ | Migrer avec adaptation RN |
| `OnboardingNavigation.tsx` | ❌ | Migrer avec adaptation RN |
| `OnboardingSlide.tsx` | ❌ | Migrer avec adaptation RN |

#### **UI (12 composants)**
| Composant Web | Mobile | Action |
|---------------|--------|--------|
| `Button.tsx` | ✅ Existe | Comparer et unifier |
| `Card.tsx` | ✅ Existe | Comparer et unifier |
| `Input.tsx` | ❌ | Migrer avec adaptation RN |
| `Loading.tsx` | ❌ | Migrer avec adaptation RN |
| `Modal.tsx` | ❌ | Migrer avec adaptation RN |
| `Navigation.tsx` | ❌ | Migrer avec adaptation RN |
| `ResponsiveHeader.tsx` | ❌ | Migrer avec adaptation RN |
| `Select.tsx` | ❌ | Migrer avec adaptation RN |
| `SmallPill.tsx` | ❌ | Migrer avec adaptation RN |
| `Table.tsx` | ❌ | Migrer avec adaptation RN |
| `Toggle.tsx` | ❌ | Migrer avec adaptation RN |
| `UsernameInput.tsx` | ❌ | Migrer avec adaptation RN |

#### **Users (6 composants)**
| Composant | Mobile | Action |
|-----------|--------|--------|
| `FriendCard.tsx` | ❌ | Migrer avec adaptation RN |
| `FriendsSlider.tsx` | ❌ | Migrer avec adaptation RN |
| `UserCard.tsx` | ❌ | Migrer avec adaptation RN |
| `UserPreferences.tsx` | ❌ | Migrer avec adaptation RN |
| `UsersRecommendations.tsx` | ❌ | Migrer avec adaptation RN |
| `UsersSlider.tsx` | ❌ | Migrer avec adaptation RN |

### **Total composants à migrer: 42 composants**

---

## 📦 AUDIT DES HOOKS ET UTILS

### Hooks Web
| Hook | Action |
|------|--------|
| `useEventParticipantsCount.ts` | Migrer vers /packages/shared |
| `useEventParticipation.ts` | Migrer vers /packages/shared |
| `useEventParticipationFixed.ts` | Fusionner et migrer |
| `useEventParticipationRobust.ts` | Fusionner et migrer |
| `useUsernameValidation.ts` | Migrer vers /packages/shared |

### Lib Web
| Fichier | Action |
|---------|--------|
| `onboarding-data.ts` | Migrer vers mobile/lib |
| `supabase-client.ts` | Fusionner avec mobile |
| `supabase-triggers.ts` | Migrer vers mobile/lib |
| `supabase.ts` | Fusionner avec mobile |
| `utils.ts` | Migrer vers /packages/shared |
| `types/games.ts` | Migrer vers /packages/database |

---

## 🎨 AUDIT DES ASSETS

### Web Assets
| Asset | Action |
|-------|--------|
| `public/images/onboarding/*` (10 fichiers) | Migrer vers mobile/assets |
| `public/placeholder-game.jpg` | Migrer vers mobile/assets |
| `public/placeholder-game.svg` | Migrer vers mobile/assets |

### Styles
| Fichier | Action |
|---------|--------|
| `globals.css` | Adapter pour NativeWind dans mobile |
| `tailwind.config.js` | Fusionner avec mobile |
| `postcss.config.js` | Vérifier compatibilité |

---

## 🔧 AUDIT DES CONFIGURATIONS

### Fichiers de config Web
| Fichier | Action |
|---------|--------|
| `next.config.js` | ❌ Supprimer (remplacé par app.config.js) |
| `next-env.d.ts` | ❌ Supprimer |
| `env.local` | Fusionner avec mobile/env.local |
| `tsconfig.json` | Comparer avec mobile |
| `package.json` | Fusionner dépendances vers mobile |

---

## 📊 STATISTIQUES

### Routes
- **Routes web uniquement**: 10
- **Routes communes**: 17
- **API Routes**: 5
- **Routes spéciales**: 2
- **Total routes à traiter**: 34

### Composants
- **Composants à migrer**: 42
- **Composants dupliqués**: 4
- **Total composants**: 46

### Fichiers
- **Hooks**: 5
- **Utils/Lib**: 6
- **Assets**: 12
- **Configs**: 5

### **TOTAL FICHIERS À TRAITER: ~100 fichiers**

---

## ⚡ PLAN DE MIGRATION

### Phase 1: Configuration Expo Web ✅
- [x] Vérifier app.config.js
- [ ] Configurer web build
- [ ] Configurer SEO/meta tags

### Phase 2: Migration Composants UI (Priorité 1)
- [ ] Migrer composants UI de base (Button, Card, Input, etc.)
- [ ] Migrer composants Events
- [ ] Migrer composants Users
- [ ] Migrer composants Games
- [ ] Migrer composants Marketplace
- [ ] Migrer composants Navigation
- [ ] Migrer composants Onboarding
- [ ] Migrer composants Layout

### Phase 3: Migration Routes (Priorité 2)
- [ ] Migrer routes d'authentification
- [ ] Migrer routes principales (dashboard, events, etc.)
- [ ] Migrer routes admin
- [ ] Migrer routes de test/démo

### Phase 4: Migration Logique Métier
- [ ] Migrer hooks vers /packages/shared
- [ ] Migrer utils vers /packages/shared
- [ ] Migrer types vers /packages/database

### Phase 5: Migration API Routes
- [ ] Créer Supabase Edge Functions
- [ ] Migrer logique API
- [ ] Tester les Edge Functions

### Phase 6: Assets et Styles
- [ ] Migrer images
- [ ] Adapter styles CSS vers NativeWind
- [ ] Migrer thème Tailwind

### Phase 7: Tests
- [ ] Tests web (Chrome, Safari, Firefox)
- [ ] Tests iOS (simulateur)
- [ ] Tests Android (émulateur)
- [ ] Tests de régression

### Phase 8: Nettoyage
- [ ] Supprimer /apps/web
- [ ] Nettoyer dépendances
- [ ] Mettre à jour configs (turbo.json, package.json)
- [ ] Mettre à jour documentation

---

## 🎯 ESTIMATION

- **Temps total estimé**: 20-30 heures
- **Complexité**: Élevée
- **Risques**: Moyens (bien gérable avec tests)

---

## ✅ PROCHAINES ÉTAPES IMMÉDIATES

1. Configurer Expo pour le web
2. Migrer les composants UI de base
3. Migrer les routes une par une
4. Tester continuellement

---

**Statut**: 🚀 Prêt à démarrer la migration

---

## 🆕 Mise à Jour : Migration React 19 & Next.js 15

**Date** : 21 octobre 2025  
**Statut** : ✅ **COMPLÉTÉE**

### Contexte

Avant de poursuivre la migration Expo, nous avons résolu un conflit critique de dépendances peer entre :
- App Web (React 18) 
- App Mobile (React 19)
- Packages Radix UI (nécessaires pour expo-router)

### Actions Effectuées

1. ✅ **Mise à jour React 18 → 19** dans l'app web
2. ✅ **Mise à jour Next.js 14 → 15** (support React 19)
3. ✅ **Harmonisation des types** : `@types/react@19.2.2` partout
4. ✅ **Ajout d'overrides** dans le `package.json` root
5. ✅ **Correction des imports React** dans le package database

### Résultat

- ✅ Installation des dépendances **sans erreurs ERESOLVE**
- ✅ Package database compilé avec succès
- ⚠️ Erreurs TypeScript préexistantes identifiées (à corriger séparément)

### Documentation

Voir `MIGRATION_REACT_19.md` pour le rapport complet.


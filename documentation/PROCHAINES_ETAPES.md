# 🎯 Prochaines Étapes - Migration Expo Universel

## ✅ Ce qui est fait (20% de la migration)

### Configuration ✅
- Expo configuré pour le web avec SEO
- Package.json mis à jour avec `@react-native-picker/picker`

### Composants Migrés (12 composants) ✅
- **UI** : Input, Textarea, Loading, Modal, Select, Toggle, SmallPill, Button, Card
- **Events** : EventCard, EventsList  
- **Users** : UserCard
- **Games** : GameCard

### Structure Packages ✅
- Types games partagés dans `/packages/database/games.ts`

---

## 🚀 Actions Immédiates (À FAIRE MAINTENANT)

### 1. Installer les dépendances
```bash
cd apps/mobile
npm install
```

### 2. Tester l'app
```bash
# Web
npm run dev:web
# Ouvrir http://localhost:8081

# iOS (optionnel)
npm run dev:ios

# Android (optionnel)
npm run dev:android
```

---

## 📋 Ce qu'il reste à faire (80%)

### Priorité 1 - Composants Critiques (34 composants restants)
```
Events (6) :
- CreateEventForm
- EventDetailsModal
- EventParticipationButton
- EventsSlider
- GameSelector
- ParticipantCard

Users (5) :
- FriendCard
- FriendsSlider
- UserPreferences
- UsersRecommendations
- UsersSlider

Games (2) :
- GameDetailsModal
- GamesRecommendations

Marketplace (4) :
- GameSelect
- ImageUpload
- LocationAutocomplete
- MarketplaceListings

Navigation (2) :
- DesktopSidebar
- MobileNavigation

Onboarding (3) :
- OnboardingCarousel
- OnboardingNavigation
- OnboardingSlide

Layout (1) :
- ResponsiveLayout

UI restants (4) :
- Table
- Navigation
- ResponsiveHeader
- UsernameInput
```

### Priorité 2 - Routes (27 routes)
```
Routes web uniquement (10) :
- /admin/add-user-tags
- /components-demo
- /configure-supabase
- /create
- /header-demo
- /style-guide
- /test-registration
- /test-supabase
- /not-found
- /error

Routes à harmoniser (17) :
- Comparer et unifier les implémentations web vs mobile
```

### Priorité 3 - Hooks & Utils (8 fichiers)
```
- useEventParticipation (fusionner 4 versions)
- useEventParticipantsCount
- useUsernameValidation
- onboarding-data.ts
- supabase-client.ts
- supabase-triggers.ts
- utils.ts
```

### Priorité 4 - Assets (12 fichiers)
```
- Images onboarding (10 fichiers)
- placeholder-game.jpg
- placeholder-game.svg
- Adapter globals.css
```

### Priorité 5 - API Routes → Edge Functions (6 routes)
```
- /api/events
- /api/games/popular
- /api/games/search
- /api/test-user-tags
- /api/username/check
- /auth/callback
```

### Priorité 6 - Tests & Validation
```
- Tests web (Chrome, Safari, Firefox)
- Tests iOS (simulateur)
- Tests Android (émulateur)
- Tests de régression
```

### Priorité 7 - Nettoyage Final
```
- Backup /apps/web
- Supprimer /apps/web
- Mettre à jour turbo.json
- Mettre à jour package.json racine
- Mettre à jour README.md
```

---

## ⏱️ Estimation de Temps

| Phase | Temps estimé |
|-------|--------------|
| Composants restants | 8-10h |
| Routes | 4-6h |
| Hooks & Utils | 2-3h |
| Assets | 1-2h |
| Edge Functions | 3-4h |
| Tests | 3-4h |
| Nettoyage | 2-3h |
| **TOTAL** | **23-32h** |

---

## 💡 Conseils

### Pour Accélérer la Migration

1. **Commencez par les composants les plus utilisés**
   - EventDetailsModal
   - CreateEventForm
   - OnboardingCarousel

2. **Migrez les hooks avant les composants qui les utilisent**
   - useEventParticipation d'abord
   - Puis EventParticipationButton

3. **Testez au fur et à mesure**
   - Un composant = un test web + mobile
   - Ne pas attendre la fin pour tester

4. **Utilisez les composants déjà migrés comme modèles**
   - Copiez la structure d'EventCard ou UserCard
   - Adaptez le contenu

---

## 🆘 Si vous rencontrez un problème

### Erreur de build
```bash
cd apps/mobile
rm -rf node_modules
npm install
npm run dev:web
```

### Erreur de types
```bash
# Vérifier les imports
# ❌ import { X } from '@gemou2/ui'
# ✅ import { X } from '../components/ui'
```

### Composant ne s'affiche pas
```bash
# Vérifier que vous utilisez bien les composants React Native
# ❌ <div>
# ✅ <View>

# ❌ <span>
# ✅ <Text>
```

---

## 📁 Fichiers de Référence

| Fichier | Description |
|---------|-------------|
| `AUDIT_MIGRATION_EXPO.md` | Audit complet (détails techniques) |
| `MIGRATION_PROGRESS.md` | Progression détaillée |
| `RESUMÉ_MIGRATION_EXPO.md` | Résumé complet en français |
| `PROCHAINES_ETAPES.md` | Ce fichier (actions concrètes) |

---

## ✅ Checklist Rapide

Avant de continuer la migration, assurez-vous de :

- [ ] Avoir installé les dépendances (`npm install`)
- [ ] Avoir testé l'app en mode web
- [ ] Avoir compris la structure des composants migrés
- [ ] Avoir lu le résumé complet
- [ ] Savoir utiliser NativeWind (= Tailwind pour React Native)

---

**Prêt à continuer ?** Commencez par migrer `CreateEventForm` ou `EventDetailsModal` en vous basant sur `EventCard.tsx` comme modèle !

**Besoin d'aide ?** Consultez les composants déjà migrés dans `apps/mobile/components/`


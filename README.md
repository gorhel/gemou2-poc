# 🎲 Gémou2 POC - Application Jeux de Société

Application mobile & web dédiée aux passionnés de jeux de société.

## 🚀 Installation Rapide

```bash
# 1. Aller dans le dossier projet
cd gemou2-poc

# 2. Installer les dépendances
npm install

# 3. Lancer le développement
npm run dev:web      # Web app sur localhost:3000
npm run dev:mobile   # Mobile app avec Expo
```

## 🏗️ Architecture

- **Frontend Mobile**: React Native 0.81 + Expo 54 + React 19
- **Frontend Web**: Next.js 15 + React 19 + Tailwind CSS  
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL
- **Deploy**: Vercel (Web) + EAS (Mobile)

## 📁 Structure

```
gemou2-poc/
├── apps/
│   ├── mobile/     # React Native Expo
│   └── web/        # Next.js
├── packages/       # Code partagé
└── supabase/       # Configuration backend
```

## 🔧 Commandes Disponibles

```bash
npm run dev           # Lance tous les projets en dev
npm run dev:web       # Web uniquement
npm run dev:mobile    # Mobile uniquement
npm run build         # Build de production
npm run lint          # Vérification du code
npm run type-check    # Vérification TypeScript
```

## 🎯 Fonctionnalités

### ✅ Implémentées
- 🔐 **Authentification** (Email, Google, Facebook)
- 📱 **Applications iOS/Android/Web**
- 🎨 **Design System** complet
- 📄 **Onboarding** interactif
- 🔑 **Page de connexion** dédiée
- 🔄 **Réinitialisation** mot de passe
- 👤 **Inscription** utilisateur

### 🔄 En cours
- 📅 **Événements** (Création, recherche, participation)
- 💬 **Messagerie** temps réel
- 🛒 **Marketplace** (Vente/échange)
- 👥 **Communauté** et profils

## 📖 Documentation

### Documentation Complète
📚 **[Index de toute la documentation](./documentation/INDEX.md)** - 43+ guides et rapports

### Documents Essentiels
- 🚀 [Démarrer ici](./documentation/START_HERE.md) - Guide de démarrage
- 🛠️ [Stack Technique](./documentation/STACK_TECHNIQUE.md) - Architecture complète
- ⭐ [Rapport Final Migration](./documentation/RAPPORT_FINAL_CORRECTIONS.md) - Migration React 19

### Guides de Setup
- [Configuration Mobile](./docs/MOBILE_SETUP.md) - Setup React Native + Expo
- [Configuration Supabase](./docs/SUPABASE_SETUP.md) - Backend et base de données

## 🌐 Routes Disponibles

### Web
- `/` - Page d'accueil (redirige vers onboarding si premier visite)
- `/onboarding` - Introduction à l'application
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/forgot-password` - Réinitialisation mot de passe
- `/components-demo` - Démonstration des composants
- `/style-guide` - Guide de style

### Mobile
- `/` - Page d'accueil
- `/onboarding` - Introduction mobile
- `/login` - Connexion mobile

## 🗄️ Base de Données (Supabase)

### Tables Principales
- **profiles** - Profils utilisateurs
- **events** - Événements jeux de société
- **event_applications** - Inscriptions aux événements
- **conversations** - Conversations
- **messages** - Messages
- **marketplace_items** - Annonces marketplace
- **games** - Catalogue de jeux
- **user_games** - Collections utilisateurs
- **contacts** - Système d'amis
- **notifications** - Notifications
- **reviews** - Évaluations

## 🔐 Authentification

### Méthodes Supportées
- **Email/Mot de passe** avec validation
- **Google OAuth** avec callback
- **Facebook OAuth** avec callback
- **Session persistante** avec "Se souvenir de moi"
- **Réinitialisation** mot de passe par email
- **Mode invité** pour accès sans compte

### Sécurité
- Validation côté client et serveur
- Protection contre les attaques par force brute
- Messages d'erreur sécurisés
- Gestion des sessions Supabase

## 🎨 Design System

### Composants UI
- **Button** - Boutons avec variantes (primary, secondary, outline, etc.)
- **Card** - Cartes avec hover et ombres
- **Input** - Champs de saisie avec validation
- **Modal** - Fenêtres modales et confirmations
- **Loading** - États de chargement et squelettes
- **Navigation** - Header, sidebar, breadcrumb
- **Table** - Tableaux responsives

### Couleurs
- **Primary** - Bleu (#3b82f6)
- **Secondary** - Violet (#a855f7)
- **Accent** - Vert (#22c55e)
- **Success** - Vert (#22c55e)
- **Warning** - Orange (#f59e0b)
- **Error** - Rouge (#ef4444)

## 🚀 Déploiement

### Web (Vercel)
```bash
npm run build:web
# Déploiement automatique via Vercel
```

### Mobile (EAS)
```bash
npm run build:mobile
# Déploiement via EAS Build
```

## 🧪 Tests

### Commandes de Test
```bash
npm run lint          # Vérification ESLint
npm run type-check    # Vérification TypeScript
npm run test          # Tests unitaires (à venir)
```

### Scénarios Testés
- ✅ Onboarding et redirection
- ✅ Connexion avec email/mot de passe
- ✅ Connexion sociale (Google/Facebook)
- ✅ Inscription utilisateur
- ✅ Réinitialisation mot de passe
- ✅ Navigation entre pages
- ✅ Validation des formulaires

## 📊 Métriques

### Fonctionnalités Implémentées
- **OUT-144** : Route onboarding par défaut ✅
- **OUT-132** : Page de connexion US-AUTH-008 ✅
- **Design System** : Composants UI complets ✅
- **Responsive** : Support mobile/desktop ✅
- **Accessibilité** : Navigation clavier, focus ✅

## 🤝 Contribution

### Workflow
1. Créer une branche feature (ex: `OUT-XXX-description`)
2. Développer la fonctionnalité
3. Tester localement
4. Créer une Pull Request
5. Code review
6. Merge vers main

### Standards
- **Code** : TypeScript strict, ESLint
- **Commits** : Format conventionnel
- **Tests** : Couverture > 80%
- **Documentation** : README et commentaires

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@gemou2.com
- 💬 Discord : [Lien Discord]
- 🐛 Issues : [GitHub Issues]

---

*Développé avec ❤️ pour la communauté des jeux de société*

## 📝 Changelog

### v0.2.0 - Page de Connexion (OUT-132)
- ✅ Page de connexion dédiée avec validation
- ✅ Connexion sociale (Google, Facebook)
- ✅ Mot de passe oublié et inscription
- ✅ Session persistante et mode invité
- ✅ Interface responsive et accessible

### v0.1.0 - Onboarding (OUT-144)
- ✅ Route onboarding par défaut
- ✅ Interface d'introduction interactive
- ✅ Support mobile et web
- ✅ Redirection vers la connexion
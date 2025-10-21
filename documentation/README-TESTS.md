# 🧪 Système de Tests Automatisés - Gémou2

## 🎯 Objectif

Ce système de tests automatisés a été créé pour **vérifier que les fonctionnalités existantes ne sont pas cassées** lors de l'ajout de nouvelles fonctionnalités. Il détecte rapidement les régressions et maintient la qualité du code.

## 🚀 Utilisation rapide

```bash
# Lancer tous les tests
node run-tests.js

# Mode verbeux avec détails
node run-tests.js --verbose

# Tests des composants uniquement
node test-components.js

# Tests de sécurité uniquement
node test-permissions.js

# Ajouter de nouveaux tests
node add-test.js

# Démonstration du système
node demo-tests.js
```

## 📊 Ce qui est testé

### ✅ Composants (45+ tests)
- **Routes** : Présence de toutes les pages principales
- **Composants UI** : Button, Card, LoadingSpinner, SmallPill, ResponsiveHeader
- **Composants métier** : EventsSlider, EventCard, CreateEventForm, FriendsSlider, etc.
- **Hooks** : useEventParticipantsCount, useUsernameValidation
- **Fonctions** : fetchUserEvents, fetchUserProfile

### 🔒 Permissions (15+ tests)
- **Authentification** : Contrôles sur pages protégées
- **Amitié** : Accès conditionnel aux données privées
- **RLS** : Row Level Security dans les requêtes Supabase
- **Propriétaire** : Contrôles de creator_id/user_id
- **Gestion d'erreur** : Messages utilisateur appropriés

## ⚡ Performance

- **Tests parallèles** : 10x plus rapide
- **Durée totale** : < 5 secondes
- **Timeout** : 5 secondes max par test
- **Optimisé** : Lecture de fichiers minimale

## 📄 Rapports générés

- `test-global-report.json` - Rapport global
- `test-report.json` - Rapport des composants
- `test-permissions-report.json` - Rapport des permissions

## 🔧 Extension

Le système est conçu pour être facilement extensible :

1. **Menu interactif** : `node add-test.js`
2. **Configuration JSON** : `test-config.json`
3. **Scripts modulaires** : Chaque type de test est séparé

## 📚 Documentation complète

Voir `TESTS_DOCUMENTATION.md` pour la documentation détaillée.

## 🎭 Démonstration

```bash
node demo-tests.js
```

---

*Système créé pour maintenir la qualité du code Gémou2* 🎯

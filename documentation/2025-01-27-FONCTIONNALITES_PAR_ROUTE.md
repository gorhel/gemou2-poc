# Liste complète des fonctionnalités par route

**Date de création :** 2025-01-27  
**Format :** Liste structurée pour intégration Excel

---

## 📊 Vue d'ensemble

| Plateforme | Nombre de routes |
|------------|-----------------|
| Web | 20 routes |
| Mobile | 16 routes |
| API | 7 endpoints |
| **Total** | **43 routes/endpoints** |

---

## 🌐 Routes Web

| Fonctionnalité | Route | Description |
|----------------|-------|-------------|
| Page d'accueil | `/` | Page de présentation de l'application avec redirection vers onboarding ou dashboard selon l'état de connexion |
| Onboarding | `/onboarding` | Processus de découverte de l'application avec 4 slides de présentation |
| Connexion | `/login` | Page de connexion utilisateur avec authentification email/mot de passe via Supabase |
| Inscription | `/register` | Page d'inscription avec validation en temps réel du nom d'utilisateur et création de compte |
| Mot de passe oublié | `/forgot-password` | Page de réinitialisation du mot de passe via email |
| Dashboard | `/dashboard` | Tableau de bord principal avec statistiques utilisateur, événements, jeux et recommandations |
| Liste des événements | `/events` | Affichage de la liste de tous les événements disponibles avec filtres et recherche |
| Détail événement | `/events/[id]` | Page détaillée d'un événement avec informations complètes, participants et possibilité de rejoindre |
| Créer un événement | `/create-event` | Formulaire de création d'événement avec sélection de jeu, date, lieu et paramètres |
| Marketplace | `/marketplace` | Affichage de toutes les annonces de vente, échange et don de jeux avec filtres |
| Créer une annonce | `/create-trade` | Formulaire de création d'annonce marketplace avec upload d'images et détails du jeu |
| Détail annonce | `/trade/[id]` | Page détaillée d'une annonce marketplace avec informations du vendeur et contact |
| Communauté | `/community` | Liste des membres de la communauté avec recherche et accès aux profils publics |
| Recherche globale | `/search` | Page de recherche globale pour événements, utilisateurs et jeux avec filtres par catégorie |
| Profil utilisateur | `/profile` | Page de profil personnel avec sections modales (informations, jeux, préférences, événements, amis, compte, actions) |
| Profil public | `/profile/[username]` | Page de profil public d'un autre utilisateur avec statistiques et actions (message, ami) |
| Détail jeu | `/games/[id]` | Page détaillée d'un jeu avec informations complètes depuis BoardGameGeek et collection |
| Style guide | `/style-guide` | Page de démonstration des composants UI et du design system de l'application |
| Demo composants | `/components-demo` | Page de démonstration de tous les composants réutilisables disponibles |
| Configuration Supabase | `/configure-supabase` | Page de configuration et test de la connexion Supabase (admin/dev) |
| Test inscription | `/test-registration` | Page de test pour l'inscription et la création de compte utilisateur |
| Test Supabase | `/test-supabase` | Page de test pour vérifier la connexion et les fonctionnalités Supabase |
| Admin - Créer événement | `/admin/create-event` | Page admin pour créer rapidement un événement de test (développement) |
| Admin - Ajouter tags | `/admin/add-user-tags` | Page admin pour ajouter des tags utilisateur (développement) |

---

## 📱 Routes Mobile

| Fonctionnalité | Route | Description |
|----------------|-------|-------------|
| Page d'accueil | `/(tabs)/dashboard` | Tableau de bord mobile avec statistiques et accès rapide aux fonctionnalités principales |
| Liste événements | `/(tabs)/events/index` | Affichage mobile de la liste des événements avec pull-to-refresh et filtres |
| Détail événement | `/(tabs)/events/[id]` | Page mobile détaillée d'un événement avec participation en temps réel |
| Marketplace | `/(tabs)/marketplace` | Liste mobile des annonces marketplace avec filtres et recherche |
| Communauté | `/(tabs)/community` | Page mobile de la communauté avec recherche de joueurs et profils publics |
| Profil | `/(tabs)/profile/index` | Page mobile du profil personnel avec statistiques et actions rapides |
| Créer événement | `/(tabs)/create-event` | Formulaire mobile de création d'événement avec sélection de jeu et date |
| Créer annonce | `/(tabs)/create-trade` | Formulaire mobile de création d'annonce avec upload photos depuis galerie |
| Profil public | `/profile/[username]` | Page mobile du profil public d'un autre utilisateur |
| Détail annonce | `/trade/[id]` | Page mobile détaillée d'une annonce avec contact vendeur |
| Détail jeu | `/games/[id]` | Page mobile détaillée d'un jeu avec ajout à la collection |
| Conversation | `/conversations/[id]` | Page mobile de conversation privée entre utilisateurs avec envoi de messages |
| Recherche | `/(tabs)/search` | Page mobile de recherche globale avec résultats filtrés par catégorie |
| Onboarding | `/onboarding` | Processus de découverte mobile avec 4 slides et navigation tactile |
| Connexion | `/login` | Page mobile de connexion avec authentification Supabase |
| Inscription | `/register` | Formulaire mobile d'inscription avec validation temps réel |
| Mot de passe oublié | `/forgot-password` | Page mobile de réinitialisation du mot de passe |
| Demo composants | `/components-demo` | Page mobile de démonstration des composants React Native |
| Admin événement | `/admin/create-event` | Page mobile admin pour créer des événements de test |

---

## 🔌 Routes API

| Fonctionnalité | Route | Méthode | Description |
|----------------|-------|---------|-------------|
| Créer événement | `/api/events` | POST | Endpoint API pour créer un nouvel événement en base de données |
| Liste événements | `/api/events` | GET | Endpoint API pour récupérer la liste de tous les événements |
| Recherche jeux | `/api/games/search?q=` | GET | Endpoint API pour rechercher des jeux dans BoardGameGeek et la base de données locale |
| Jeux populaires | `/api/games/popular` | GET | Endpoint API pour récupérer les jeux les plus populaires |
| Vérifier username | `/api/username/check?username=` | GET | Endpoint API pour vérifier la disponibilité d'un nom d'utilisateur en temps réel |
| Test tags utilisateur | `/api/test-user-tags` | GET | Endpoint API de test pour les tags utilisateur (développement) |
| Callback OAuth | `/auth/callback` | GET | Endpoint de callback pour l'authentification OAuth (Google, Facebook) |

---

## 📋 Format CSV pour Excel

Le fichier `2025-01-27-FONCTIONNALITES_PAR_ROUTE.csv` est disponible dans le dossier `documentation/` et peut être importé directement dans Excel.

**Colonnes :**
- Plateforme (Web/Mobile/API)
- Fonctionnalité (nom de la fonctionnalité)
- Route (chemin de la route)
- Description (description en une phrase)

---

## 🔍 Notes

- Les routes marquées comme "admin" ou "test" sont destinées au développement uniquement
- Les routes dynamiques utilisent des paramètres entre crochets `[id]`, `[username]`
- Les routes sous `/(tabs)/` sont accessibles via la navigation par onglets sur mobile
- Toutes les routes API retournent du JSON

---

## 📊 Statistiques

**Routes publiques (sans authentification) :** 8 routes
**Routes protégées (authentification requise) :** 28 routes
**Routes API :** 7 endpoints
**Routes admin/test :** 6 routes


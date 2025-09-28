# 🚀 Configuration de Supabase Local

## 📋 Prérequis

### 1. **Docker Desktop**
- **Téléchargez** : [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Installez** et **démarrez** Docker Desktop
- **Vérifiez** que Docker fonctionne : `docker --version`

### 2. **Node.js et npm**
- **Vérifiez** que Node.js est installé : `node --version`
- **Vérifiez** que npm est installé : `npm --version`

## 🔧 Installation Automatique

### Option A : Script Automatique (Recommandée)
```bash
cd /Users/essykouame/Downloads/gemou2-poc
./setup-supabase-local.sh
```

### Option B : Installation Manuelle

#### 1. **Installer Supabase CLI**
```bash
# Sur macOS avec Homebrew
brew install supabase/tap/supabase

# Sur Linux
curl -fsSL https://supabase.com/install.sh | sh

# Vérifier l'installation
supabase --version
```

#### 2. **Initialiser Supabase dans le projet**
```bash
cd /Users/essykouame/Downloads/gemou2-poc
supabase init
```

#### 3. **Démarrer Supabase local**
```bash
supabase start
```

## 📊 Vérification de l'Installation

### 1. **Vérifier le statut**
```bash
supabase status
```

Vous devriez voir quelque chose comme :
```
supabase local development setup is running.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Accéder au Dashboard**
- **Studio URL** : http://localhost:54323
- **Inbucket** (emails) : http://localhost:54324

## 🔄 Configuration de l'Application

### 1. **Variables d'environnement locales**
Créez un fichier `.env.local` :

```bash
# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Récupérer les clés**
```bash
# Récupérer les clés depuis Supabase local
supabase status | grep "anon key" | cut -d' ' -f3
supabase status | grep "service_role key" | cut -d' ' -f3
```

### 3. **Mettre à jour le fichier de configuration**
Vérifiez que `apps/web/lib/supabase-client.ts` utilise les bonnes variables :

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
```

## 📦 Application des Migrations

### 1. **Vérifier les migrations en attente**
```bash
supabase migration list
```

### 2. **Appliquer les migrations**
```bash
supabase db push
```

### 3. **Vérifier la base de données**
```bash
# Accéder au Studio
open http://localhost:54323

# Ou via CLI
supabase db reset
```

## 🧪 Test de la Configuration

### 1. **Démarrer l'application**
```bash
cd apps/web
npm run dev
```

### 2. **Tester la connexion**
- Allez sur http://localhost:3000
- Vérifiez que l'application se charge
- Testez la connexion/déconnexion

### 3. **Tester les fonctionnalités**
- Création d'événements
- Participation aux événements
- Gestion des jeux

## 🔧 Commandes Utiles

### **Gestion de Supabase Local**
```bash
# Démarrer
supabase start

# Arrêter
supabase stop

# Redémarrer
supabase restart

# Statut
supabase status

# Logs
supabase logs
```

### **Gestion de la Base de Données**
```bash
# Appliquer les migrations
supabase db push

# Réinitialiser la base
supabase db reset

# Sauvegarder
supabase db dump

# Restaurer
supabase db restore
```

### **Gestion des Migrations**
```bash
# Créer une nouvelle migration
supabase migration new nom_de_la_migration

# Lister les migrations
supabase migration list

# Appliquer les migrations
supabase db push
```

## 🐛 Résolution des Problèmes

### **Problème : Docker n'est pas démarré**
```bash
# Démarrer Docker Desktop
# Vérifier que Docker fonctionne
docker --version
docker ps
```

### **Problème : Ports occupés**
```bash
# Vérifier les ports utilisés
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Arrêter Supabase et redémarrer
supabase stop
supabase start
```

### **Problème : Migrations en erreur**
```bash
# Réinitialiser la base
supabase db reset

# Appliquer les migrations une par une
supabase db push
```

### **Problème : Connexion à la base**
```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Vérifier le statut
supabase status
```

## 📊 Avantages de Supabase Local

### **Développement**
- ✅ **Développement offline** : Pas besoin d'internet
- ✅ **Données locales** : Contrôle total des données
- ✅ **Tests rapides** : Reset facile de la base
- ✅ **Debugging** : Accès direct à la base de données

### **Performance**
- ✅ **Rapide** : Pas de latence réseau
- ✅ **Fiable** : Pas de problèmes de connexion
- ✅ **Sécurisé** : Données locales uniquement

### **Fonctionnalités**
- ✅ **Studio local** : Interface d'administration
- ✅ **Emails locaux** : Inbucket pour les emails
- ✅ **Migrations** : Gestion des versions
- ✅ **RLS** : Politiques de sécurité

## 🚀 Prochaines Étapes

Une fois Supabase local configuré :

1. **Testez** la création d'événements
2. **Testez** la participation aux événements
3. **Testez** la gestion des jeux
4. **Déployez** en production quand prêt

## 📚 Ressources

- **Documentation Supabase** : https://supabase.com/docs
- **Supabase CLI** : https://supabase.com/docs/guides/cli
- **Docker Desktop** : https://www.docker.com/products/docker-desktop

---

**Status** : 🚀 **PRÊT** - Configuration de Supabase local
**Date** : 24 Janvier 2025
**Version** : 1.0.0

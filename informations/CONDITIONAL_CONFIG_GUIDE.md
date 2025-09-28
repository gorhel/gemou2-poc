# 🔧 Guide de Configuration Conditionnelle Supabase

## 📋 Configuration Implémentée

Votre projet utilise maintenant une **configuration conditionnelle** qui permet de basculer entre Supabase Cloud et Supabase Local selon vos besoins.

## 🎯 Comment ça fonctionne

### **1. Configuration par défaut : Supabase Cloud**
- ✅ **Utilise votre base cloud** par défaut
- ✅ **Données réelles** partagées
- ✅ **Pas de configuration locale** nécessaire

### **2. Basculement vers Supabase Local (optionnel)**
- 🔄 **Variable d'environnement** : `NEXT_PUBLIC_USE_SUPABASE_LOCAL=true`
- 🔄 **Configuration automatique** vers local
- 🔄 **Développement offline** possible

## 🚀 Configuration Rapide

### **Étape 1 : Créer le fichier .env.local**
```bash
cd /Users/essykouame/Downloads/gemou2-poc
./create-env-local.sh
```

### **Étape 2 : Tester la connexion**
```bash
node test-supabase-cloud.js
```

### **Étape 3 : Démarrer l'application**
```bash
cd apps/web
npm run dev
```

## 🔧 Configuration Détaillée

### **Fichier .env.local (Cloud par défaut)**
```bash
# Supabase Cloud Configuration (par défaut)
NEXT_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration Supabase Local (optionnel)
# NEXT_PUBLIC_USE_SUPABASE_LOCAL=true
# NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=your-local-anon-key
```

### **Code de configuration conditionnelle**
```typescript
// lib/supabase-client.ts
const getSupabaseConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useLocal = process.env.NEXT_PUBLIC_USE_SUPABASE_LOCAL === 'true';
  
  if (isDevelopment && useLocal) {
    // Configuration Supabase Local
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL || 'http://localhost:54321',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL || 'local-anon-key'
    };
  } else {
    // Configuration Supabase Cloud (par défaut)
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qpnofwgxjgvmpwdrhzid.supabase.co',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
    };
  }
};
```

## 🎮 Modes de Fonctionnement

### **Mode 1 : Cloud Only (Recommandé pour commencer)**
```bash
# Configuration par défaut
NEXT_PUBLIC_USE_SUPABASE_LOCAL=false  # ou non défini
```
- ✅ **Utilise Supabase Cloud**
- ✅ **Données réelles**
- ✅ **Configuration simple**

### **Mode 2 : Local Only**
```bash
# Configuration pour Supabase Local
NEXT_PUBLIC_USE_SUPABASE_LOCAL=true
NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=your-local-anon-key
```
- ✅ **Développement offline**
- ✅ **Données locales**
- ✅ **Performance locale**

### **Mode 3 : Hybride (Avancé)**
```bash
# Basculement automatique selon l'environnement
NODE_ENV=development  # Utilise local si configuré
NODE_ENV=production   # Utilise toujours cloud
```

## 🔄 Basculement entre les Modes

### **Pour utiliser Supabase Cloud (par défaut)**
```bash
# Dans .env.local
NEXT_PUBLIC_USE_SUPABASE_LOCAL=false
# ou supprimez la ligne
```

### **Pour utiliser Supabase Local**
```bash
# Dans .env.local
NEXT_PUBLIC_USE_SUPABASE_LOCAL=true
NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=your-local-anon-key
```

### **Pour basculer dynamiquement**
```bash
# Utiliser Cloud
NEXT_PUBLIC_USE_SUPABASE_LOCAL=false npm run dev

# Utiliser Local
NEXT_PUBLIC_USE_SUPABASE_LOCAL=true npm run dev
```

## 🧪 Tests et Vérification

### **Test de la configuration Cloud**
```bash
node test-supabase-cloud.js
```

### **Test de la configuration Local**
```bash
node test-supabase-local.js
```

### **Vérification dans l'application**
```bash
cd apps/web
npm run dev
# Regardez la console pour voir le mode utilisé
```

## 📊 Logs de Configuration

L'application affiche dans la console (mode développement) :
```
🔧 Configuration Supabase: {
  url: "https://qpnofwgxjgvmpwdrhzid.supabase.co",
  mode: "CLOUD"
}
```

ou

```
🔧 Configuration Supabase: {
  url: "http://localhost:54321",
  mode: "LOCAL"
}
```

## 🎯 Avantages de cette Configuration

### **Pour le Développement**
- ✅ **Flexibilité** : Basculement facile entre modes
- ✅ **Performance** : Local pour le développement rapide
- ✅ **Données réelles** : Cloud pour les tests avec de vraies données

### **Pour la Production**
- ✅ **Simplicité** : Toujours Cloud en production
- ✅ **Fiabilité** : Pas de dépendance locale
- ✅ **Déploiement** : Configuration identique partout

### **Pour l'Équipe**
- ✅ **Collaboration** : Même base de données
- ✅ **Cohérence** : Configuration partagée
- ✅ **Flexibilité** : Chacun peut choisir son mode

## 🚀 Prochaines Étapes

### **1. Configuration initiale**
```bash
./create-env-local.sh
node test-supabase-cloud.js
```

### **2. Test de l'application**
```bash
cd apps/web
npm run dev
```

### **3. Test des fonctionnalités**
- Création d'événements
- Participation aux événements
- Gestion des jeux

### **4. Configuration Local (optionnel)**
```bash
# Si vous voulez utiliser Supabase Local
supabase start
./setup-env-local.sh
```

## 🔧 Résolution des Problèmes

### **Problème : Connexion échouée**
```bash
# Vérifier les variables d'environnement
cat .env.local

# Tester la connexion
node test-supabase-cloud.js
```

### **Problème : Mode incorrect**
```bash
# Vérifier la configuration
echo $NEXT_PUBLIC_USE_SUPABASE_LOCAL

# Forcer le mode Cloud
NEXT_PUBLIC_USE_SUPABASE_LOCAL=false npm run dev
```

### **Problème : Tables manquantes**
```bash
# Appliquer les migrations
# Via Dashboard Supabase ou CLI
```

---

**Status** : ✅ **CONFIGURÉ** - Configuration conditionnelle implémentée
**Date** : 24 Janvier 2025
**Version** : 1.0.0

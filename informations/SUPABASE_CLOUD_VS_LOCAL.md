# 🔄 Supabase Cloud vs Local - Guide de Configuration

## 📋 Votre Situation Actuelle

Vous avez **déjà une base de données Supabase cloud** et vous voulez savoir comment configurer le développement local. Voici les options :

## 🎯 Options Disponibles

### **Option 1 : Développement avec Supabase Cloud (Recommandée)**
- ✅ **Utilise votre base cloud existante**
- ✅ **Pas de configuration locale complexe**
- ✅ **Données réelles partagées**
- ✅ **Déploiement simplifié**

### **Option 2 : Supabase Local + Synchronisation**
- ✅ **Développement offline**
- ✅ **Données locales**
- ⚠️ **Configuration plus complexe**
- ⚠️ **Synchronisation manuelle nécessaire**

### **Option 3 : Hybride (Cloud + Local)**
- ✅ **Développement local + production cloud**
- ✅ **Meilleur des deux mondes**
- ⚠️ **Configuration avancée**

## 🚀 Option 1 : Développement avec Supabase Cloud (Recommandée)

### **Avantages :**
- ✅ **Configuration simple** : Pas de Docker, pas de CLI
- ✅ **Données réelles** : Même base que la production
- ✅ **Collaboration** : Équipe partage les mêmes données
- ✅ **Déploiement** : Pas de synchronisation nécessaire

### **Configuration :**

#### 1. **Récupérer les clés de votre projet cloud**
```bash
# Allez sur https://supabase.com
# Sélectionnez votre projet
# Allez dans Settings > API
# Copiez les clés
```

#### 2. **Créer le fichier .env.local**
```bash
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3. **Tester la connexion**
```bash
cd apps/web
npm run dev
```

### **Script de configuration automatique :**
```bash
# Créer le fichier .env.local avec vos clés cloud
cat > .env.local << EOF
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

## 🔧 Option 2 : Supabase Local + Synchronisation

### **Quand utiliser :**
- 🔒 **Données sensibles** : Développement avec données de test
- 🚀 **Performance** : Développement plus rapide
- 🧪 **Tests** : Tests automatisés
- 🔄 **Migrations** : Tests de migrations

### **Configuration :**

#### 1. **Installer Supabase local**
```bash
# Installation
brew install supabase/tap/supabase

# Initialisation
supabase init

# Démarrage
supabase start
```

#### 2. **Synchroniser avec le cloud**
```bash
# Lier au projet cloud
supabase link --project-ref your-project-ref

# Appliquer les migrations
supabase db push
```

#### 3. **Configuration hybride**
```bash
# Variables d'environnement pour le développement
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
SUPABASE_SERVICE_ROLE_KEY=local-service-role-key
```

## 🎯 Option 3 : Hybride (Recommandée pour votre cas)

### **Configuration :**

#### 1. **Variables d'environnement conditionnelles**
```bash
# .env.local
# Mode développement (local ou cloud)
NODE_ENV=development

# Supabase Local (pour le développement)
NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=local-anon-key

# Supabase Cloud (pour la production)
NEXT_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2OTk2MywiZXhwIjoyMDY5MDQ1OTYzfQ.bIXUwndp8BDm6-q49J05hq4tt-V57v1GKxzLBG8TTvI
```

#### 2. **Configuration conditionnelle dans le code**
```typescript
// lib/supabase-client.ts
const supabaseUrl = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL || process.env.NEXT_PUBLIC_SUPABASE_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

## 📊 Comparaison des Options

| Aspect | Cloud Only | Local Only | Hybride |
|--------|------------|------------|---------|
| **Configuration** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Données réelles** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| **Développement offline** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Collaboration** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Déploiement** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Recommandation pour Votre Cas

### **Pour commencer rapidement :**
**Option 1 (Cloud Only)** - Utilisez votre base cloud existante

### **Pour un développement avancé :**
**Option 3 (Hybride)** - Local pour le développement, Cloud pour la production

## 🔧 Script de Configuration Hybride

```bash
#!/bin/bash
# Configuration hybride Supabase

echo "🔧 Configuration hybride Supabase..."

# Vérifier si Supabase local est disponible
if supabase status &> /dev/null; then
    echo "✅ Supabase local détecté"
    USE_LOCAL=true
else
    echo "⚠️  Supabase local non disponible, utilisation du cloud"
    USE_LOCAL=false
fi

# Créer le fichier .env.local
if [ "$USE_LOCAL" = true ]; then
    echo "📝 Configuration pour Supabase local..."
    cat > .env.local << EOF
# Supabase Local Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=\$(supabase status | grep "anon key" | awk '{print \$3}')
SUPABASE_SERVICE_ROLE_KEY=\$(supabase status | grep "service_role key" | awk '{print \$3}')
EOF
else
    echo "📝 Configuration pour Supabase cloud..."
    echo "Veuillez configurer manuellement vos clés cloud dans .env.local"
fi

echo "✅ Configuration terminée !"
```

## 🚀 Prochaines Étapes

### **Option 1 (Cloud) :**
1. **Configurez** vos clés cloud dans `.env.local`
2. **Testez** la connexion
3. **Démarrez** le développement

### **Option 3 (Hybride) :**
1. **Installez** Supabase local
2. **Configurez** les variables d'environnement
3. **Testez** les deux modes
4. **Déployez** selon le mode

---

**Recommandation** : Commencez par l'**Option 1 (Cloud)** pour un démarrage rapide, puis passez à l'**Option 3 (Hybride)** si vous avez besoin de développement local.

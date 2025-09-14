# 🗄️ Configuration Supabase - Guide Complet

## 🎯 Étapes de Configuration

### 1. Créer un Projet Supabase

1. **Aller sur** [supabase.com](https://supabase.com)
2. **Se connecter** ou créer un compte
3. **Cliquer** sur "New Project"
4. **Remplir** :
   - Name: `gemou2-poc`
   - Database Password: (générer un mot de passe fort)
   - Region: Europe West (ou proche de vous)
5. **Attendre** la création du projet (2-3 minutes)

### 2. Récupérer les Clés

1. **Dans votre projet Supabase**, aller dans `Settings > API`
2. **Copier** :
   - Project URL
   - anon public key

### 3. Configurer les Variables d'Environnement

```bash
# Dans le dossier gemou2-poc
cp .env.example .env.local
```

**Éditer `.env.local`** avec vos vraies clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici

EXPO_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

### 4. Appliquer le Schema de Base de Données

#### Option A : Via l'Interface Supabase (Recommandé)

1. **Aller** dans `SQL Editor` dans votre projet Supabase
2. **Copier-coller** le contenu de `supabase/migrations/20240101000001_initial_schema.sql`
3. **Cliquer** sur "Run"
4. **Vérifier** que toutes les tables sont créées dans `Database > Tables`

#### Option B : Via CLI Supabase (Avancé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref your-project-id

# Appliquer migrations
supabase db push
```

### 5. Configurer l'Authentification

1. **Dans Supabase**, aller dans `Authentication > Settings`
2. **Site URL** : `http://localhost:3000` (pour dev)
3. **Redirect URLs** : 
   - `http://localhost:3000/**`
   - `exp://localhost:8081/**` (pour mobile)

#### Providers Sociaux (Optionnel)

**Google** :
1. Aller dans `Authentication > Providers`
2. Activer Google
3. Configurer avec Client ID et Client Secret

**Facebook** :
1. Même processus avec les clés Facebook

### 6. Tester la Configuration

```bash
# Lancer l'app web
npm run dev:web

# Dans un autre terminal, lancer l'app mobile  
npm run dev:mobile
```

## 🗃️ Structure de la Base de Données

### Tables Créées

- **`profiles`** - Profils utilisateurs
- **`events`** - Événements jeux de société
- **`event_participants`** - Participants aux événements
- **`messages`** - Système de messagerie
- **`marketplace_items`** - Annonces marketplace

### Sécurité

- ✅ **Row Level Security (RLS)** activé sur toutes les tables
- ✅ **Politiques d'accès** configurées
- ✅ **Trigger automatique** création profil utilisateur
- ✅ **Timestamps** automatiques (created_at, updated_at)

## 🔧 Commandes Utiles

```bash
# Vérifier la configuration
npm run type-check

# Tester la connexion DB (à créer)
npm run db:test

# Réinitialiser les données locales
supabase db reset  # Si CLI installé
```

## 🐛 Résolution de Problèmes

### Erreur "Invalid API Key"
- ✅ Vérifier que `.env.local` existe
- ✅ Vérifier les clés dans Supabase > Settings > API
- ✅ Redémarrer les serveurs dev

### Tables non créées
- ✅ Exécuter le SQL dans Supabase SQL Editor
- ✅ Vérifier les permissions (doit être Owner du projet)
- ✅ Regarder les erreurs dans l'onglet SQL Editor

### Auth ne fonctionne pas
- ✅ Vérifier Site URL et Redirect URLs
- ✅ Tester avec email/password d'abord
- ✅ Configurer les providers sociaux séparément

## ✅ Checklist Validation

- [ ] Projet Supabase créé
- [ ] Clés copiées dans `.env.local`
- [ ] Schema SQL exécuté avec succès
- [ ] Tables visibles dans Database > Tables
- [ ] Authentication configurée (Site URL)
- [ ] `npm run dev:web` fonctionne
- [ ] `npm run dev:mobile` fonctionne
- [ ] Pas d'erreurs dans la console

## 🚀 Prochaines Étapes

Une fois Supabase configuré :
1. **Créer** les composants d'authentification
2. **Tester** inscription/connexion
3. **Implémenter** les features (événements, messages, etc.)

---

**💡 Conseil** : Gardez vos clés Supabase secrètes et ne les commitez jamais dans Git !

**🆘 Support** : En cas de problème, vérifiez la [documentation Supabase](https://supabase.com/docs)
# 📁 Dossier Informations

Ce dossier contient tous les fichiers de documentation, scripts de test et outils de développement qui ne sont **pas essentiels** au fonctionnement du projet en production.

## 📋 Contenu du Dossier

### 📄 **Documentation**
- `APPLICATION_STATUS.md` - État de l'application
- `CORRECTION_COMPTEUR_PARTICIPANTS.md` - Correction du compteur de participants
- `CORRECTION_TIMELINE_STABILITY.md` - Correction de la stabilité de la timeline
- `DATABASE_UPDATE_GUIDE.md` - Guide de mise à jour de la base de données
- `DEPLOYMENT_SUMMARY.md` - Résumé du déploiement
- `EVENT_CREATION_SUMMARY.md` - Résumé de la création d'événements
- `GAMES_RECOMMENDATIONS_SUMMARY.md` - Résumé des recommandations de jeux
- `GUIDE_APPLICATION_MIGRATION.md` - Guide d'application des migrations
- `MIGRATION_ADAPTATIVE_SUMMARY.md` - Résumé des migrations adaptatives
- `PARTICIPATION_FIX_FINAL.md` - Correction finale de la participation
- `SOLUTION_FINALE.md` - Solution finale
- `SUPABASE_LOCAL_SETUP.md` - Configuration locale de Supabase
- Et d'autres documents de documentation...

### 🧪 **Scripts de Test**
- `test-*.js` - Tous les scripts de test
- `check-*.js` - Scripts de vérification
- `debug-*.js` - Scripts de débogage
- `validate-*.js` - Scripts de validation

### 🔧 **Scripts de Développement**
- `apply-*.sh` - Scripts d'application de migrations
- `fix-*.sh` - Scripts de correction
- `setup-*.sh` - Scripts de configuration
- `deploy.sh` - Script de déploiement
- `clean-and-restart.sh` - Script de nettoyage et redémarrage

### 📊 **Fichiers SQL**
- `check-*.sql` - Requêtes de vérification SQL

## 🎯 **Utilisation**

Ces fichiers peuvent être utilisés pour :
- **Développement** : Scripts de test et de débogage
- **Maintenance** : Scripts de correction et de migration
- **Documentation** : Guides et résumés de fonctionnalités
- **Déploiement** : Scripts de configuration et de déploiement

## ⚠️ **Important**

- Ces fichiers ne sont **pas nécessaires** au fonctionnement du projet
- Ils peuvent être supprimés sans affecter l'application
- Ils sont conservés pour référence et maintenance future

## 📁 **Structure Recommandée**

Pour un projet propre, seuls ces fichiers devraient rester à la racine :
- `package.json` et `package-lock.json`
- `README.md`
- `turbo.json`
- `vercel.json`
- `eas.json`
- Dossiers `apps/`, `packages/`, `supabase/`, `docs/`
- `node_modules/`

Tous les autres fichiers de documentation et de test sont maintenant organisés dans ce dossier `informations/`.


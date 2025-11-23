# Paramétrages du Profil Utilisateur - Version Mobile

**Date de création :** 2025-11-22  
**Description :** Implémentation complète des paramètres utilisateur sur mobile (React Native)

## 📋 Vue d'ensemble

Cette documentation décrit l'implémentation des paramètres utilisateur sur l'application mobile React Native. Les paramètres permettent à l'utilisateur de gérer sa confidentialité, ses notifications, sa sécurité et ses préférences.

## 🗂️ Structure des composants

### Composants créés

```
apps/mobile/components/profile/
├── PrivacySettings.tsx         # Paramètres de confidentialité
├── NotificationsSettings.tsx   # Paramètres de notifications
├── SecuritySettings.tsx        # Paramètres de sécurité
├── PreferencesSettings.tsx     # Préférences d'application
└── index.ts                    # Exports des composants
```

## 🔒 PrivacySettings (Confidentialité)

### Fonctionnalités

- **Visibilité du profil** : public, amis uniquement, privé
- **Autoriser les demandes d'amitié** : tout le monde, amis d'amis uniquement
- **Visibilité de l'email** : privé, amis uniquement, public
- **Visibilité de la localisation** : privé, amis uniquement, public
- **Visibilité de la collection de jeux** : public, amis uniquement, privé
- **Liste d'amis publique** : toggle pour rendre la liste visible par tous

### Données

- Charge depuis `user_settings` (nouvelle table)
- Synchronise `friends_list_public` avec `profiles` (rétrocompatibilité)

### Interface

- Sélecteurs de visibilité avec options cliquables
- Switch pour la liste d'amis publique
- Messages de succès/erreur
- Indicateur de chargement

## 🔔 NotificationsSettings (Notifications)

### Fonctionnalités

Gestion des notifications par catégorie et canal :

1. **Demandes d'amitié** : In-app, Push, Email
2. **Acceptations d'amitié** : In-app, Push, Email
3. **Événements** : In-app, Push, Email
4. **Invitations d'événements** : In-app, Push, Email
5. **Rappels d'événements** : In-app, Push, Email
6. **Messages** : In-app, Push, Email
7. **Réponses aux messages** : In-app, Push, Email

### Données

- Charge depuis `user_settings`
- Crée un enregistrement par défaut si inexistant
- Met à jour en temps réel chaque paramètre

### Interface

- Sections organisées par catégorie
- Switch par canal (In-app, Push, Email)
- Mise à jour instantanée

## 🔐 SecuritySettings (Sécurité)

### Fonctionnalités

- **Changer le mot de passe** :
  - Validation : minimum 6 caractères
  - Vérification de correspondance
  - Mise à jour via Supabase Auth
  
- **Supprimer le compte** :
  - Confirmation avant suppression
  - Suppression des données publiques
  - Déconnexion automatique

### Interface

- Formulaire de changement de mot de passe avec masquage
- Bouton de suppression dans zone dangereuse
- Alertes de confirmation

## ⚙️ PreferencesSettings (Préférences)

### Fonctionnalités

- **Langue** : Français, English, Español, Deutsch, Italiano
- **Format de date** : DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- **Unité de distance** : Kilomètres, Miles
- **Thème** : Automatique, Clair, Sombre
- **Fuseau horaire** : Affiché (automatique selon localisation)

### Données

- Charge depuis `user_settings`
- Crée un enregistrement par défaut si inexistant
- Valeurs par défaut : FR, DD/MM/YYYY, km, auto, Europe/Paris

### Interface

- Sélecteurs avec options cliquables
- Affichage de la valeur actuelle
- Informations d'aide

## 📱 Intégration dans la page Profile

### Modifications apportées

**Fichier :** `apps/mobile/app/(tabs)/profile/index.tsx`

1. **Nouveaux onglets ajoutés** :
   - Informations
   - Amis (existant)
   - Confidentialité
   - Notifications (nouveau)
   - Sécurité (nouveau)
   - Préférences (nouveau)
   - Compte

2. **Intégration des composants** :
   ```tsx
   {activeTab === 'privacy' && (
     <PrivacySettings userId={user?.id || ''} onUpdate={loadProfile} />
   )}
   
   {activeTab === 'notifications' && (
     <NotificationsSettings userId={user?.id || ''} onUpdate={loadProfile} />
   )}
   
   {activeTab === 'security' && (
     <SecuritySettings userId={user?.id || ''} onUpdate={loadProfile} />
   )}
   
   {activeTab === 'preferences' && (
     <PreferencesSettings userId={user?.id || ''} onUpdate={loadProfile} />
   )}
   ```

3. **Section Informations** :
   - Affichage des informations du profil (lecture seule pour mobile)
   - Username, nom complet, bio, ville
   - Message indiquant d'utiliser l'app web pour modifier

4. **Section Compte** :
   - Email
   - Date d'inscription

## 🗄️ Base de données

### Table `user_settings`

Tous les paramètres sont stockés dans la table `user_settings` créée par la migration `20251122153031_create_user_settings_table.sql`.

**Politiques RLS :**
- ✅ Utilisateurs peuvent voir leurs propres paramètres
- ✅ Utilisateurs peuvent créer leurs propres paramètres
- ✅ Utilisateurs peuvent mettre à jour leurs propres paramètres

**Trigger :**
- ✅ Création automatique des paramètres par défaut lors de la création d'un profil
- ✅ Mise à jour automatique de `updated_at`

## 🎨 Styles et UX

### Design cohérent

- Sections avec ombres et bordures arrondies
- Messages de succès/erreur avec couleurs appropriées
- Indicateurs de chargement
- Navigation par onglets horizontale scrollable

### Accessibilité

- Taille de police lisible
- Contraste approprié
- Feedback visuel sur les actions
- Messages d'erreur clairs

## 🔄 Synchronisation

### Rétrocompatibilité

- Les paramètres de notifications existants dans `profiles` sont migrés vers `user_settings`
- `friends_list_public` reste dans `profiles` pour compatibilité
- Les deux tables sont synchronisées lors des mises à jour

### Migration des données

La migration SQL synchronise automatiquement :
- `notify_friend_request_*` depuis `profiles` vers `user_settings`
- `notify_friend_accepted_*` depuis `profiles` vers `user_settings`

## 🚀 Utilisation

### Accès aux paramètres

1. Naviguer vers l'onglet **Profil**
2. Utiliser les onglets horizontaux pour naviguer entre les sections
3. Modifier les paramètres souhaités
4. Les modifications sont sauvegardées automatiquement

### Callbacks

Tous les composants acceptent un callback `onUpdate` qui est appelé après une mise à jour réussie pour rafraîchir les données de la page.

## 📝 Notes importantes

### Limitations

- **Modification du profil** : Pour modifier le profil (avatar, nom, bio), il faut utiliser l'application web (pour le moment)
- **Sessions actives** : La gestion des sessions actives n'est pas encore implémentée sur mobile
- **Thème** : Le thème est stocké mais l'application du thème n'est pas encore implémentée

### À venir

- Upload d'avatar sur mobile
- Application du thème selon les préférences
- Gestion des sessions actives
- Export des données utilisateur

## 🔗 Fichiers modifiés/créés

### Nouveaux fichiers

- `apps/mobile/components/profile/PrivacySettings.tsx`
- `apps/mobile/components/profile/NotificationsSettings.tsx`
- `apps/mobile/components/profile/SecuritySettings.tsx`
- `apps/mobile/components/profile/PreferencesSettings.tsx`
- `apps/mobile/components/profile/index.ts`

### Fichiers modifiés

- `apps/mobile/app/(tabs)/profile/index.tsx`

### Base de données

- `supabase/migrations/20251122153031_create_user_settings_table.sql` (déjà créée)
- `packages/database/types.ts` (déjà mis à jour)

## ✅ Tests à effectuer

1. ✅ Chargement des paramètres existants
2. ✅ Création de paramètres par défaut pour nouveaux utilisateurs
3. ✅ Mise à jour de chaque paramètre individuel
4. ✅ Messages de succès/erreur
5. ✅ Navigation entre les onglets
6. ⚠️ Changement de mot de passe (nécessite connexion Supabase Auth)
7. ⚠️ Suppression de compte (à tester avec précaution)

## 📚 Références

- Documentation Supabase : [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Migration SQL : `supabase/migrations/20251122153031_create_user_settings_table.sql`
- Types TypeScript : `packages/database/types.ts`

---

**Auteur :** Assistant IA  
**Date :** 2025-11-22  
**Version :** 1.0.0


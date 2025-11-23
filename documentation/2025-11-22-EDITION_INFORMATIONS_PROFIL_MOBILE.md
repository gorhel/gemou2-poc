# Édition des Informations de Profil sur Mobile

## 📋 Résumé

Implémentation de la fonctionnalité d'édition des informations utilisateur directement depuis l'application mobile sur la page `/profile`, section "Mes infos".

## 🎯 Objectifs

- Permettre l'édition des informations utilisateur (username, full_name, bio, city) sur mobile
- Valider l'unicité du nom d'utilisateur avant sauvegarde
- Afficher une alerte de confirmation avant d'enregistrer les modifications
- Gérer les erreurs et les états de chargement

## 🔧 Modifications Apportées

### Fichier Modifié

- `apps/mobile/app/(tabs)/profile/index.tsx`

### Changements Principaux

#### 1. Imports Ajoutés

```typescript
import { Input, Textarea } from '../../../components/ui/Input'
```

#### 2. Nouveaux États

```typescript
// États pour l'édition des informations
const [editFormData, setEditFormData] = useState({
  username: '',
  full_name: '',
  bio: '',
  city: ''
});
const [editErrors, setEditErrors] = useState<Record<string, string>>({});
const [isCheckingUsername, setIsCheckingUsername] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [hasChanges, setHasChanges] = useState(false);
```

#### 3. Initialisation du Formulaire

Lors de l'ouverture de la section "Mes infos", le formulaire est initialisé avec les valeurs actuelles du profil :

```typescript
if (section === 'informations' && profile) {
  setEditFormData({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    city: profile.city || ''
  });
  setEditErrors({});
  setHasChanges(false);
}
```

#### 4. Vérification d'Unicité du Username

Fonction `checkUsernameAvailability` qui :
- Vérifie si le username a changé (pas de vérification si identique)
- Valide la longueur minimale (3 caractères)
- Valide le format (lettres, chiffres, tirets et underscores uniquement)
- Vérifie l'unicité en base de données via Supabase

```typescript
const checkUsernameAvailability = async (username: string, currentUsername?: string) => {
  // Si le username n'a pas changé, pas besoin de vérifier
  if (username === currentUsername) {
    return { available: true };
  }

  if (username.length < 3) {
    return { available: false, error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
  }

  // Validation du format
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { available: false, error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores' };
  }

  // Vérification en base de données
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  // Gestion des erreurs...
}
```

#### 5. Sauvegarde avec Confirmation

La fonction `handleSaveProfile` :
1. Valide les champs du formulaire
2. Vérifie l'unicité du username si modifié
3. Affiche une alerte de confirmation
4. Sauvegarde en base de données si confirmé
5. Recharge le profil et ferme la modale en cas de succès

```typescript
const handleSaveProfile = async () => {
  // Validation...
  // Vérification username...
  
  // Alerte de confirmation
  Alert.alert(
    'Confirmer la modification',
    'Êtes-vous sûr de vouloir enregistrer ces modifications ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        onPress: async () => {
          // Sauvegarde en base...
        }
      }
    ]
  );
};
```

#### 6. Gestion des Changements

La fonction `handleFormChange` :
- Met à jour les données du formulaire
- Réinitialise les erreurs du champ modifié
- Détecte si des changements ont été apportés
- Active/désactive le bouton "Valider" en conséquence

#### 7. Interface Utilisateur

Le formulaire remplace l'affichage en lecture seule et comprend :
- **Input** pour le nom d'utilisateur (avec validation en temps réel)
- **Input** pour le nom complet
- **Textarea** pour la bio
- **Input** pour la ville
- Message d'aide indiquant les modifications en cours
- Bouton "Valider" désactivé si aucun changement

## 📊 Structure des Composants

```
ProfilePage
├── États de gestion
│   ├── editFormData (données du formulaire)
│   ├── editErrors (erreurs de validation)
│   ├── isCheckingUsername (vérification en cours)
│   ├── isSaving (sauvegarde en cours)
│   └── hasChanges (détection de modifications)
├── Fonctions
│   ├── handleSectionClick (initialise le formulaire)
│   ├── handleFormChange (gère les changements)
│   ├── checkUsernameAvailability (vérifie l'unicité)
│   └── handleSaveProfile (sauvegarde avec confirmation)
└── Interface
    └── Modal "Mes infos"
        └── Formulaire éditable
            ├── Input (username)
            ├── Input (full_name)
            ├── Textarea (bio)
            └── Input (city)
```

## 🔒 Sécurité et Validation

### Validation du Username

1. **Longueur minimale** : 3 caractères
2. **Format** : Uniquement lettres, chiffres, tirets (`-`) et underscores (`_`)
3. **Unicité** : Vérification en base de données avant sauvegarde
4. **Pas de vérification** si le username n'a pas changé

### Gestion des Erreurs

- Erreurs de validation affichées sous chaque champ
- Gestion des erreurs de contrainte unique (code 23505)
- Messages d'erreur clairs et en français
- États de chargement pour améliorer l'UX

## 🎨 Expérience Utilisateur

### Flux Utilisateur

1. L'utilisateur clique sur "Mes infos"
2. La modale s'ouvre avec le formulaire pré-rempli
3. L'utilisateur modifie les champs souhaités
4. Le bouton "Valider" s'active automatiquement si des changements sont détectés
5. Lors du clic sur "Valider" :
   - Validation des champs
   - Vérification de l'unicité du username (si modifié)
   - Affichage d'une alerte de confirmation
   - Sauvegarde en base si confirmé
   - Rechargement du profil et fermeture de la modale

### États Visuels

- **Champs désactivés** pendant la sauvegarde
- **Message d'aide** indiquant les modifications en cours
- **Bouton "Valider"** désactivé si aucun changement
- **Indicateur de chargement** pendant la vérification du username
- **Messages d'erreur** contextuels sous chaque champ

## 🧪 Tests à Effectuer

1. ✅ Modification du nom d'utilisateur (avec vérification d'unicité)
2. ✅ Modification des autres champs (full_name, bio, city)
3. ✅ Tentative d'utiliser un username déjà existant
4. ✅ Annulation des modifications
5. ✅ Validation avec des champs vides
6. ✅ Gestion des erreurs réseau
7. ✅ Rechargement du profil après sauvegarde

## 📝 Notes Techniques

- Utilisation des composants `Input` et `Textarea` existants
- Intégration avec Supabase pour la vérification et la sauvegarde
- Gestion asynchrone des opérations
- Détection automatique des changements pour optimiser l'UX
- Respect des contraintes de la base de données (unicité du username)

## 🔄 Compatibilité

- ✅ Mobile (React Native)
- ⚠️ Web : Non implémenté (utilise toujours l'application web comme indiqué précédemment)

## 🚀 Prochaines Étapes Possibles

- [ ] Ajouter une vérification en temps réel du username (debounce)
- [ ] Implémenter la même fonctionnalité sur la version web
- [ ] Ajouter la possibilité de modifier l'avatar
- [ ] Ajouter des validations supplémentaires (longueur max, caractères spéciaux, etc.)


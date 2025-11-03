# Guide d'Implémentation - Fichiers Restants

**Date** : 31 octobre 2025  
**Statut** : ✅ Pattern établi - À compléter

---

## 📊 État d'Avancement

### ✅ Terminé (100%)

| Composant | Fichier | Actions | Statut |
|-----------|---------|---------|--------|
| Modal | `components/ui/ConfirmationModal.tsx` | - | ✅ Créé |
| Amis - Recherche | `components/friends/UserSearchBar.tsx` | Envoyer demande | ✅ |
| Amis - Demandes reçues | `components/friends/FriendRequestCard.tsx` | Accepter/Refuser | ✅ |
| Amis - Demandes envoyées | `components/friends/SentRequestCard.tsx` | Annuler | ✅ |
| Amis - Liste | `components/friends/FriendCard.tsx` | Retirer | ✅ |
| Événements - Création | `app/(tabs)/create-event.tsx` | Créer/Modifier | ✅ |
| Événements - Détails | `app/(tabs)/events/[id].tsx` | Participer/Quitter | ✅ |

### ⏳ À Compléter (3 fichiers)

| Fichier | Actions à intégrer | Complexité |
|---------|-------------------|------------|
| `app/(tabs)/create-trade.tsx` | Publier, Mettre à jour | ⭐⭐ Facile |
| `app/trade/[id].tsx` | Contacter, Modifier, Supprimer | ⭐⭐ Facile |
| `app/(tabs)/profile/index.tsx` | Déconnexion, Enregistrer infos | ⭐ Très facile |

---

## 🔧 Pattern Exact à Suivre

### Étape 1 : Imports

```typescript
// Retirer Alert des imports
import { ... } from 'react-native'  // Supprimer Alert

// Ajouter ConfirmationModal
import { ConfirmationModal, ModalVariant } from '../../components/ui'
```

### Étape 2 : États (après les autres useState)

```typescript
const [modalVisible, setModalVisible] = useState(false)
const [modalConfig, setModalConfig] = useState<{
  variant: ModalVariant
  title: string
  message: string
}>({
  variant: 'success',
  title: '',
  message: ''
})
```

### Étape 3 : Remplacer Alert.alert()

**Avant** :
```typescript
Alert.alert('Succès', 'Action réussie')
```

**Après** :
```typescript
setModalConfig({
  variant: 'success',
  title: 'Succès',
  message: 'Action réussie'
})
setModalVisible(true)
```

### Étape 4 : Ajouter la Modal dans le JSX (avant le dernier `</View>` ou `</ScrollView>`)

```typescript
<ConfirmationModal
  visible={modalVisible}
  variant={modalConfig.variant}
  title={modalConfig.title}
  message={modalConfig.message}
  onClose={() => setModalVisible(false)}
/>
```

---

## 📝 Fichier 1 : `create-trade.tsx`

### Localisations des Alert.alert() à remplacer

1. **Ligne ~162-166** - Succès modification
```typescript
// AVANT
Alert.alert(
  'Succès !',
  'Votre annonce a été mise à jour',
  [{ text: 'OK', onPress: () => router.push(`/trade/${data.id}`) }]
)

// APRÈS
setModalConfig({
  variant: 'success',
  title: 'Annonce mise à jour',
  message: 'Votre annonce a été mise à jour avec succès'
})
setModalVisible(true)
setTimeout(() => router.push(`/trade/${data.id}`), 2000)
```

2. **Ligne ~177-181** - Succès création
```typescript
// AVANT
Alert.alert(
  'Succès !',
  'Votre annonce a été créée',
  [{ text: 'OK', onPress: () => router.push(`/trade/${data.id}`) }]
)

// APRÈS
setModalConfig({
  variant: 'success',
  title: 'Annonce créée !',
  message: 'Votre annonce a été créée avec succès'
})
setModalVisible(true)
setTimeout(() => router.push(`/trade/${data.id}`), 2000)
```

3. **Ligne ~186** - Erreur
```typescript
// AVANT
Alert.alert('Erreur', error.message)

// APRÈS
setModalConfig({
  variant: 'error',
  title: 'Erreur',
  message: error.message
})
setModalVisible(true)
```

---

## 📝 Fichier 2 : `trade/[id].tsx`

### Actions à intégrer

#### 1. Bouton "Contacter" (ligne ~70-83)

Actuellement : `Alert.alert` simple

**À remplacer par** :
```typescript
const handleContact = () => {
  setModalConfig({
    variant: 'info',
    title: 'Fonctionnalité à venir',
    message: 'La messagerie sera bientôt disponible'
  })
  setModalVisible(true)
}
```

#### 2. Bouton "Modifier" (si propriétaire)

Actuellement : Navigation directe → **Pas de modal nécessaire**

#### 3. Bouton "Supprimer" (à ajouter si propriétaire)

**Pattern suggéré** :
```typescript
const handleDelete = async () => {
  try {
    const { error } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id)
    
    if (error) throw error
    
    setModalConfig({
      variant: 'success',
      title: 'Annonce supprimée',
      message: 'Votre annonce a été supprimée'
    })
    setModalVisible(true)
    setTimeout(() => router.push('/(tabs)/marketplace'), 2000)
  } catch (error) {
    setModalConfig({
      variant: 'error',
      title: 'Erreur',
      message: 'Impossible de supprimer l\'annonce'
    })
    setModalVisible(true)
  }
}
```

---

## 📝 Fichier 3 : `profile/index.tsx`

### Actions à intégrer

#### 1. Déconnexion (ligne ~97-100)

**Modifier la fonction** :
```typescript
const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    setModalConfig({
      variant: 'success',
      title: 'Déconnexion réussie',
      message: 'À bientôt sur Gémou2 !'
    })
    setModalVisible(true)
    setTimeout(() => router.replace('/login'), 2000)
  } catch (error) {
    setModalConfig({
      variant: 'error',
      title: 'Erreur',
      message: 'Impossible de se déconnecter'
    })
    setModalVisible(true)
  }
}
```

#### 2. Enregistrer les informations (Onglet Informations)

**À rechercher** : Fonction de sauvegarde du profil

Pattern si trouvé :
```typescript
setModalConfig({
  variant: 'success',
  title: 'Profil mis à jour',
  message: 'Vos informations ont été enregistrées'
})
setModalVisible(true)
```

#### 3. Paramètres de confidentialité (Toggles)

**À intégrer** : Confirmation après chaque toggle

Pattern :
```typescript
const handlePrivacyToggle = async (setting: string, value: boolean) => {
  try {
    // ... logique de sauvegarde
    setModalConfig({
      variant: 'success',
      title: 'Paramètre modifié',
      message: 'Votre préférence a été enregistrée'
    })
    setModalVisible(true)
  } catch (error) {
    setModalConfig({
      variant: 'error',
      title: 'Erreur',
      message: 'Impossible de modifier ce paramètre'
    })
    setModalVisible(true)
  }
}
```

---

## ⚠️ Pièges à Éviter

### 1. Oublier de retirer Alert des imports
```typescript
// ❌ MAUVAIS
import { View, Alert } from 'react-native'

// ✅ BON
import { View } from 'react-native'
```

### 2. Oublier d'ajouter la modal dans le JSX
```typescript
// ❌ MAUVAIS - Modal configurée mais jamais affichée
setModalConfig({ ... })
setModalVisible(true)
// Mais pas de <ConfirmationModal /> dans le return

// ✅ BON - Modal ajoutée avant la fermeture
return (
  <View>
    {/* ... contenu */}
    <ConfirmationModal {...} />
  </View>
)
```

### 3. Ne pas gérer les redirections avec setTimeout
```typescript
// ❌ MAUVAIS - Redirection immédiate
setModalVisible(true)
router.push('/somewhere')  // L'utilisateur ne verra pas la modal

// ✅ BON - Laisser 2 secondes
setModalVisible(true)
setTimeout(() => router.push('/somewhere'), 2000)
```

---

## 📋 Checklist de Validation

Pour chaque fichier modifié, vérifier :

- [ ] Import de `ConfirmationModal` et `ModalVariant`
- [ ] Suppression de `Alert` des imports
- [ ] Ajout des états `modalVisible` et `modalConfig`
- [ ] Remplacement de **tous** les `Alert.alert()` par le pattern modal
- [ ] Ajout du composant `<ConfirmationModal />` dans le JSX
- [ ] Gestion des redirections avec `setTimeout` si nécessaire
- [ ] Test de chaque action (succès et erreur)
- [ ] Vérification des messages (titre et contenu clairs)

---

## 🎯 Résumé des Messages Recommandés

### Marketplace

| Action | Variant | Titre | Message |
|--------|---------|-------|---------|
| Créer annonce | success | Annonce créée ! | Votre annonce a été créée avec succès |
| Modifier annonce | success | Annonce mise à jour | Votre annonce a été mise à jour avec succès |
| Supprimer annonce | success | Annonce supprimée | Votre annonce a été supprimée |
| Contacter vendeur | info | Fonctionnalité à venir | La messagerie sera bientôt disponible |
| Erreur | error | Erreur | {message d'erreur dynamique} |

### Profil

| Action | Variant | Titre | Message |
|--------|---------|-------|---------|
| Déconnexion | success | Déconnexion réussie | À bientôt sur Gémou2 ! |
| Enregistrer infos | success | Profil mis à jour | Vos informations ont été enregistrées |
| Modifier paramètre | success | Paramètre modifié | Votre préférence a été enregistrée |
| Erreur | error | Erreur | {message d'erreur dynamique} |

---

## 🚀 Après l'Implémentation

### Tests à effectuer

1. **Test de chaque action** :
   - Vérifier l'affichage de la modal
   - Vérifier le message
   - Vérifier la variante (couleur/emoji)
   - Vérifier la fermeture auto (2 secondes)

2. **Test des erreurs** :
   - Forcer une erreur (ex: pas de connexion)
   - Vérifier la modal d'erreur
   - Vérifier que l'app ne crash pas

3. **Test de l'UX** :
   - Vérifier que les redirections se font après la modal
   - Vérifier que l'utilisateur a le temps de lire
   - Vérifier la cohérence des messages

---

## 📞 Support

En cas de doute, référez-vous aux fichiers déjà implémentés :
- **Exemple simple** : `components/friends/UserSearchBar.tsx`
- **Exemple avec redirection** : `app/(tabs)/create-event.tsx`
- **Exemple multiple actions** : `app/(tabs)/events/[id].tsx`

Le pattern est identique partout ! 🎉


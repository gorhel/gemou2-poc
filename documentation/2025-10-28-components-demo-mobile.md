# Documentation - Route Components Demo Mobile

**Date de création :** 28 octobre 2025  
**Type :** Page de démonstration  
**Plateforme :** Mobile (React Native / Expo)  
**Route :** `/components-demo`

---

## 📋 Vue d'ensemble

Page de démonstration complète présentant tous les composants UI disponibles dans l'application mobile Gémou2. Cette page sert de bibliothèque visuelle et de guide d'utilisation pour les développeurs.

---

## 🎯 Objectifs

1. **Visualisation** : Afficher tous les composants UI dans différents états
2. **Documentation** : Fournir des exemples d'utilisation concrets
3. **Tests visuels** : Permettre de tester rapidement les modifications de composants
4. **Référence** : Guide pour les développeurs lors de l'implémentation de nouvelles fonctionnalités

---

## 🗂️ Structure de la page

### 1. **Header**
- Bouton retour vers la page précédente
- Titre "🎨 Composants UI Mobile"
- Sous-titre descriptif

### 2. **Section Boutons** 🔘
Démonstration du composant `Button` :
- **Variantes** : primary, secondary, danger, ghost
- **Tailles** : sm, md, lg
- **États** : normal, loading, disabled
- **Options** : fullWidth

### 3. **Section Cartes** 📋
Démonstration du composant `Card` :
- Carte simple avec titre et description
- Carte avec actions (boutons)
- Composant `CardContent` pour le contenu

### 4. **Section Formulaires** 📝
Démonstration des composants de saisie :
- **Input** : Champs de texte standards
  - Nom complet
  - Email
  - Mot de passe (secureTextEntry)
- **Select** : Liste déroulante avec options
- **Toggle** : Interrupteur on/off

### 5. **Section Chargement** ⏳
États de chargement et placeholders :
- **LoadingSpinner** : Petit et grand format avec texte optionnel
- **LoadingCard** : Carte avec spinner intégré
- **SkeletonCard** : Placeholder animé pour carte
- **SkeletonTable** : Placeholder pour liste/tableau

### 6. **Section Pills** 🏷️
Démonstration du composant `SmallPill` :
- Badges pour tags et labels
- Exemples : React Native, TypeScript, Expo, Supabase

### 7. **Section Modale** 📱
Démonstration du composant `Modal` :
- Bouton pour ouvrir la modale
- Modale avec titre et contenu personnalisable
- Bouton de fermeture

### 8. **Section Palette de Couleurs** 🎨
Présentation des couleurs du design system :
- Primary (#3b82f6)
- Secondary (#8b5cf6)
- Success (#22c55e)
- Warning (#f59e0b)
- Danger (#ef4444)
- Gray (#6b7280)

### 9. **Section Documentation** 📚
- **Bloc de code** : Exemple d'import et d'utilisation
- **Bonnes pratiques** :
  - ✅ Utilisez les variantes
  - ✅ Mobile-first
  - ✅ Accessibilité

---

## 🔧 Configuration technique

### Fichiers créés/modifiés

1. **`apps/mobile/app/components-demo.tsx`**
   - Page principale de démonstration
   - Contient tous les exemples de composants

2. **`apps/mobile/config/headers.config.ts`**
   ```typescript
   '/components-demo': {
     title: '🎨 Composants UI',
     showBackButton: true,
     rightActions: []
   }
   ```

3. **`apps/mobile/app/_layout.tsx`**
   ```typescript
   <Stack.Screen 
     name="components-demo" 
     options={{ title: 'Composants UI', headerShown: false }} 
   />
   ```

---

## 📦 Composants démontrés

| Composant | Chemin | Variantes démontrées |
|-----------|--------|---------------------|
| Button | `components/ui/Button` | primary, secondary, danger, ghost, sm, md, lg, loading, disabled, fullWidth |
| Card | `components/ui/Card` | simple, avec actions, CardContent |
| Input | `components/ui/Input` | texte, email, password, avec label |
| Select | `components/ui/Select` | avec options, label, onChange |
| Toggle | `components/ui/Toggle` | on/off states |
| LoadingSpinner | `components/ui/Loading` | small, large, avec texte |
| LoadingCard | `components/ui/Loading` | avec texte personnalisable |
| Skeleton | `components/ui/Loading` | SkeletonCard, SkeletonTable |
| Modal | `components/ui/Modal` | avec titre, contenu, fermeture |
| SmallPill | `components/ui/SmallPill` | badges et tags |

---

## 🚀 Accès à la page

### Navigation programmatique

```typescript
import { router } from 'expo-router'

// Depuis n'importe quelle page
router.push('/components-demo')
```

### Depuis le dashboard (exemple)

```typescript
<TouchableOpacity onPress={() => router.push('/components-demo')}>
  <Text>Voir les composants</Text>
</TouchableOpacity>
```

---

## 💡 Utilisation des composants

### Exemple : Button

```typescript
import { Button } from '../components/ui/Button'

<Button 
  variant="primary" 
  size="md"
  loading={isLoading}
  onPress={handleSubmit}
>
  Enregistrer
</Button>
```

### Exemple : Card

```typescript
import { Card, CardContent } from '../components/ui/Card'

<Card>
  <Text style={styles.title}>Titre de la carte</Text>
  <CardContent>
    <Text>Contenu de la carte</Text>
  </CardContent>
</Card>
```

### Exemple : Input

```typescript
import { Input } from '../components/ui/Input'

<Input
  label="Email"
  placeholder="votre@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

### Exemple : Modal

```typescript
import { Modal } from '../components/ui/Modal'

const [visible, setVisible] = useState(false)

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Confirmation"
>
  <Text>Êtes-vous sûr ?</Text>
  <Button onPress={() => setVisible(false)}>Confirmer</Button>
</Modal>
```

---

## 🎨 Design System

### Couleurs principales

```typescript
const colors = {
  primary: '#3b82f6',    // Bleu - Actions principales
  secondary: '#8b5cf6',  // Violet - Actions secondaires
  success: '#22c55e',    // Vert - Succès
  warning: '#f59e0b',    // Orange - Avertissement
  danger: '#ef4444',     // Rouge - Danger/Suppression
  gray: '#6b7280'        // Gris - Texte secondaire
}
```

### Tailles de boutons

```typescript
const sizes = {
  sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 }
}
```

---

## ✅ Bonnes pratiques

### 1. Cohérence visuelle
- ✅ Utilisez toujours les variantes prédéfinies
- ✅ Respectez la palette de couleurs
- ❌ N'inventez pas de nouvelles couleurs

### 2. Accessibilité
- ✅ Utilisez des labels clairs pour les inputs
- ✅ Assurez-vous que les boutons ont une taille suffisante (44x44 minimum)
- ✅ Fournissez un feedback visuel pour les actions

### 3. États de chargement
- ✅ Affichez toujours un indicateur de chargement pour les actions longues
- ✅ Utilisez les skeletons pour les chargements de listes
- ❌ Ne laissez jamais l'interface figée sans feedback

### 4. Formulaires
- ✅ Validez les entrées côté client avant l'envoi
- ✅ Affichez des messages d'erreur clairs
- ✅ Utilisez le bon type de clavier (email, numérique, etc.)

---

## 🔄 Maintenance

### Ajouter un nouveau composant

1. **Créer le composant** dans `components/ui/`
2. **L'exporter** depuis `components/ui/index.ts`
3. **Ajouter une section** dans `components-demo.tsx`
4. **Documenter** son utilisation dans cette page

### Modifier un composant existant

1. Modifier le composant dans `components/ui/`
2. Vérifier l'affichage dans `/components-demo`
3. Mettre à jour la documentation si nécessaire
4. Tester sur iOS, Android et Web

---

## 📱 Compatibilité

| Plateforme | Statut | Notes |
|------------|--------|-------|
| iOS | ✅ Testé | Tous composants fonctionnels |
| Android | ✅ Testé | Tous composants fonctionnels |
| Web | ✅ Testé | Rendu adaptatif avec Platform.select |

---

## 🐛 Problèmes connus

Aucun problème connu à ce jour.

---

## 📚 Ressources additionnelles

- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Design System Best Practices](https://www.designsystems.com/)

---

## 🔗 Pages connexes

- **Web** : `/components-demo` - Version web de la bibliothèque
- **Web** : `/style-guide` - Guide de style complet avec Header, Sidebar, etc.
- **Mobile** : Page similaire à créer pour les composants mobile-specific

---

## 📝 Notes de développement

- La page est conçue pour être facilement extensible
- Chaque section est indépendante et peut être modifiée sans impact sur les autres
- Les styles sont définis en StyleSheet pour de meilleures performances
- Le ScrollView permet de naviguer facilement entre toutes les sections

---

**Auteur :** AI Assistant  
**Dernière mise à jour :** 28 octobre 2025


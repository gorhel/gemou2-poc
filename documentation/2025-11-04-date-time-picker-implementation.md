# Implémentation des composants DateTimePicker

**Date**: 4 novembre 2025  
**Type**: Amélioration UX - Remplacement des champs de saisie date/heure  
**Fichiers concernés**:
- `apps/web/components/ui/DateTimePicker.tsx` (nouveau)
- `apps/mobile/components/ui/DateTimePicker.tsx` (nouveau)
- `apps/web/components/events/CreateEventForm.tsx` (modifié)
- `apps/mobile/app/(tabs)/create-event.tsx` (modifié)

---

## 📋 Vue d'ensemble

Remplacement de tous les champs de saisie manuelle de date et d'heure par des composants de sélection (pickers) natifs pour améliorer l'expérience utilisateur et réduire les erreurs de saisie.

### Problème initial

**Web** : Utilisation d'un input natif `datetime-local` sans personnalisation
```tsx
<input
  type="datetime-local"
  value={formData.date_time}
  onChange={(e) => handleInputChange('date_time', e.target.value)}
/>
```

**Mobile** : Saisie manuelle avec un TextInput simple
```tsx
<TextInput
  placeholder="2024-12-31 19:00"
  value={formData.date_time}
  onChangeText={(text) => setFormData(prev => ({ ...prev, date_time: text }))}
/>
```

❌ **Problèmes** :
- Saisie manuelle sujette aux erreurs
- Format non intuitif
- Pas de validation visuelle
- Mauvaise UX mobile
- Pas de localisation française

---

## ✅ Solution implémentée

### 1. Composant DateTimePicker Web

**Fichier** : `apps/web/components/ui/DateTimePicker.tsx`

#### Caractéristiques
- ✅ Séparation date/heure en deux inputs natifs
- ✅ Validation en temps réel
- ✅ Messages d'aide contextuels
- ✅ Récapitulatif de la date sélectionnée en français
- ✅ Gestion des erreurs visuelles
- ✅ Date minimum configurable
- ✅ Icônes intuitives
- ✅ Design responsive

#### Interface

```typescript
interface DateTimePickerProps {
  label?: string
  value: string              // Format ISO: "YYYY-MM-DDTHH:MM"
  onChange: (value: string) => void
  required?: boolean
  error?: string
  minDate?: string          // Format ISO
  placeholder?: string
  disabled?: boolean
  className?: string
}
```

#### Exemple d'utilisation

```tsx
import { DateTimePicker } from '../ui/DateTimePicker'

function MyForm() {
  const [dateTime, setDateTime] = useState('')
  
  return (
    <DateTimePicker
      label="Date et heure"
      value={dateTime}
      onChange={setDateTime}
      required
      error={errors.date_time}
      minDate={new Date().toISOString()}
      placeholder="Sélectionnez la date et l'heure"
    />
  )
}
```

#### Fonctionnalités avancées

1. **Récapitulatif automatique** : Affiche la date formatée en français
```
📅 lundi 25 décembre 2024 à 19:00
```

2. **Message d'aide contextuel** : Guide l'utilisateur
```
💡 Sélectionnez une heure pour votre événement
```

3. **Validation visuelle** : Bordures et fond colorés en cas d'erreur

---

### 2. Composant DateTimePicker Mobile

**Fichier** : `apps/mobile/components/ui/DateTimePicker.tsx`

#### Caractéristiques
- ✅ Utilise `@react-native-community/datetimepicker`
- ✅ Pickers natifs iOS/Android
- ✅ Workflow en 2 étapes (date → heure automatique)
- ✅ Bouton de modification de l'heure séparé
- ✅ Formatage automatique en français
- ✅ Gestion des erreurs native

> **Dépendance installée** : `@react-native-community/datetimepicker`

#### Interface

```typescript
interface DateTimePickerProps {
  label?: string
  value: string              // Format ISO: "YYYY-MM-DDTHH:MM"
  onChange: (value: string) => void
  required?: boolean
  error?: string
  minDate?: Date
  placeholder?: string
  disabled?: boolean
}
```

#### Exemple d'utilisation

```tsx
import { DateTimePicker } from '../../components/ui'

function MyForm() {
  const [dateTime, setDateTime] = useState('')
  
  return (
    <DateTimePicker
      label="Date et heure"
      value={dateTime}
      onChange={setDateTime}
      required
      error={errors.date_time}
      minDate={new Date()}
      placeholder="Sélectionnez la date et l'heure de l'événement"
    />
  )
}
```

#### Workflow utilisateur

1. 📅 **Étape 1** : L'utilisateur clique sur le bouton principal
   - Affichage du picker de date natif de la plateforme
   - Sélection de la date avec le calendrier natif

2. 🕐 **Étape 2** : Passage automatique au time picker
   - Après sélection de la date, ouverture automatique du picker d'heure
   - Sélection de l'heure avec le picker natif

3. ✅ **Résultat** : Date complète affichée avec option de modification
   ```
   📅 lundi 25 décembre 2024 à 19:00
   🕐 Modifier uniquement l'heure
   ```

#### Spécificités plateformes

**iOS** :
- Picker en mode "spinner" (rouleau)
- Transition fluide entre date et heure
- Design natif iOS

**Android** :
- Picker en mode "default" (calendrier Material Design)
- Dialog natif Android
- Validation automatique à la sélection

#### Avantages des pickers natifs

✅ **UX native** : Expérience familière pour chaque plateforme  
✅ **Accessibilité** : Pickers natifs entièrement accessibles  
✅ **Performance** : Composants natifs optimisés  
✅ **Localisation** : Utilise les paramètres régionaux de l'appareil  
✅ **Gestes natifs** : Interactions naturelles (scroll, tap)

---

## 🔧 Intégration dans les formulaires

### Web - CreateEventForm.tsx

**Avant** :
```tsx
<div>
  <label htmlFor="date_time">Date et heure *</label>
  <input
    type="datetime-local"
    id="date_time"
    value={formData.date_time}
    onChange={(e) => handleInputChange('date_time', e.target.value)}
  />
  {errors.date_time && <p>{errors.date_time}</p>}
</div>
```

**Après** :
```tsx
<DateTimePicker
  label="Date et heure"
  value={formData.date_time}
  onChange={(value) => handleInputChange('date_time', value)}
  required
  error={errors.date_time}
  minDate={new Date().toISOString()}
  placeholder="Sélectionnez la date et l'heure de l'événement"
/>
```

### Mobile - create-event.tsx

**Avant** :
```tsx
<View style={styles.inputContainer}>
  <Text style={styles.label}>Date et heure *</Text>
  <TextInput
    style={[styles.input, errors.date_time && styles.inputError]}
    placeholder="2024-12-31 19:00"
    value={formData.date_time}
    onChangeText={(text) => setFormData(prev => ({ ...prev, date_time: text }))}
  />
  <Text style={styles.helpText}>Format : AAAA-MM-JJ HH:MM</Text>
  {errors.date_time && <Text style={styles.errorText}>{errors.date_time}</Text>}
</View>
```

**Après** :
```tsx
<DateTimePicker
  label="Date et heure"
  value={formData.date_time}
  onChange={(value) => setFormData(prev => ({ ...prev, date_time: value }))}
  required
  error={errors.date_time}
  minDate={new Date()}
  placeholder="Sélectionnez la date et l'heure de l'événement"
/>
```

---

## 🎨 Structure des composants

### Web - DateTimePicker

```
DateTimePicker
├── Label (optionnel)
│   └── Indicateur required (*)
├── Grid (2 colonnes responsive)
│   ├── Date Input
│   │   ├── Input type="date"
│   │   └── Icône calendrier
│   └── Time Input
│       ├── Input type="time"
│       └── Icône horloge
├── Message d'aide contextuel (si date sans heure)
├── Message d'erreur (si error prop)
└── Récapitulatif (si date + heure valides)
    ├── Icône calendrier
    └── Date formatée en français
```

### Mobile - DateTimePicker

```
DateTimePicker
├── Label (optionnel)
│   └── Indicateur required (*)
├── Bouton principal
│   ├── Icône 📅
│   └── Texte (date formatée ou placeholder)
├── Bouton modifier l'heure (si date sélectionnée)
│   ├── Icône 🕐
│   └── "Modifier uniquement l'heure"
├── Message d'erreur (si error prop)
│   ├── Icône ⚠️
│   └── Texte d'erreur
└── Pickers natifs (conditionnels)
    ├── RNDateTimePicker (mode="date")
    │   ├── Calendrier natif iOS/Android
    │   └── Sélection de la date
    └── RNDateTimePicker (mode="time")
        ├── Horloge native iOS/Android
        └── Sélection de l'heure (format 24h)
```

---

## 📊 Avantages de cette approche

### UX/UI

| Aspect | Avant | Après |
|--------|-------|-------|
| **Saisie** | Manuelle, sujette aux erreurs | Sélection guidée |
| **Format** | Doit être mémorisé | Automatique |
| **Validation** | Uniquement backend | Temps réel |
| **Mobile** | Clavier requis | Pickers natifs |
| **Accessibilité** | Limitée | Labels + ARIA |
| **Localisation** | Aucune | Français intégré |

### Technique

✅ **Réutilisabilité** : Composants indépendants exportables  
✅ **Type-safety** : Interfaces TypeScript strictes  
✅ **Cohérence** : API identique web/mobile  
✅ **Maintenance** : Code centralisé  
✅ **Tests** : Composants isolés testables  

### Performance

✅ **Bundle size** : Aucune bibliothèque tierce sur web  
✅ **Native** : Utilise les pickers natifs sur mobile  
✅ **Optimisé** : Pas de re-renders inutiles  

---

## 🔍 Gestion des erreurs

### Validation intégrée

```typescript
// Le composant accepte une prop error
<DateTimePicker
  value={dateTime}
  onChange={setDateTime}
  error={errors.date_time} // Message d'erreur personnalisé
/>
```

### Exemples de messages d'erreur

```
⚠️ La date et heure sont obligatoires
⚠️ La date doit être dans le futur
⚠️ Veuillez sélectionner une date valide
```

### Affichage visuel

**Web** :
- Bordure rouge : `border-red-500`
- Fond teinté : `bg-red-50`
- Icône d'alerte
- Message sous les inputs

**Mobile** :
- Bordure rouge
- Fond rose clair
- Container d'erreur avec icône ⚠️
- Message dans un container stylé

---

## 🌍 Localisation

### Format de date français

Les deux composants utilisent la localisation française :

```javascript
// Web & Mobile
new Date(value).toLocaleDateString('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

// Résultat : "lundi 25 décembre 2024 à 19:00"
```

---

## 📦 Dépendances

### Web
✅ Aucune dépendance externe  
✅ Utilise les inputs HTML5 natifs

### Mobile
⚠️ Nécessite `@react-native-community/datetimepicker`

```bash
npm install @react-native-community/datetimepicker
# ou
yarn add @react-native-community/datetimepicker
```

**Déjà installé dans le projet** ✅

---

## 🚀 Prochaines étapes

### Améliorations possibles

1. **Presets de temps** : "Dans 1 heure", "Ce soir à 19h", etc.
2. **Récurrence** : Support d'événements récurrents
3. **Timezone** : Gestion des fuseaux horaires
4. **Range picker** : Sélection de plages horaires
5. **Accessibilité** : Tests avec screen readers
6. **Tests E2E** : Scénarios de sélection complets

### Autres formulaires à mettre à jour

Rechercher d'autres formulaires avec des champs date/heure :
- Formulaires de réservation
- Gestion des disponibilités
- Planification d'événements récurrents

---

## 📝 Notes techniques

### Format de données

Les composants utilisent le format ISO 8601 :
```
YYYY-MM-DDTHH:MM
Exemple : 2024-12-25T19:00
```

Ce format est :
- ✅ Standard international
- ✅ Compatible avec les bases de données
- ✅ Facilement convertible
- ✅ Indépendant du timezone (local)

### Gestion des valeurs vides

```typescript
// Valeur initiale
const [dateTime, setDateTime] = useState('')

// Le composant gère gracieusement les valeurs vides
<DateTimePicker value={dateTime} onChange={setDateTime} />
```

### Conversion vers Date

```typescript
// String ISO → Date
const date = new Date(dateTimeString)

// Date → String ISO (pour input)
const isoString = date.toISOString().slice(0, 16)
```

---

## ✨ Résumé

| Aspect | Web | Mobile |
|--------|-----|--------|
| **Inputs** | 2 séparés (date + time) | 2 séquentiels (date → heure) |
| **UI** | Inputs HTML5 stylisés | Pickers natifs iOS/Android |
| **Validation** | Temps réel | Natif |
| **Format** | Français | Français |
| **Dépendances** | Aucune | `@react-native-community/datetimepicker` |
| **Accessibilité** | Labels + ARIA | Natif iOS/Android |
| **Récapitulatif** | Oui | Oui |
| **Modification** | Direct sur inputs | Bouton séparé pour l'heure |
| **Workflow** | Simultané | Date puis heure automatique |

---

**✅ Implémentation complète et testée**  
**📱 Parité web/mobile respectée**  
**🎨 Design cohérent et moderne**  
**♿ Accessible et intuitif**


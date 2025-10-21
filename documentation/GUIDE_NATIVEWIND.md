# 🎨 Guide NativeWind - Tailwind CSS pour React Native

## ✅ Ce qui a été configuré

### Installation
- ✅ `nativewind` installé
- ✅ `tailwindcss` installé
- ✅ Configuration Tailwind créée (`tailwind.config.js`)
- ✅ Babel configuré avec plugin NativeWind
- ✅ Fichier CSS global créé
- ✅ Types TypeScript ajoutés

## 🎨 Comment utiliser NativeWind

### Avant (StyleSheet)
```typescript
import { View, Text, StyleSheet } from 'react-native';

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  }
});
```

### Après (NativeWind/Tailwind)
```typescript
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View className="p-4 bg-white rounded-xl">
      <Text className="text-2xl font-bold text-gray-900">Hello</Text>
    </View>
  );
}

// Pas de StyleSheet nécessaire ! 🎉
```

## 📦 Composants avec NativeWind

### Button avec Tailwind
```typescript
import { TouchableOpacity, Text } from 'react-native';

function Button({ children, onPress }) {
  return (
    <TouchableOpacity 
      className="bg-blue-600 py-3 px-6 rounded-lg active:bg-blue-700"
      onPress={onPress}
    >
      <Text className="text-white font-semibold text-center">
        {children}
      </Text>
    </TouchableOpacity>
  );
}
```

### Card avec Tailwind
```typescript
import { View, Text } from 'react-native';

function Card({ title, children }) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-md">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {title}
      </Text>
      {children}
    </View>
  );
}
```

## 🎯 Classes Tailwind disponibles

### Couleurs personnalisées (dans tailwind.config.js)
```typescript
// Couleurs primary (bleu)
className="bg-primary-500"     // #3b82f6
className="text-primary-600"   // #2563eb
className="border-primary-300" // #93c5fd

// Couleurs secondary (violet)
className="bg-secondary-500"   // #a855f7
className="text-secondary-600" // #9333ea
```

### Spacing
```
p-4   → padding: 16px
px-6  → padding horizontal: 24px
py-3  → padding vertical: 12px
m-2   → margin: 8px
gap-4 → gap: 16px
```

### Typography
```
text-sm   → 14px
text-base → 16px
text-lg   → 18px
text-xl   → 20px
text-2xl  → 24px

font-bold      → bold
font-semibold  → 600
font-medium    → 500
```

### Layout
```
flex          → display: flex
flex-row      → flexDirection: row
items-center  → alignItems: center
justify-between → justifyContent: space-between
```

### Borders & Radius
```
rounded-lg → borderRadius: 8px
rounded-xl → borderRadius: 12px
rounded-full → borderRadius: 9999px
border → borderWidth: 1px
border-2 → borderWidth: 2px
```

### Shadow (automatique cross-platform!)
```
shadow-sm → Petite ombre
shadow-md → Ombre moyenne
shadow-lg → Grande ombre
```

## 🚀 Migration progressive

### Étape 1 : Composants StyleSheet existants
**Gardez-les !** Pas besoin de tout migrer.

```typescript
// ✅ OK - StyleSheet
<View style={styles.container}>

// ✅ OK - NativeWind  
<View className="p-4 bg-white">

// ✅ OK - Les deux ensemble
<View style={styles.container} className="bg-white">
```

### Étape 2 : Nouveaux composants
**Utilisez NativeWind !** Plus rapide et plus lisible.

### Étape 3 : Refactoring (optionnel)
Migrez progressivement les composants existants.

## 💡 Exemples pratiques

### Exemple 1 : Page simple avec Tailwind
```typescript
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function MyPage() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-5 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Mon titre
        </Text>
        <Text className="text-gray-600 mt-1">
          Sous-titre
        </Text>
      </View>

      {/* Content */}
      <View className="p-4">
        <View className="bg-white rounded-xl p-4 shadow-md mb-4">
          <Text className="text-lg font-semibold mb-2">
            Ma carte
          </Text>
          <Text className="text-gray-600">
            Contenu de la carte
          </Text>
        </View>

        <TouchableOpacity className="bg-blue-600 py-4 rounded-lg active:bg-blue-700">
          <Text className="text-white font-bold text-center">
            Mon bouton
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

### Exemple 2 : Responsive web/mobile
```typescript
import { View, Text, Platform } from 'react-native';

export default function ResponsiveCard() {
  return (
    <View className={`
      p-4 bg-white rounded-xl shadow-md
      ${Platform.OS === 'web' ? 'max-w-2xl mx-auto' : ''}
    `}>
      <Text className="text-xl font-bold">
        Cette card est responsive !
      </Text>
    </View>
  );
}
```

### Exemple 3 : Variants conditionnels
```typescript
function StatusBadge({ status }: { status: 'active' | 'pending' | 'closed' }) {
  const colorClasses = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  return (
    <View className={`px-3 py-1 rounded-full ${colorClasses[status]}`}>
      <Text className="text-sm font-medium">
        {status}
      </Text>
    </View>
  );
}
```

## 🔧 Debugging

### Vérifier que NativeWind fonctionne
```typescript
// Test simple
import { View, Text } from 'react-native';

export default function Test() {
  return (
    <View className="p-4 bg-red-500">
      <Text className="text-white text-2xl">
        Si vous voyez du rouge → NativeWind fonctionne ! ✅
      </Text>
    </View>
  );
}
```

### En cas de problème

**1. Classes ne s'appliquent pas**
```bash
# Redémarrer Expo avec cache clear
npx expo start --clear
```

**2. Erreurs TypeScript**
```bash
# Vérifier que nativewind-env.d.ts est bien inclu
cat tsconfig.json | grep nativewind
```

**3. Styles différents web vs mobile**
```typescript
// Utiliser Platform.select si nécessaire
className={Platform.select({
  web: 'max-w-7xl mx-auto',
  default: 'w-full'
})}
```

## 📊 Comparaison : StyleSheet vs NativeWind

| Aspect | StyleSheet | NativeWind |
|--------|------------|------------|
| **Verbosité** | 10-15 lignes | 1 ligne |
| **Lisibilité** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Rapidité dev** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Type-safe** | ✅ | ✅ |
| **Cross-platform** | ✅ | ✅ |

## ✨ Avantages de NativeWind

1. **Rapidité** : Plus besoin de créer des StyleSheet
2. **Consistance** : Même système que Tailwind web
3. **Responsive** : Classes conditionnelles faciles
4. **Maintenance** : Moins de code à maintenir
5. **Équipe** : Si l'équipe connaît Tailwind, courbe d'apprentissage nulle

## 🎯 Recommandation

**Pour les nouveaux composants** → Utilisez NativeWind  
**Pour les composants existants** → Gardez StyleSheet (ou migrez progressivement)

## 📚 Ressources

- [Documentation NativeWind](https://www.nativewind.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Exemples NativeWind](https://www.nativewind.dev/examples)

---

**NativeWind est maintenant configuré ! Utilisez les classes Tailwind partout ! 🎨**


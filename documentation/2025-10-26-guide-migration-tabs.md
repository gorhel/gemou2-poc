# Guide de Migration des Pages vers les Tabs

**Date:** 26 Octobre 2025  
**Objectif:** Déplacer rapidement une page existante pour qu'elle possède les tabs

## 🚀 Migration en 4 étapes

### Étape 1: Déplacer le fichier

```bash
# Déplacer le fichier dans le dossier (tabs)
mv apps/mobile/app/ma-page.tsx apps/mobile/app/(tabs)/ma-page.tsx
```

### Étape 2: Corriger les imports

Dans le fichier déplacé, ajoutez un niveau supplémentaire à tous les imports relatifs :

```typescript
// ❌ AVANT
import { supabase } from '../lib'
import { MyComponent } from '../components/MyComponent'

// ✅ APRÈS
import { supabase } from '../../lib'
import { MyComponent } from '../../components/MyComponent'
```

**Astuce:** Recherchez tous les `'..` et remplacez par `'../..`

### Étape 3: Déclarer dans le layout

Ouvrez `apps/mobile/app/(tabs)/_layout.tsx` et ajoutez votre route :

#### Option A: Page visible dans le menu des tabs

```typescript
<Tabs.Screen
  name="ma-page"
  options={{
    title: 'Ma Page',
    tabBarIcon: ({ color, size }) => (
      <span style={{ fontSize: size }}>🎯</span>
    ),
  }}
/>
```

#### Option B: Page avec tabs mais masquée du menu

```typescript
<Tabs.Screen
  name="ma-page"
  options={{
    href: null,  // Masque du menu
    title: 'Ma Page',
  }}
/>
```

### Étape 4: Tester

```bash
# Redémarrer le serveur
npm run dev

# Tester la navigation
# La page devrait maintenant avoir les tabs
```

## 📝 Checklist de Migration

- [ ] Fichier déplacé dans `(tabs)/`
- [ ] Imports relatifs ajustés (`../` → `../../`)
- [ ] Route déclarée dans `_layout.tsx`
- [ ] Configuration des options (titre, icône)
- [ ] Ancien fichier supprimé (si doublon)
- [ ] Navigation testée
- [ ] Tabs visibles sur la page

## 🔍 Cas Particuliers

### Pages imbriquées (avec paramètres)

Pour une page comme `events/[id].tsx` :

1. Créer le dossier si nécessaire :
```bash
mkdir -p apps/mobile/app/(tabs)/events
```

2. Déplacer le fichier :
```bash
mv apps/mobile/app/events/[id].tsx apps/mobile/app/(tabs)/events/[id].tsx
```

3. Déclarer dans le layout :
```typescript
<Tabs.Screen
  name="events/[id]"
  options={{
    href: null,
    title: 'Détails événement',
  }}
/>
```

### Pages avec plusieurs niveaux d'imbrication

Pour `profile/edit/settings.tsx` :

```typescript
// Dans _layout.tsx
<Tabs.Screen
  name="profile/edit/settings"
  options={{
    href: null,
    title: 'Paramètres',
  }}
/>
```

## ⚡ Script de Migration Automatique

Créez un script pour automatiser la migration :

```bash
#!/bin/bash
# migrate-to-tabs.sh

# Usage: ./migrate-to-tabs.sh ma-page.tsx

FILE=$1
BASENAME=$(basename $FILE)

# Déplacer le fichier
mv apps/mobile/app/$FILE apps/mobile/app/(tabs)/$FILE

# Corriger les imports (macOS)
sed -i '' "s|from '\.\./|from '\.\./\.\./|g" apps/mobile/app/(tabs)/$FILE

echo "✅ Fichier déplacé et imports corrigés"
echo "⚠️  N'oubliez pas d'ajouter la route dans _layout.tsx"
```

## 🎯 Exemples Concrets

### Exemple 1: Page simple

**Avant:**
```
app/about.tsx
```

**Après:**
```
app/(tabs)/about.tsx
```

**Layout:**
```typescript
<Tabs.Screen name="about" options={{ title: 'À propos' }} />
```

### Exemple 2: Page de création (masquée du menu)

**Avant:**
```
app/create-post.tsx
```

**Après:**
```
app/(tabs)/create-post.tsx
```

**Layout:**
```typescript
<Tabs.Screen
  name="create-post"
  options={{
    href: null,
    title: 'Créer un post',
  }}
/>
```

### Exemple 3: Page avec paramètres dynamiques

**Avant:**
```
app/user/[id].tsx
```

**Après:**
```
app/(tabs)/user/[id].tsx
```

**Layout:**
```typescript
<Tabs.Screen
  name="user/[id]"
  options={{
    href: null,
    title: 'Profil utilisateur',
  }}
/>
```

## 🚨 Erreurs Courantes

### Erreur 1: "Cannot find module"

**Cause:** Les imports relatifs n'ont pas été corrigés

**Solution:** Ajoutez un niveau supplémentaire (`../../` au lieu de `../`)

### Erreur 2: "No route named..."

**Cause:** La route n'est pas déclarée dans `_layout.tsx`

**Solution:** Ajoutez la déclaration `<Tabs.Screen name="..." />`

### Erreur 3: Les tabs n'apparaissent pas

**Cause 1:** Le fichier n'est pas dans `(tabs)/`  
**Cause 2:** Le serveur n'a pas redémarré  

**Solution:** Vérifiez l'emplacement et redémarrez avec `npm run dev`

### Erreur 4: La page apparaît en double

**Cause:** Fichier présent à la fois dans `app/` et `(tabs)/`

**Solution:** Supprimez l'ancien fichier dans `app/`

## 📦 Migrations Batch

Pour migrer plusieurs pages d'un coup :

```bash
#!/bin/bash
# migrate-multiple.sh

FILES=(
  "about.tsx"
  "settings.tsx"
  "help.tsx"
)

for file in "${FILES[@]}"; do
  echo "Migration de $file..."
  mv apps/mobile/app/$file apps/mobile/app/(tabs)/$file
  sed -i '' "s|from '\.\./|from '\.\./\.\./|g" apps/mobile/app/(tabs)/$file
done

echo "✅ Migration terminée"
echo "⚠️  Ajoutez maintenant les routes dans _layout.tsx"
```

## 🔧 Modifications des Imports - Tableau de Référence

| Type d'import | Avant (hors tabs) | Après (dans tabs) |
|---------------|-------------------|-------------------|
| Lib | `'../lib'` | `'../../lib'` |
| Components | `'../components/X'` | `'../../components/X'` |
| Utils | `'../utils/X'` | `'../../utils/X'` |
| Hooks | `'../hooks/X'` | `'../../hooks/X'` |
| Types | `'../types'` | `'../../types'` |

## ✅ Validation Post-Migration

Après la migration, vérifiez que :

1. ✅ La page s'affiche correctement
2. ✅ Les tabs sont visibles en bas de l'écran
3. ✅ La navigation fonctionne
4. ✅ Les imports ne génèrent pas d'erreurs
5. ✅ L'ancien fichier a été supprimé
6. ✅ La route est bien déclarée dans `_layout.tsx`

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez le document principal : `2025-10-26-structure-tabs-mobile.md`
2. Vérifiez la console pour les erreurs d'imports
3. Redémarrez complètement le serveur
4. Vérifiez que le fichier est bien dans `(tabs)/`

---

**Dernière mise à jour:** 26 Octobre 2025  
**Version:** 1.0.0


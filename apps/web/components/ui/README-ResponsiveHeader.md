# 📱 ResponsiveHeader - Nouveau composant ajouté

## 🎯 Résumé

Un header responsive a été ajouté à l'application sans modifier le code existant. Le composant s'adapte automatiquement entre mobile et desktop selon les spécifications demandées.

## 📁 Fichiers créés

### 1. **Composant principal**
- `components/ui/ResponsiveHeader.tsx` - Composant principal avec logique responsive

### 2. **Documentation**
- `components/ui/ResponsiveHeader.md` - Guide d'intégration complet
- `components/ui/README-ResponsiveHeader.md` - Ce fichier

### 3. **Démonstration**
- `app/header-demo/page.tsx` - Page de test et démonstration

### 4. **Export**
- `components/ui/index.ts` - Mise à jour pour exporter le nouveau composant

## 🎨 Spécifications respectées

### ✅ Mobile (< 768px)
- Hauteur : 56px (h-14)
- Layout : Flexbox horizontal, space-between
- Gauche : Bouton retour (icône flèche)
- Centre : Titre de l'événement (tronqué si trop long)
- Droite : 3 icônes (Favoris ❤️, Partager ↗, Paramètres ⚙️)
- Icônes : 24x24px avec padding 8px
- Background : blanc avec ombre légère

### ✅ Desktop (≥ 768px)
- Hauteur : 64px (h-16)
- Layout : Flexbox horizontal, space-between
- Gauche : Logo Gémou2 + Titre complet
- Droite : Boutons avec labels texte + icônes
- Pas de bouton retour
- Labels des actions ("Favoris", "Partager", "Mon compte")

### ✅ Style
- Police : hérite du thème existant
- Couleurs : cohérentes avec l'application
- Transitions douces au changement de breakpoint
- Position : sticky top-0 avec z-index élevé (z-50)

## 🚀 Utilisation

### Import simple
```typescript
import { ResponsiveHeader } from '@/components/ui';

<ResponsiveHeader title="Mon événement" />
```

### Import avec types
```typescript
import { ResponsiveHeader, ResponsiveHeaderProps } from '@/components/ui';

const props: ResponsiveHeaderProps = {
  title: "Mon événement",
  isFavorite: true,
  onToggleFavorite: () => console.log('Favori togglé')
};
```

## 🔧 Fonctionnalités

### Navigation
- **Retour** : Navigation back par défaut (personnalisable)
- **Accueil** : Lien vers /dashboard (personnalisable)
- **Profil** : Lien vers /profile (personnalisable)

### Actions
- **Favoris** : Toggle avec état visuel (cœur rouge/gris)
- **Partage** : Fonction personnalisable (Web Share API ready)
- **Paramètres** : Navigation vers profil par défaut

### Responsive
- **Breakpoint** : 768px (md:)
- **Transitions** : Smooth entre mobile et desktop
- **Titre** : Tronqué sur mobile si > 20 caractères

## 🎯 Cas d'usage

### Page d'événement
```typescript
<ResponsiveHeader
  title={event.title}
  isFavorite={userFavorites.includes(event.id)}
  onToggleFavorite={() => toggleFavorite(event.id)}
  onShare={() => shareEvent(event)}
/>
```

### Page de profil
```typescript
<ResponsiveHeader
  title={`Profil de ${user.username}`}
  onBack={() => router.back()}
/>
```

### Page de création
```typescript
<ResponsiveHeader
  title="Créer un événement"
  onBack={() => router.push('/events')}
/>
```

## 📱 Test et démonstration

### Page de démonstration
Visitez `http://localhost:3000/header-demo` pour :
- Voir le header en action
- Tester les différentes fonctionnalités
- Comprendre le comportement responsive
- Voir les spécifications détaillées

### Test responsive
1. Ouvrez la page de démonstration
2. Redimensionnez la fenêtre du navigateur
3. Observez le changement automatique à 768px
4. Testez sur mobile avec les DevTools

## 🔄 Intégration future

### Dans le layout principal
```typescript
// app/layout.tsx
import { ResponsiveHeader } from '@/components/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ResponsiveHeader title="Gémou2" />
        {children}
      </body>
    </html>
  );
}
```

### Dans les pages spécifiques
```typescript
// app/events/[id]/page.tsx
import { ResponsiveHeader } from '@/components/ui';

export default function EventPage({ event }) {
  return (
    <div>
      <ResponsiveHeader
        title={event.title}
        isFavorite={event.isFavorite}
        onToggleFavorite={toggleFavorite}
      />
      {/* Contenu de la page */}
    </div>
  );
}
```

## 🎨 Personnalisation

### Classes CSS supplémentaires
```typescript
<ResponsiveHeader
  title="Mon titre"
  className="border-b-2 border-blue-500"
/>
```

### Navigation personnalisée
```typescript
const handleBack = () => {
  if (hasUnsavedChanges) {
    if (confirm('Quitter sans sauvegarder ?')) {
      router.back();
    }
  } else {
    router.back();
  }
};
```

## ✅ Contraintes respectées

- ✅ N'intègre pas encore le composant au routing
- ✅ Composant réutilisable indépendant
- ✅ Fichiers ajoutés sans écraser l'existant
- ✅ Utilise Tailwind CSS (cohérent avec le projet)
- ✅ Composant exportable pour intégration ultérieure
- ✅ Documentation complète fournie

## 🚀 Prochaines étapes

1. **Tester** le composant sur différentes pages
2. **Intégrer** dans les pages existantes selon les besoins
3. **Personnaliser** les actions selon la logique métier
4. **Ajouter** des fonctionnalités avancées si nécessaire

Le composant est prêt à être utilisé et peut être intégré progressivement dans l'application ! 🎉



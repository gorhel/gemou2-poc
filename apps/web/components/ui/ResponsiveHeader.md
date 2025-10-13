# ResponsiveHeader - Guide d'intégration

## 📋 Vue d'ensemble

Le composant `ResponsiveHeader` est un header responsive qui s'adapte automatiquement entre mobile et desktop. Il respecte le thème existant de l'application et fournit une navigation cohérente.

## 🚀 Installation

Le composant est déjà exporté depuis `@/components/ui` :

```typescript
import { ResponsiveHeader } from '@/components/ui';
```

## 📱 Comportement responsive

### Mobile (< 768px)
- **Hauteur :** 56px (h-14)
- **Layout :** Flexbox horizontal, space-between
- **Gauche :** Bouton retour (flèche)
- **Centre :** Titre tronqué si > 20 caractères
- **Droite :** 3 icônes (❤️ Favoris, ↗ Partager, ⚙️ Paramètres)
- **Icônes :** 24x24px avec padding 8px

### Desktop (≥ 768px)
- **Hauteur :** 64px (h-16)
- **Layout :** Flexbox horizontal, space-between
- **Gauche :** Logo Gémou2 + Titre complet
- **Droite :** Boutons avec labels ("Favoris", "Partager", "Mon compte")
- **Pas de bouton retour**

## 🎯 Utilisation basique

```typescript
import { ResponsiveHeader } from '@/components/ui';

function MyPage() {
  return (
    <div>
      <ResponsiveHeader title="Mon événement" />
      <main>
        {/* Contenu de la page */}
      </main>
    </div>
  );
}
```

## 🔧 Utilisation avancée

```typescript
import { ResponsiveHeader } from '@/components/ui';
import { useState } from 'react';

function EventPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Logique pour ajouter/retirer des favoris
  };

  const handleShare = () => {
    // Logique de partage (Web Share API, etc.)
    if (navigator.share) {
      navigator.share({
        title: 'Mon événement',
        text: 'Venez jouer avec nous !',
        url: window.location.href,
      });
    }
  };

  const handleSettings = () => {
    // Rediriger vers les paramètres ou ouvrir un modal
    router.push('/settings');
  };

  const handleBack = () => {
    // Navigation personnalisée si nécessaire
    router.back();
  };

  return (
    <div>
      <ResponsiveHeader
        title="Soirée Jeux de Société - Janvier 2025"
        onBack={handleBack}
        homeUrl="/dashboard"
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
        onSettings={handleSettings}
        profileUrl="/profile/username"
      />
      <main>
        {/* Contenu de la page */}
      </main>
    </div>
  );
}
```

## 📋 Props disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | - | **Requis.** Titre principal à afficher |
| `onBack` | `() => void` | - | Fonction appelée sur le bouton retour (mobile) |
| `homeUrl` | `string` | `'/dashboard'` | URL pour le lien d'accueil (desktop) |
| `isFavorite` | `boolean` | `false` | État des favoris |
| `onToggleFavorite` | `() => void` | - | Fonction appelée sur le bouton favoris |
| `onShare` | `() => void` | - | Fonction appelée sur le bouton partage |
| `onSettings` | `() => void` | - | Fonction appelée sur le bouton paramètres |
| `profileUrl` | `string` | `'/profile'` | URL du profil utilisateur |
| `className` | `string` | `''` | Classes CSS supplémentaires |

## 🎨 Styles et thème

Le composant utilise les classes Tailwind CSS et respecte le thème existant :

- **Couleurs :** `text-gray-900`, `text-blue-600`, `text-red-500`
- **Ombres :** `shadow-sm`
- **Bordures :** `border-gray-200`
- **Transitions :** `transition-colors duration-200`
- **Hover :** `hover:bg-gray-100`

## 🔄 Intégration avec Next.js Router

```typescript
import { useRouter } from 'next/navigation';
import { ResponsiveHeader } from '@/components/ui';

function MyPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  return (
    <ResponsiveHeader
      title="Ma page"
      onBack={handleBack}
      homeUrl="/dashboard"
    />
  );
}
```

## 🎯 Cas d'usage typiques

### Page d'événement
```typescript
<ResponsiveHeader
  title={event.title}
  isFavorite={userFavorites.includes(event.id)}
  onToggleFavorite={() => toggleFavorite(event.id)}
  onShare={() => shareEvent(event)}
  onSettings={() => openEventSettings(event.id)}
/>
```

### Page de profil
```typescript
<ResponsiveHeader
  title={`Profil de ${user.username}`}
  onBack={() => router.back()}
  onSettings={() => router.push('/profile/settings')}
/>
```

### Page de création
```typescript
<ResponsiveHeader
  title="Créer un événement"
  onBack={() => router.push('/events')}
  onSettings={() => router.push('/profile')}
/>
```

## 🚀 Intégration dans le layout

Pour intégrer le header dans toute l'application :

```typescript
// app/layout.tsx ou composant de layout
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

## 🔧 Personnalisation

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
  // Logique personnalisée
  if (hasUnsavedChanges) {
    if (confirm('Voulez-vous vraiment quitter sans sauvegarder ?')) {
      router.back();
    }
  } else {
    router.back();
  }
};
```

## 📱 Accessibilité

Le composant inclut :
- Labels ARIA pour tous les boutons
- Navigation clavier
- Contraste de couleurs approprié
- Tailles de touch targets (44px minimum)

## 🧪 Test et démonstration

Visitez `/header-demo` pour voir le composant en action avec différentes configurations.

## 🔄 Mises à jour futures

Le composant est conçu pour être extensible. Ajouts possibles :
- Menu contextuel pour les actions
- Notifications/badges sur les boutons
- Thème sombre
- Animations personnalisées



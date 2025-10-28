# 🎮 Schéma des Préférences Gaming

## 📋 Structure de la colonne `gaming_preferences` (JSONB)

La colonne `gaming_preferences` dans la table `profiles` stocke les préférences de jeu de l'utilisateur au format JSON.

---

## 🗂️ Structure JSON Complète

```json
{
  "favorite_type": "Stratégie",
  "experience_level": "Intermédiaire",
  "preferred_duration": "Moyen (30-60min)",
  "player_count_preference": "3-4 joueurs",
  "complexity_preference": "Moyen",
  "favorite_mechanics": ["Placement", "Deck Building", "Dés"],
  "themes": ["Fantasy", "Sci-Fi", "Médiéval"],
  "available_days": ["Lundi", "Mercredi", "Vendredi", "Samedi"],
  "preferred_time": "Soir",
  "distance_km": 20,
  "owns_games": true,
  "can_host": false
}
```

---

## 📊 Détails des Champs

### 1. **`favorite_type`** (Type de jeu préféré)
- **Type**: `string`
- **Options**:
  - `"Stratégie"`
  - `"Coopératif"`
  - `"Ambiance"`
  - `"Expert"`
  - `"Familial"`
  - `"Party Game"`
- **Exemple**: `"Stratégie"`

### 2. **`experience_level`** (Niveau d'expérience)
- **Type**: `string`
- **Options**:
  - `"Débutant"`
  - `"Intermédiaire"`
  - `"Expert"`
  - `"Pro"`
- **Exemple**: `"Intermédiaire"`

### 3. **`preferred_duration`** (Durée de jeu préférée)
- **Type**: `string`
- **Options**:
  - `"Court (-30min)"`
  - `"Moyen (30-60min)"`
  - `"Long (1-2h)"`
  - `"Très long (2h+)"`
- **Exemple**: `"Moyen (30-60min)"`

### 4. **`player_count_preference`** (Nombre de joueurs préféré)
- **Type**: `string`
- **Options**:
  - `"Solo"`
  - `"2 joueurs"`
  - `"3-4 joueurs"`
  - `"5+ joueurs"`
  - `"Tous"`
- **Exemple**: `"3-4 joueurs"`

### 5. **`complexity_preference`** (Niveau de complexité préféré)
- **Type**: `string`
- **Options**:
  - `"Simple"`
  - `"Moyen"`
  - `"Complexe"`
  - `"Très complexe"`
- **Exemple**: `"Moyen"`

### 6. **`favorite_mechanics`** (Mécaniques de jeu préférées)
- **Type**: `array of strings`
- **Options** (exemples):
  - `"Placement"`
  - `"Deck Building"`
  - `"Dés"`
  - `"Tuiles"`
  - `"Cartes"`
  - `"Négociation"`
  - `"Bluff"`
  - `"Enchères"`
  - `"Collection"`
  - `"Gestion de ressources"`
- **Exemple**: `["Placement", "Deck Building", "Dés"]`

### 7. **`themes`** (Thèmes préférés)
- **Type**: `array of strings`
- **Options** (exemples):
  - `"Fantasy"`
  - `"Sci-Fi"`
  - `"Historique"`
  - `"Moderne"`
  - `"Médiéval"`
  - `"Horreur"`
  - `"Western"`
  - `"Cyberpunk"`
  - `"Post-apocalyptique"`
- **Exemple**: `["Fantasy", "Sci-Fi", "Médiéval"]`

### 8. **`available_days`** (Jours de disponibilité)
- **Type**: `array of strings`
- **Options**:
  - `"Lundi"`
  - `"Mardi"`
  - `"Mercredi"`
  - `"Jeudi"`
  - `"Vendredi"`
  - `"Samedi"`
  - `"Dimanche"`
- **Exemple**: `["Lundi", "Mercredi", "Vendredi", "Samedi"]`

### 9. **`preferred_time`** (Créneau horaire préféré)
- **Type**: `string`
- **Options**:
  - `"Matin"` (6h-12h)
  - `"Après-midi"` (12h-18h)
  - `"Soir"` (18h-23h)
  - `"Nuit"` (23h-6h)
- **Exemple**: `"Soir"`

### 10. **`distance_km`** (Distance maximale de déplacement)
- **Type**: `number`
- **Options**:
  - `5` (5 km)
  - `10` (10 km)
  - `20` (20 km)
  - `50` (50 km)
  - `100` (100 km+)
- **Exemple**: `20`

### 11. **`owns_games`** (Possède des jeux)
- **Type**: `boolean`
- **Description**: Indique si l'utilisateur possède une collection de jeux
- **Exemple**: `true`

### 12. **`can_host`** (Peut recevoir)
- **Type**: `boolean`
- **Description**: Indique si l'utilisateur peut accueillir des parties chez lui
- **Exemple**: `false`

---

## 🔧 Utilisation dans Supabase

### Insertion

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    gaming_preferences: {
      favorite_type: 'Stratégie',
      experience_level: 'Intermédiaire',
      preferred_duration: 'Moyen (30-60min)',
      player_count_preference: '3-4 joueurs',
      complexity_preference: 'Moyen',
      favorite_mechanics: ['Placement', 'Deck Building'],
      themes: ['Fantasy', 'Sci-Fi'],
      available_days: ['Lundi', 'Mercredi', 'Samedi'],
      preferred_time: 'Soir',
      distance_km: 20,
      owns_games: true,
      can_host: false
    }
  })
  .eq('id', userId);
```

### Requête avec filtrage

```typescript
// Trouver des joueurs avec le même type de jeu préféré
const { data, error } = await supabase
  .from('profiles')
  .select('id, username, full_name, avatar_url, gaming_preferences')
  .eq('gaming_preferences->favorite_type', 'Stratégie')
  .limit(10);
```

### Recherche avec fonction personnalisée

```sql
-- Trouver des joueurs similaires
SELECT * FROM find_similar_players('user-uuid-here', 10);
```

---

## 📱 Affichage sur l'UI Mobile

### Dans la section Participants (Events/[id])

```tsx
{preferences && (
  <View style={styles.participantPreferences}>
    <Text style={styles.preferencesText} numberOfLines={1}>
      {preferences.favorite_type && `🎲 ${preferences.favorite_type}`}
    </Text>
    {preferences.experience_level && (
      <Text style={styles.preferencesText} numberOfLines={1}>
        ⭐ {preferences.experience_level}
      </Text>
    )}
  </View>
)}
```

---

## 🚀 Migration

Pour appliquer le schéma à votre base de données :

```bash
# Si vous utilisez Supabase local
supabase db reset

# Si vous utilisez Supabase Cloud
# Exécutez le fichier de migration via le dashboard Supabase
# SQL Editor > New query > Coller le contenu de 20250115000000_add_gaming_preferences.sql
```

---

## 📝 Exemple Complet d'Utilisation

### 1. Créer/Mettre à jour les préférences d'un utilisateur

```typescript
async function updateGamingPreferences(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      gaming_preferences: {
        favorite_type: 'Stratégie',
        experience_level: 'Expert',
        preferred_duration: 'Long (1-2h)',
        player_count_preference: '3-4 joueurs',
        complexity_preference: 'Complexe',
        favorite_mechanics: ['Placement', 'Gestion de ressources', 'Deck Building'],
        themes: ['Fantasy', 'Médiéval'],
        available_days: ['Vendredi', 'Samedi', 'Dimanche'],
        preferred_time: 'Soir',
        distance_km: 20,
        owns_games: true,
        can_host: true
      }
    })
    .eq('id', userId);

  return { data, error };
}
```

### 2. Récupérer les préférences d'un utilisateur

```typescript
async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('gaming_preferences')
    .eq('id', userId)
    .single();

  return data?.gaming_preferences;
}
```

### 3. Rechercher des joueurs compatibles

```typescript
async function findCompatiblePlayers(currentUserId: string) {
  // Récupérer les préférences de l'utilisateur actuel
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('gaming_preferences')
    .eq('id', currentUserId)
    .single();

  if (!currentUser?.gaming_preferences) return [];

  // Trouver des joueurs avec des préférences similaires
  const { data: players } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, gaming_preferences')
    .eq('gaming_preferences->favorite_type', currentUser.gaming_preferences.favorite_type)
    .neq('id', currentUserId)
    .limit(20);

  return players || [];
}
```

---

## 🎨 UI Components Suggérés

### Formulaire de sélection des préférences

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const GAME_TYPES = ['Stratégie', 'Coopératif', 'Ambiance', 'Expert', 'Familial', 'Party Game'];
const EXPERIENCE_LEVELS = ['Débutant', 'Intermédiaire', 'Expert', 'Pro'];

function GamingPreferencesForm({ onSave }) {
  const [preferences, setPreferences] = useState({
    favorite_type: null,
    experience_level: null,
    // ... autres champs
  });

  return (
    <ScrollView>
      <Text>Type de jeu préféré</Text>
      {GAME_TYPES.map(type => (
        <TouchableOpacity
          key={type}
          onPress={() => setPreferences({ ...preferences, favorite_type: type })}
        >
          <Text>{type}</Text>
        </TouchableOpacity>
      ))}
      
      {/* ... autres sélections ... */}
      
      <TouchableOpacity onPress={() => onSave(preferences)}>
        <Text>Sauvegarder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

---

## ✅ Checklist d'Implémentation

- [x] Migration SQL créée (`20250115000000_add_gaming_preferences.sql`)
- [x] Colonne `gaming_preferences` ajoutée à `profiles`
- [x] Index GIN créé pour améliorer les performances de recherche
- [x] Fonction `find_similar_players` créée
- [x] Affichage des préférences dans la section Participants
- [x] Badge "👑 Organisateur" ajouté pour le créateur d'événement
- [ ] Formulaire de saisie des préférences (à créer)
- [ ] Page de profil avec édition des préférences (à créer)
- [ ] Algorithme de matching avancé (à implémenter)
- [ ] Filtres de recherche basés sur les préférences (à créer)

---

## 📚 Ressources Complémentaires

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Supabase JSONB Queries](https://supabase.com/docs/guides/database/json)
- [React Native JSON Handling](https://reactnative.dev/docs/network)

---

**Date de création**: 2025-01-15  
**Dernière mise à jour**: 2025-01-15  
**Version**: 1.0.0




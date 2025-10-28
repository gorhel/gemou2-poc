-- Migration: Ajouter les préférences de jeu aux profils utilisateurs
-- Date: 2025-01-15

-- Ajouter la colonne gaming_preferences à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN gaming_preferences JSONB DEFAULT NULL;

-- Commentaire pour documenter la structure attendue du JSON
COMMENT ON COLUMN public.profiles.gaming_preferences IS 
'Préférences de jeu de l''utilisateur (JSON)
Structure attendue:
{
  "favorite_type": "Stratégie" | "Coopératif" | "Ambiance" | "Expert" | "Familial" | "Party Game",
  "experience_level": "Débutant" | "Intermédiaire" | "Expert" | "Pro",
  "preferred_duration": "Court (-30min)" | "Moyen (30-60min)" | "Long (1-2h)" | "Très long (2h+)",
  "player_count_preference": "Solo" | "2 joueurs" | "3-4 joueurs" | "5+ joueurs" | "Tous",
  "complexity_preference": "Simple" | "Moyen" | "Complexe" | "Très complexe",
  "favorite_mechanics": ["Placement", "Deck Building", "Dés", "Tuiles", "Cartes", "Négociation", ...],
  "themes": ["Fantasy", "Sci-Fi", "Historique", "Moderne", "Médiéval", "Horreur", ...],
  "available_days": ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  "preferred_time": "Matin" | "Après-midi" | "Soir" | "Nuit",
  "distance_km": 5 | 10 | 20 | 50 | 100,
  "owns_games": true | false,
  "can_host": true | false
}';

-- Créer un index sur gaming_preferences pour améliorer les performances de recherche
CREATE INDEX idx_profiles_gaming_preferences ON public.profiles USING gin (gaming_preferences);

-- Exemple de fonction pour rechercher des joueurs avec des préférences similaires
CREATE OR REPLACE FUNCTION find_similar_players(
  user_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  gaming_preferences JSONB,
  similarity_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.gaming_preferences,
    -- Score de similarité basique (à améliorer selon les besoins)
    CASE
      WHEN p.gaming_preferences->>'favorite_type' = 
           (SELECT gaming_preferences->>'favorite_type' FROM profiles WHERE id = user_id)
      THEN 1
      ELSE 0
    END AS similarity_score
  FROM profiles p
  WHERE p.id != user_id
    AND p.gaming_preferences IS NOT NULL
  ORDER BY similarity_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Ajouter une contrainte de validation pour s'assurer que gaming_preferences est un objet JSON valide
ALTER TABLE public.profiles 
ADD CONSTRAINT gaming_preferences_is_object 
CHECK (gaming_preferences IS NULL OR jsonb_typeof(gaming_preferences) = 'object');




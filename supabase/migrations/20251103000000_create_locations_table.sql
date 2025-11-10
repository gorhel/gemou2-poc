-- =====================================================
-- Migration: Création de la table locations
-- Date: 2025-11-03
-- Description: Table pour stocker les localisations (quartiers/districts) à La Réunion
--              utilisée pour l'autocomplétion dans les formulaires
-- =====================================================

-- Créer la table locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  district text NOT NULL,
  city text NOT NULL,
  postal_code text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contrainte unique pour éviter les doublons
ALTER TABLE public.locations 
ADD CONSTRAINT unique_district_city UNIQUE (district, city);

-- Index pour les performances de recherche
CREATE INDEX IF NOT EXISTS idx_locations_district ON public.locations (district);
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations (city);
CREATE INDEX IF NOT EXISTS idx_locations_district_city ON public.locations (district, city);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_locations_district_search 
  ON public.locations USING gin(to_tsvector('french', district));

-- Activer RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les localisations
CREATE POLICY "Les localisations sont publiques en lecture"
  ON public.locations
  FOR SELECT
  USING (true);

-- Policy: Seuls les admins peuvent insérer/modifier (optionnel)
CREATE POLICY "Seuls les admins peuvent modifier les localisations"
  ON public.locations
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- =====================================================
-- Insertion des données de base pour La Réunion
-- =====================================================

INSERT INTO public.locations (district, city, postal_code) VALUES
  -- Saint-Denis
  ('Bellepierre', 'Saint-Denis', '97400'),
  ('Le Moufia', 'Saint-Denis', '97400'),
  ('Sainte-Clotilde', 'Saint-Denis', '97490'),
  ('Le Butor', 'Saint-Denis', '97400'),
  ('La Bretagne', 'Saint-Denis', '97400'),
  ('Montgaillard', 'Saint-Denis', '97400'),
  ('La Providence', 'Saint-Denis', '97400'),
  ('La Source', 'Saint-Denis', '97400'),
  ('Centre-ville', 'Saint-Denis', '97400'),
  ('Bois de Nèfles', 'Saint-Denis', '97490'),
  ('La Montagne', 'Saint-Denis', '97417'),
  
  -- Saint-Paul
  ('Centre-ville', 'Saint-Paul', '97460'),
  ('Plateau Caillou', 'Saint-Paul', '97460'),
  ('Savanna', 'Saint-Paul', '97460'),
  ('Etang Saint-Paul', 'Saint-Paul', '97460'),
  ('La Plaine', 'Saint-Paul', '97460'),
  ('Boucan Canot', 'Saint-Paul', '97434'),
  ('Saint-Gilles-les-Bains', 'Saint-Paul', '97434'),
  ('Saint-Gilles-les-Hauts', 'Saint-Paul', '97435'),
  ('Guillaume', 'Saint-Paul', '97460'),
  ('Bernica', 'Saint-Paul', '97460'),
  ('Villèle', 'Saint-Paul', '97460'),
  ('Le Guillaume', 'Saint-Paul', '97460'),
  
  -- Saint-Pierre
  ('Terre Sainte', 'Saint-Pierre', '97410'),
  ('Bois d''Olives', 'Saint-Pierre', '97410'),
  ('Ravine des Cabris', 'Saint-Pierre', '97410'),
  ('Ligne Paradis', 'Saint-Pierre', '97410'),
  ('Pierrefonds', 'Saint-Pierre', '97410'),
  ('Centre-ville', 'Saint-Pierre', '97410'),
  ('Basse-Terre', 'Saint-Pierre', '97410'),
  ('Ligne des Bambous', 'Saint-Pierre', '97410'),
  ('Ravine Blanche', 'Saint-Pierre', '97410'),
  ('Grandes Bois', 'Saint-Pierre', '97410'),
  
  -- Le Tampon
  ('Trois-Mares', 'Le Tampon', '97430'),
  ('Dix-Septième', 'Le Tampon', '97430'),
  ('Bourg-Murat', 'Le Tampon', '97418'),
  ('Vingt-Troisième', 'Le Tampon', '97430'),
  ('Vingt-Cinquième', 'Le Tampon', '97430'),
  ('Quatorzième', 'Le Tampon', '97430'),
  ('Centre-ville', 'Le Tampon', '97430'),
  
  -- Saint-André
  ('Centre-ville', 'Saint-André', '97440'),
  ('Champ Borne', 'Saint-André', '97440'),
  ('Fayard', 'Saint-André', '97440'),
  ('Cambuston', 'Saint-André', '97440'),
  ('Mille Roches', 'Saint-André', '97440'),
  
  -- Saint-Louis
  ('Centre-ville', 'Saint-Louis', '97450'),
  ('La Rivière', 'Saint-Louis', '97421'),
  ('Les Makes', 'Saint-Louis', '97421'),
  ('Bel Air', 'Saint-Louis', '97450'),
  
  -- Saint-Benoît
  ('Centre-ville', 'Saint-Benoît', '97470'),
  ('Rivière de l''Est', 'Saint-Benoît', '97470'),
  ('Beaufonds', 'Saint-Benoît', '97470'),
  ('Cambourg', 'Saint-Benoît', '97470'),
  
  -- Le Port
  ('Centre-ville', 'Le Port', '97420'),
  ('La Rivière des Galets', 'Le Port', '97420'),
  ('Zac 2000', 'Le Port', '97420'),
  
  -- La Possession
  ('Centre-ville', 'La Possession', '97419'),
  ('La Ravine à Malheur', 'La Possession', '97419'),
  ('Le Moulin Joli', 'La Possession', '97419'),
  
  -- Saint-Joseph
  ('Centre-ville', 'Saint-Joseph', '97480'),
  ('Manapany-les-Bains', 'Saint-Joseph', '97480'),
  ('Vincendo', 'Saint-Joseph', '97425'),
  
  -- Saint-Leu
  ('Centre-ville', 'Saint-Leu', '97436'),
  ('Piton Saint-Leu', 'Saint-Leu', '97424'),
  ('Stella', 'Saint-Leu', '97424'),
  
  -- Sainte-Marie
  ('Centre-ville', 'Sainte-Marie', '97438'),
  ('La Baie', 'Sainte-Marie', '97438'),
  ('Duparc', 'Sainte-Marie', '97438'),
  ('Beauséjour', 'Sainte-Marie', '97438'),
  
  -- Sainte-Suzanne
  ('Centre-ville', 'Sainte-Suzanne', '97441'),
  ('Quartier Français', 'Sainte-Suzanne', '97441'),
  ('Bel Air', 'Sainte-Suzanne', '97441'),
  
  -- Petite-Île
  ('Centre-ville', 'Petite-Île', '97429'),
  
  -- Salazie
  ('Hell-Bourg', 'Salazie', '97433'),
  ('Grand Îlet', 'Salazie', '97433'),
  
  -- Cilaos
  ('Centre-ville', 'Cilaos', '97413'),
  
  -- Entre-Deux
  ('Centre-ville', 'Entre-Deux', '97414'),
  
  -- L'Étang-Salé
  ('Centre-ville', 'L''Étang-Salé', '97427'),
  ('L''Étang-Salé-les-Bains', 'L''Étang-Salé', '97427'),
  
  -- Les Avirons
  ('Centre-ville', 'Les Avirons', '97425'),
  
  -- Bras-Panon
  ('Centre-ville', 'Bras-Panon', '97412'),
  ('Rivière du Mât', 'Bras-Panon', '97412'),
  
  -- Sainte-Rose
  ('Centre-ville', 'Sainte-Rose', '97439'),
  ('Piton Sainte-Rose', 'Sainte-Rose', '97439'),
  
  -- Plaine-des-Palmistes
  ('Centre-ville', 'Plaine-des-Palmistes', '97431'),
  
  -- Les Trois-Bassins
  ('Centre-ville', 'Les Trois-Bassins', '97426'),
  
  -- Saint-Philippe
  ('Centre-ville', 'Saint-Philippe', '97442'),
  ('Basse-Vallée', 'Saint-Philippe', '97442')

ON CONFLICT (district, city) DO NOTHING;

-- Commentaires pour la documentation
COMMENT ON TABLE public.locations IS 'Table des localisations (quartiers/districts) à La Réunion pour l''autocomplétion';
COMMENT ON COLUMN public.locations.district IS 'Nom du quartier ou district';
COMMENT ON COLUMN public.locations.city IS 'Nom de la ville ou commune';
COMMENT ON COLUMN public.locations.postal_code IS 'Code postal';
COMMENT ON COLUMN public.locations.latitude IS 'Latitude (optionnel pour géolocalisation future)';
COMMENT ON COLUMN public.locations.longitude IS 'Longitude (optionnel pour géolocalisation future)';






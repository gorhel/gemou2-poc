-- =====================================================
-- Requêtes d'insertion de données dans la table locations
-- Date: 2025-01-27
-- Description: Script SQL pour insérer des localisations dans la table locations
-- =====================================================

-- Structure de la table locations:
--   id: uuid (généré automatiquement)
--   district: text NOT NULL
--   city: text NOT NULL
--   postal_code: text (optionnel)
--   latitude: decimal(10, 8) (optionnel)
--   longitude: decimal(11, 8) (optionnel)
--   created_at: timestamptz (généré automatiquement)
--   updated_at: timestamptz (généré automatiquement)
--
-- Contrainte unique: (district, city) - évite les doublons

-- =====================================================
-- EXEMPLE 1: Insertion simple (sans coordonnées GPS)
-- =====================================================

INSERT INTO public.locations (district, city, postal_code)
VALUES
  ('Nouveau Quartier', 'Saint-Denis', '97400'),
  ('Quartier Test', 'Saint-Paul', '97460')
ON CONFLICT (district, city) DO NOTHING;

-- =====================================================
-- EXEMPLE 2: Insertion avec coordonnées GPS
-- =====================================================

INSERT INTO public.locations (district, city, postal_code, latitude, longitude)
VALUES
  ('Bellepierre', 'Saint-Denis', '97400', -20.8823, 55.4504),
  ('Le Moufia', 'Saint-Denis', '97400', -20.8891, 55.4489),
  ('Sainte-Clotilde', 'Saint-Denis', '97490', -20.8967, 55.4567)
ON CONFLICT (district, city) DO NOTHING;

-- =====================================================
-- EXEMPLE 3: Insertion multiple (batch)
-- =====================================================

INSERT INTO public.locations (district, city, postal_code, latitude, longitude)
VALUES
  -- Saint-Denis - Nouveaux quartiers
  ('La Redoute', 'Saint-Denis', '97400', -20.8750, 55.4450),
  ('La Montagne', 'Saint-Denis', '97417', -20.9200, 55.4800),
  ('Le Chaudron', 'Saint-Denis', '97400', -20.8900, 55.4550),
  
  -- Saint-Paul - Nouveaux quartiers
  ('La Saline-les-Bains', 'Saint-Paul', '97434', -21.0700, 55.2300),
  ('L''Hermitage', 'Saint-Paul', '97434', -21.0800, 55.2400),
  ('La Plaine', 'Saint-Paul', '97460', -21.0100, 55.2700),
  
  -- Saint-Pierre - Nouveaux quartiers
  ('Ravine des Cabris', 'Saint-Pierre', '97410', -21.3400, 55.4800),
  ('Ligne Paradis', 'Saint-Pierre', '97410', -21.3500, 55.4900),
  ('Bois d''Olives', 'Saint-Pierre', '97410', -21.3300, 55.4700),
  
  -- Le Tampon - Nouveaux quartiers
  ('Trois-Mares', 'Le Tampon', '97430', -21.2800, 55.5200),
  ('Dix-Septième', 'Le Tampon', '97430', -21.2900, 55.5300),
  ('Bourg-Murat', 'Le Tampon', '97418', -21.2200, 55.5100)
ON CONFLICT (district, city) DO NOTHING;

-- =====================================================
-- EXEMPLE 4: Insertion avec gestion d'erreurs explicite
-- =====================================================

DO $$
BEGIN
  INSERT INTO public.locations (district, city, postal_code)
  VALUES
    ('Quartier A', 'Ville X', '97400'),
    ('Quartier B', 'Ville Y', '97460')
  ON CONFLICT (district, city) DO NOTHING;
  
  RAISE NOTICE 'Insertion terminée avec succès';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de l''insertion: %', SQLERRM;
END $$;

-- =====================================================
-- EXEMPLE 5: Insertion depuis une table temporaire
-- =====================================================

-- Créer une table temporaire avec les données
CREATE TEMP TABLE temp_locations (
  district text,
  city text,
  postal_code text,
  latitude decimal(10, 8),
  longitude decimal(11, 8)
);

-- Insérer les données dans la table temporaire
INSERT INTO temp_locations (district, city, postal_code, latitude, longitude)
VALUES
  ('Quartier 1', 'Ville 1', '97400', -20.8800, 55.4500),
  ('Quartier 2', 'Ville 2', '97460', -21.0100, 55.2700),
  ('Quartier 3', 'Ville 3', '97410', -21.3400, 55.4800);

-- Insérer depuis la table temporaire vers la table locations
INSERT INTO public.locations (district, city, postal_code, latitude, longitude)
SELECT district, city, postal_code, latitude, longitude
FROM temp_locations
ON CONFLICT (district, city) DO NOTHING;

-- Nettoyer la table temporaire
DROP TABLE temp_locations;

-- =====================================================
-- EXEMPLE 6: Insertion avec mise à jour si existe déjà
-- =====================================================

-- Si vous voulez mettre à jour les coordonnées GPS si le quartier existe déjà
INSERT INTO public.locations (district, city, postal_code, latitude, longitude)
VALUES
  ('Bellepierre', 'Saint-Denis', '97400', -20.8823, 55.4504),
  ('Le Moufia', 'Saint-Denis', '97400', -20.8891, 55.4489)
ON CONFLICT (district, city)
DO UPDATE SET
  postal_code = EXCLUDED.postal_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = now();

-- =====================================================
-- EXEMPLE 7: Insertion depuis un fichier CSV (via psql)
-- =====================================================

-- Si vous avez un fichier CSV avec les données, vous pouvez utiliser:
-- \copy public.locations(district, city, postal_code, latitude, longitude) FROM '/chemin/vers/fichier.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');

-- =====================================================
-- REQUÊTES UTILES POUR VÉRIFIER LES DONNÉES
-- =====================================================

-- Compter le nombre de localisations
SELECT COUNT(*) as total_locations FROM public.locations;

-- Voir toutes les localisations
SELECT * FROM public.locations ORDER BY city, district;

-- Voir les localisations d'une ville spécifique
SELECT * FROM public.locations WHERE city = 'Saint-Denis' ORDER BY district;

-- Voir les localisations avec coordonnées GPS
SELECT district, city, postal_code, latitude, longitude 
FROM public.locations 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Vérifier les doublons potentiels (devrait retourner 0 lignes grâce à la contrainte unique)
SELECT district, city, COUNT(*) 
FROM public.locations 
GROUP BY district, city 
HAVING COUNT(*) > 1;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

-- 1. La contrainte unique (district, city) empêche les doublons
--    Utilisez ON CONFLICT DO NOTHING pour ignorer les doublons
--    ou ON CONFLICT DO UPDATE pour mettre à jour les données existantes

-- 2. Les champs id, created_at et updated_at sont gérés automatiquement
--    Ne les incluez pas dans vos INSERT sauf cas particulier

-- 3. Les coordonnées GPS (latitude, longitude) sont optionnelles
--    Vous pouvez les ajouter plus tard si nécessaire

-- 4. Le code postal est optionnel mais recommandé pour une meilleure précision

-- 5. Pour insérer de grandes quantités de données, utilisez l'approche
--    avec table temporaire ou un fichier CSV pour de meilleures performances


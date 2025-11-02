-- ============================================
-- Script de création de données de test
-- Table : marketplace_items
-- Date : 27 octobre 2025
-- ============================================

-- IMPORTANT : Remplacez 'YOUR_USER_ID_HERE' par votre véritable user_id
-- Pour trouver votre user_id, exécutez d'abord :
-- SELECT id, email FROM auth.users LIMIT 5;

-- ============================================
-- 1. VÉRIFIER QUE LA TABLE EXISTE
-- ============================================

-- Si la table n'existe pas, créez-la d'abord :
-- (Décommentez les lignes ci-dessous si nécessaire)

/*
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sale', 'exchange', 'donation')),
  condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'worn')),
  price NUMERIC(10, 2),
  location_city TEXT,
  location_quarter TEXT,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID,
  custom_game_name TEXT,
  wanted_game TEXT,
  delivery_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_type ON marketplace_items(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_user ON marketplace_items(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at DESC);
*/

-- ============================================
-- 2. OBTENIR UN USER_ID VALIDE
-- ============================================

-- Option A : Utiliser le premier utilisateur de la base
-- Exécutez ceci pour voir les users disponibles :
SELECT id, email FROM auth.users LIMIT 5;

-- Option B : Utiliser votre propre user_id
-- Remplacez 'YOUR_USER_ID_HERE' dans les INSERT ci-dessous

-- ============================================
-- 3. INSÉRER DES DONNÉES DE TEST
-- ============================================

-- ATTENTION : Remplacez 'YOUR_USER_ID_HERE' par un vrai UUID avant d'exécuter

-- Annonce 1 : Vente - Monopoly
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  location_quarter,
  status,
  user_id,
  images,
  delivery_available
) VALUES (
  'Monopoly Edition 2024',
  'Jeu de société en excellent état, complet avec toutes les pièces. Très peu utilisé, idéal pour les soirées en famille.',
  'sale',
  'excellent',
  45.00,
  'Saint-Denis',
  'Bellepierre',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=monopoly'],
  true
);

-- Annonce 2 : Échange - Catan
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  location_quarter,
  status,
  user_id,
  images,
  wanted_game,
  delivery_available
) VALUES (
  'Catan - Édition Voyageurs',
  'Version complète du célèbre jeu Catan. Cherche à échanger contre un autre jeu de stratégie.',
  'exchange',
  'good',
  NULL,
  'Saint-Pierre',
  'Terre Sainte',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=catan'],
  'Azul ou Splendor',
  false
);

-- Annonce 3 : Don - 7 Familles
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  status,
  user_id,
  delivery_available
) VALUES (
  'Jeu de 7 Familles',
  'Je donne ce jeu de cartes pour enfants. Parfait pour un premier jeu de société.',
  'donation',
  'fair',
  NULL,
  'Saint-Paul',
  'available',
  'YOUR_USER_ID_HERE',
  false
);

-- Annonce 4 : Vente - Risk
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  location_quarter,
  status,
  user_id,
  images,
  delivery_available
) VALUES (
  'Risk - Version Classique',
  'Jeu de stratégie complet. Quelques pièces légèrement usées mais totalement jouable.',
  'sale',
  'good',
  30.00,
  'Le Tampon',
  'Trois-Mares',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=risk'],
  true
);

-- Annonce 5 : Vente - Scrabble
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  status,
  user_id,
  images,
  delivery_available
) VALUES (
  'Scrabble Deluxe',
  'Scrabble avec plateau tournant et lettres en bois. Excellent état.',
  'sale',
  'excellent',
  35.00,
  'Saint-André',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=scrabble'],
  false
);

-- Annonce 6 : Échange - Dixit
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  location_quarter,
  status,
  user_id,
  images,
  wanted_game,
  delivery_available
) VALUES (
  'Dixit + Extension',
  'Jeu de base + extension Odyssey. État neuf, utilisé seulement 2 fois.',
  'exchange',
  'new',
  NULL,
  'Saint-Louis',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=dixit'],
  'Wingspan ou Évolution',
  true
);

-- Annonce 7 : Don - Uno
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  status,
  user_id,
  delivery_available
) VALUES (
  'Uno - Version Classique',
  'Jeu de cartes Uno. Quelques cartes ont des marques d''usure mais reste totalement jouable.',
  'donation',
  'worn',
  NULL,
  'Saint-Benoît',
  'available',
  'YOUR_USER_ID_HERE',
  false
);

-- Annonce 8 : Vente - Blanc Manger Coco
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  location_quarter,
  status,
  user_id,
  images,
  delivery_available
) VALUES (
  'Blanc Manger Coco - Pack Complet',
  'Le célèbre jeu d''humour noir français. Pack avec extension. État neuf sous blister.',
  'sale',
  'new',
  40.00,
  'Saint-Gilles-les-Bains',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=bmc'],
  true
);

-- Annonce 9 : Vente - Les Aventuriers du Rail
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  status,
  user_id,
  images,
  delivery_available
) VALUES (
  'Les Aventuriers du Rail - Europe',
  'Version Europe du célèbre jeu de trains. Tout est présent, bon état général.',
  'sale',
  'good',
  38.00,
  'La Possession',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=aventuriers'],
  false
);

-- Annonce 10 : Échange - Codenames
INSERT INTO marketplace_items (
  title,
  description,
  type,
  condition,
  price,
  location_city,
  status,
  user_id,
  images,
  wanted_game,
  delivery_available
) VALUES (
  'Codenames + Codenames Duo',
  'Les deux versions du jeu. Excellent état, très amusant pour les soirées.',
  'exchange',
  'excellent',
  NULL,
  'Le Port',
  'available',
  'YOUR_USER_ID_HERE',
  ARRAY['https://picsum.photos/400/300?random=codenames'],
  'Mysterium ou Déception',
  true
);

-- ============================================
-- 4. VÉRIFIER LES DONNÉES INSÉRÉES
-- ============================================

-- Afficher toutes les annonces créées
SELECT 
  id,
  title,
  type,
  price,
  location_city,
  status,
  created_at
FROM marketplace_items
ORDER BY created_at DESC
LIMIT 20;

-- Compter les annonces par type
SELECT 
  type,
  COUNT(*) as count
FROM marketplace_items
WHERE status = 'available'
GROUP BY type;

-- ============================================
-- 5. REQUÊTE DE NETTOYAGE (À UTILISER SI BESOIN)
-- ============================================

-- ATTENTION : Ceci supprimera TOUTES les annonces de test
-- Décommentez uniquement si vous voulez tout supprimer

/*
DELETE FROM marketplace_items 
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- Ou supprimer seulement les annonces avec des images picsum (test)
/*
DELETE FROM marketplace_items 
WHERE images::text LIKE '%picsum.photos%';
*/

-- ============================================
-- 6. ALTERNATIVE : UTILISER LE PREMIER USER AUTOMATIQUEMENT
-- ============================================

-- Si vous voulez insérer avec le premier user de la base automatiquement :
-- (Remplacez tous les INSERT ci-dessus par cette version)

/*
WITH first_user AS (
  SELECT id FROM auth.users LIMIT 1
)
INSERT INTO marketplace_items (
  title, description, type, condition, price, 
  location_city, status, user_id, images
)
SELECT 
  'Monopoly Auto-Generated',
  'Annonce créée automatiquement',
  'sale',
  'excellent',
  45.00,
  'Saint-Denis',
  'available',
  first_user.id,
  ARRAY['https://picsum.photos/400/300?random=auto']
FROM first_user;
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Notes :
-- 1. N'oubliez pas de remplacer 'YOUR_USER_ID_HERE'
-- 2. Les images utilisent picsum.photos (placeholders)
-- 3. Les prix sont en euros
-- 4. Toutes les annonces ont le status 'available'
-- 5. Pour de vraies images, remplacez les URLs


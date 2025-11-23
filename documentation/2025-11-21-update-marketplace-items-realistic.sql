-- =====================================================
-- Script de mise à jour des annonces marketplace
-- Date: 2025-01-27
-- Description: Rendre les annonces existantes plus réalistes
--              avec des descriptions détaillées, prix cohérents,
--              localisations précises et variantes naturelles
-- =====================================================

-- =====================================================
-- ÉTAPE 1: Mise à jour des annonces de VENTE
-- =====================================================

-- Annonce 1 : Monopoly - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Monopoly - Édition Classique 2023',
  description = 'Jeu Monopoly en excellent état, complet avec toutes les pièces d''origine. Acheté il y a 6 mois, joué seulement 3 fois. La boîte présente quelques légers froissements mais le contenu est impeccable. Toutes les cartes, billets et pions sont présents. Parfait pour les soirées en famille ou entre amis. Disponible pour récupération à Bellepierre ou livraison possible dans Saint-Denis.',
  condition = 'excellent',
  price = 42.00,
  location_city = 'Saint-Denis',
  location_quarter = 'Bellepierre',
  delivery_available = true,
  custom_game_name = 'Monopoly',
  created_at = NOW() - INTERVAL '15 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Monopoly%' AND type = 'sale' 
  LIMIT 1
);

-- Annonce 2 : Risk - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Risk - Édition Classique',
  description = 'Jeu de stratégie Risk complet. Quelques pièces de cartes présentent des marques d''usure légères (coins légèrement arrondis) mais le jeu reste totalement jouable. Les pions sont tous présents et en bon état. Le plateau est intact. Idéal pour les amateurs de jeux de stratégie. Récupération à Trois-Mares ou livraison possible dans la région du Tampon.',
  condition = 'good',
  price = 28.00,
  location_city = 'Le Tampon',
  location_quarter = 'Trois-Mares',
  delivery_available = true,
  custom_game_name = 'Risk',
  created_at = NOW() - INTERVAL '8 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Risk%' AND type = 'sale' 
  LIMIT 1
);

-- Annonce 3 : Scrabble - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Scrabble Deluxe - Plateau Tournant',
  description = 'Scrabble Deluxe avec plateau tournant et lettres en bois de qualité. État quasi neuf, utilisé seulement 5 fois. Toutes les lettres sont présentes, le plateau tourne parfaitement. La boîte est en excellent état. Parfait cadeau ou pour compléter votre collection. Disponible à Saint-André, récupération uniquement (pas de livraison).',
  condition = 'excellent',
  price = 38.00,
  location_city = 'Saint-André',
  location_quarter = NULL,
  delivery_available = false,
  custom_game_name = 'Scrabble',
  created_at = NOW() - INTERVAL '22 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Scrabble%' AND type = 'sale' 
  LIMIT 1
);

-- Annonce 4 : Blanc Manger Coco - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Blanc Manger Coco - Pack Complet + Extension',
  description = 'Pack complet Blanc Manger Coco avec l''extension "Le Retour". État neuf, encore sous blister d''origine. Acheté il y a 2 mois mais finalement pas utilisé car mes amis préfèrent d''autres types de jeux. Idéal pour les soirées entre amis qui aiment l''humour noir. Prix négociable. Disponible à Saint-Gilles-les-Bains, livraison possible sur la côte ouest.',
  condition = 'new',
  price = 45.00,
  location_city = 'Saint-Gilles-les-Bains',
  location_quarter = NULL,
  delivery_available = true,
  custom_game_name = 'Blanc Manger Coco',
  created_at = NOW() - INTERVAL '5 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Blanc Manger Coco%' AND type = 'sale' 
  LIMIT 1
);

-- Annonce 5 : Les Aventuriers du Rail - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Les Aventuriers du Rail - Europe',
  description = 'Version Europe du célèbre jeu Les Aventuriers du Rail. Tout est présent : cartes, wagons, billets. Bon état général avec quelques cartes légèrement usées aux coins mais parfaitement jouable. Le plateau est en excellent état. Jeu idéal pour 2 à 5 joueurs, durée moyenne 45-60 minutes. Disponible à La Possession, récupération uniquement.',
  condition = 'good',
  price = 35.00,
  location_city = 'La Possession',
  location_quarter = NULL,
  delivery_available = false,
  custom_game_name = 'Les Aventuriers du Rail',
  created_at = NOW() - INTERVAL '12 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Aventuriers du Rail%' AND type = 'sale' 
  LIMIT 1
);

-- =====================================================
-- ÉTAPE 2: Mise à jour des annonces d'ÉCHANGE
-- =====================================================

-- Annonce 6 : Catan - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Catan - Édition Voyageurs (Compact)',
  description = 'Version compacte de Catan, parfaite pour voyager. Complet avec toutes les pièces. État correct avec quelques marques d''usure sur les cartes mais totalement fonctionnel. Je cherche à échanger contre un jeu de stratégie différent, notamment Azul, Splendor, ou 7 Wonders. Ouvert aux propositions ! Disponible à Terre Sainte, Saint-Pierre.',
  condition = 'good',
  location_city = 'Saint-Pierre',
  location_quarter = 'Terre Sainte',
  wanted_game = 'Azul, Splendor, 7 Wonders ou autre jeu de stratégie',
  delivery_available = false,
  custom_game_name = 'Catan',
  created_at = NOW() - INTERVAL '18 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Catan%' AND type = 'exchange' 
  LIMIT 1
);

-- Annonce 7 : Dixit - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Dixit - Jeu de Base + Extension Odyssey',
  description = 'Dixit complet avec l''extension Odyssey. État quasi neuf, utilisé seulement 2 fois lors de soirées. Toutes les cartes sont présentes et en parfait état. La boîte est impeccable. Je cherche à échanger contre Wingspan, Évolution, ou un jeu de déduction comme Mysterium. Disponible à Saint-Louis, livraison possible.',
  condition = 'new',
  location_city = 'Saint-Louis',
  location_quarter = NULL,
  wanted_game = 'Wingspan, Évolution, Mysterium ou jeu de déduction',
  delivery_available = true,
  custom_game_name = 'Dixit',
  created_at = NOW() - INTERVAL '10 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Dixit%' AND type = 'exchange' 
  LIMIT 1
);

-- Annonce 8 : Codenames - Version plus réaliste
UPDATE marketplace_items
SET
  title = 'Codenames + Codenames Duo (2 jeux)',
  description = 'Les deux versions de Codenames : la version classique (4+ joueurs) et Codenames Duo (2 joueurs). Excellent état, très peu utilisé. Parfait pour les soirées entre amis. Je cherche à échanger contre Mysterium, Déception : Murder in Hong Kong, ou un jeu coopératif. Disponible au Port, livraison possible.',
  condition = 'excellent',
  location_city = 'Le Port',
  location_quarter = NULL,
  wanted_game = 'Mysterium, Déception : Murder in Hong Kong, ou jeu coopératif',
  delivery_available = true,
  custom_game_name = 'Codenames',
  created_at = NOW() - INTERVAL '6 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Codenames%' AND type = 'exchange' 
  LIMIT 1
);

-- =====================================================
-- ÉTAPE 3: Mise à jour des annonces de DON
-- =====================================================

-- Annonce 9 : 7 Familles - Version plus réaliste (Vente à prix symbolique)
-- Note: Le type 'donation' n'existe pas, on utilise 'sale' avec un prix très bas
UPDATE marketplace_items
SET
  title = 'Jeu de 7 Familles - Version Classique',
  description = 'Jeu de cartes 7 Familles pour enfants. État correct avec quelques cartes légèrement usées mais toutes présentes et jouables. Parfait pour initier les enfants aux jeux de société. Je le vends à prix symbolique car je n''en ai plus l''utilité. Disponible à Saint-Paul, récupération uniquement.',
  type = 'sale',
  condition = 'fair',
  price = 2.00,
  location_city = 'Saint-Paul',
  location_quarter = NULL,
  delivery_available = false,
  custom_game_name = '7 Familles',
  created_at = NOW() - INTERVAL '25 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%7 Familles%' 
  LIMIT 1
);

-- Annonce 10 : Uno - Version plus réaliste (Vente à prix symbolique)
UPDATE marketplace_items
SET
  title = 'Uno - Version Classique',
  description = 'Jeu de cartes Uno. Quelques cartes présentent des marques d''usure (coins arrondis, légères taches) mais le jeu reste totalement fonctionnel. Toutes les cartes sont présentes. Idéal pour les soirées ou pour quelqu''un qui veut commencer une collection. Disponible à Saint-Benoît, récupération uniquement.',
  type = 'sale',
  condition = 'worn',
  price = 3.00,
  location_city = 'Saint-Benoît',
  location_quarter = NULL,
  delivery_available = false,
  custom_game_name = 'Uno',
  created_at = NOW() - INTERVAL '30 days'
WHERE id IN (
  SELECT id FROM marketplace_items 
  WHERE title LIKE '%Uno%' 
  LIMIT 1
);

-- =====================================================
-- ÉTAPE 4: Ajout d'annonces supplémentaires réalistes
-- =====================================================

-- Note: Ces INSERT ne seront exécutés que si des utilisateurs existent
-- Vous pouvez les décommenter et remplacer 'YOUR_USER_ID_HERE' par un vrai UUID

/*
-- Annonce 11 : Wingspan (Vente)
INSERT INTO marketplace_items (
  title, description, type, condition, price,
  location_city, location_quarter, status, seller_id,
  custom_game_name, delivery_available, created_at
) VALUES (
  'Wingspan - Édition Française',
  'Wingspan en excellent état, joué une dizaine de fois. Toutes les cartes d''oiseaux sont présentes, le plateau est impeccable. Jeu magnifique avec de superbes illustrations. Parfait pour les amateurs de jeux de stratégie et de nature. Disponible à Sainte-Clotilde, Saint-Denis.',
  'sale',
  'excellent',
  55.00,
  'Saint-Denis',
  'Sainte-Clotilde',
  'available',
  (SELECT id FROM auth.users LIMIT 1),
  'Wingspan',
  true,
  NOW() - INTERVAL '7 days'
);

-- Annonce 12 : Azul (Échange)
INSERT INTO marketplace_items (
  title, description, type, condition,
  location_city, location_quarter, status, seller_id,
  custom_game_name, wanted_game, delivery_available, created_at
) VALUES (
  'Azul - Édition Standard',
  'Azul en très bon état, complet. Jeu abstrait magnifique avec des tuiles en céramique. Cherche à échanger contre Splendor, 7 Wonders Duel, ou un jeu de stratégie similaire. Disponible au Chaudron, Saint-Denis.',
  'exchange',
  'good',
  'Saint-Denis',
  'Le Chaudron',
  'available',
  (SELECT id FROM auth.users LIMIT 1),
  'Azul',
  'Splendor, 7 Wonders Duel, ou jeu de stratégie',
  false,
  NOW() - INTERVAL '14 days'
);

-- Annonce 13 : Splendor (Vente)
INSERT INTO marketplace_items (
  title, description, type, condition, price,
  location_city, location_quarter, status, seller_id,
  custom_game_name, delivery_available, created_at
) VALUES (
  'Splendor - Jeu de Base',
  'Splendor en excellent état, très peu utilisé. Toutes les gemmes et cartes sont présentes. Jeu rapide et stratégique, idéal pour 2-4 joueurs. Disponible à La Saline-les-Bains, Saint-Paul.',
  'sale',
  'excellent',
  32.00,
  'Saint-Paul',
  'La Saline-les-Bains',
  'available',
  (SELECT id FROM auth.users LIMIT 1),
  'Splendor',
  true,
  NOW() - INTERVAL '3 days'
);

-- Annonce 14 : Mysterium (Échange)
INSERT INTO marketplace_items (
  title, description, type, condition,
  location_city, location_quarter, status, seller_id,
  custom_game_name, wanted_game, delivery_available, created_at
) VALUES (
  'Mysterium - Édition Française',
  'Mysterium complet avec toutes les cartes vision et indices. État neuf, utilisé seulement 3 fois. Jeu coopératif magnifique avec de superbes illustrations. Cherche à échanger contre Déception : Murder in Hong Kong, ou un jeu de déduction similaire. Disponible à L''Hermitage, Saint-Paul.',
  'exchange',
  'new',
  'Saint-Paul',
  'L''Hermitage',
  'available',
  (SELECT id FROM auth.users LIMIT 1),
  'Mysterium',
  'Déception : Murder in Hong Kong, ou jeu de déduction',
  false,
  NOW() - INTERVAL '9 days'
);

-- Annonce 15 : 7 Wonders (Vente)
INSERT INTO marketplace_items (
  title, description, type, condition, price,
  location_city, location_quarter, status, seller_id,
  custom_game_name, delivery_available, created_at
) VALUES (
  '7 Wonders - Jeu de Base',
  '7 Wonders en bon état général. Quelques cartes présentent des marques d''usure légères mais le jeu est complet et parfaitement jouable. Excellent jeu de stratégie pour 3-7 joueurs. Disponible à Ravine des Cabris, Saint-Pierre.',
  'sale',
  'good',
  40.00,
  'Saint-Pierre',
  'Ravine des Cabris',
  'available',
  (SELECT id FROM auth.users LIMIT 1),
  '7 Wonders',
  false,
  NOW() - INTERVAL '20 days'
);
*/

-- =====================================================
-- ÉTAPE 5: Vérification des mises à jour
-- =====================================================

-- Afficher toutes les annonces mises à jour
SELECT 
  id,
  title,
  type,
  condition,
  price,
  location_city,
  location_quarter,
  delivery_available,
  status,
  created_at
FROM marketplace_items
WHERE status = 'available'
ORDER BY created_at DESC;

-- Statistiques par type
SELECT 
  type,
  COUNT(*) as nombre,
  AVG(price) as prix_moyen,
  MIN(price) as prix_min,
  MAX(price) as prix_max
FROM marketplace_items
WHERE status = 'available' AND type = 'sale'
GROUP BY type;

-- Statistiques par condition
SELECT 
  condition,
  COUNT(*) as nombre
FROM marketplace_items
WHERE status = 'available'
GROUP BY condition
ORDER BY condition;

-- Statistiques par ville
SELECT 
  location_city,
  COUNT(*) as nombre_annonces
FROM marketplace_items
WHERE status = 'available'
GROUP BY location_city
ORDER BY nombre_annonces DESC;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Notes importantes:
-- 1. Ce script met à jour les annonces existantes pour les rendre plus réalistes
-- 2. Les descriptions sont plus détaillées et naturelles
-- 3. Les prix sont cohérents avec le marché des jeux d'occasion
-- 4. Les localisations utilisent de vrais quartiers de La Réunion
-- 5. Les dates de création sont variées pour un aspect plus naturel
-- 6. Les conditions varient entre 'new', 'excellent', 'good', 'fair', 'worn'
-- 7. Les options de livraison sont variées selon les annonces


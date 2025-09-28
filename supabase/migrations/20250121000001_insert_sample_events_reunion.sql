-- Migration pour insérer des événements de jeux de société à La Réunion
-- Ces événements sont des exemples pour peupler la base de données

-- Note: Les creator_id sont des UUIDs fictifs pour l'exemple
-- En production, ils devraient être remplacés par de vrais utilisateurs

INSERT INTO public.events (
  id,
  title,
  description,
  date_time,
  location,
  max_participants,
  current_participants,
  creator_id,
  image_url,
  status
) VALUES 
-- Événement 1: Soirée jeux à Saint-Denis
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Soirée Jeux de Société - Saint-Denis',
  'Venez découvrir de nouveaux jeux de société dans une ambiance conviviale ! Nous aurons des jeux pour tous les niveaux, des classiques aux nouveautés. Snacks et boissons disponibles.',
  '2025-02-15 19:00:00+04',
  'Médiathèque François Mitterrand, Saint-Denis',
  20,
  0,
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
  'active'
),

-- Événement 2: Tournoi Catan à Saint-Pierre
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Tournoi Catan - Saint-Pierre',
  'Tournoi officiel de Catan avec lots à gagner ! Format suisse, 4 parties maximum. Inscription obligatoire. Règles officielles Catan. Matériel fourni.',
  '2025-02-22 14:00:00+04',
  'Centre Culturel Lucet Langenier, Saint-Pierre',
  16,
  0,
  '00000000-0000-0000-0000-000000000002',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  'active'
),

-- Événement 3: Soirée jeux en famille à Le Tampon
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Jeux en Famille - Le Tampon',
  'Soirée spéciale familles avec des jeux adaptés aux enfants et aux parents. De 4 à 99 ans ! Goûter inclus pour les enfants.',
  '2025-02-28 16:00:00+04',
  'Salle des fêtes du Tampon',
  30,
  0,
  '00000000-0000-0000-0000-000000000003',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
  'active'
),

-- Événement 4: Découverte de jeux à Saint-Paul
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Découverte de Jeux Modernes - Saint-Paul',
  'Présentation et test de jeux modernes : Wingspan, Azul, Splendor, 7 Wonders. Parfait pour les débutants curieux !',
  '2025-03-08 18:30:00+04',
  'Bibliothèque municipale de Saint-Paul',
  12,
  0,
  '00000000-0000-0000-0000-000000000004',
  'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
  'active'
),

-- Événement 5: Soirée stratégie à Saint-André
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Soirée Jeux de Stratégie - Saint-André',
  'Pour les amateurs de jeux de stratégie : Twilight Imperium, Scythe, Terraforming Mars. Soirée longue prévue !',
  '2025-03-15 19:00:00+04',
  'Maison des associations, Saint-André',
  8,
  0,
  '00000000-0000-0000-0000-000000000005',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  'active'
),

-- Événement 6: Tournoi Poker à Saint-Benoît
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Tournoi Poker Texas Hold''em - Saint-Benoît',
  'Tournoi de poker amateur avec buy-in de 20€. Règles officielles, croupier expérimenté. Lots pour les 3 premiers.',
  '2025-03-22 20:00:00+04',
  'Salle polyvalente de Saint-Benoît',
  24,
  0,
  '00000000-0000-0000-0000-000000000006',
  'https://images.unsplash.com/photo-1596838132731-3301c0aa9a22?w=800',
  'active'
),

-- Événement 7: Soirée jeux coopératifs à Saint-Louis
(
  '550e8400-e29b-41d4-a716-446655440007',
  'Soirée Jeux Coopératifs - Saint-Louis',
  'Découvrez les jeux où on gagne ensemble ! Pandemic, Forbidden Island, Spirit Island. Ambiance détendue et collaborative.',
  '2025-03-29 18:00:00+04',
  'Centre culturel de Saint-Louis',
  16,
  0,
  '00000000-0000-0000-0000-000000000007',
  'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
  'active'
),

-- Événement 8: Tournoi Échecs à Cilaos
(
  '550e8400-e29b-41d4-a716-446655440008',
  'Tournoi d''Échecs - Cilaos',
  'Tournoi d''échecs en montagne ! Format rapide 15+10. Tous niveaux acceptés. Vue magnifique sur les cirques garantie.',
  '2025-04-05 14:00:00+04',
  'Salle des fêtes de Cilaos',
  20,
  0,
  '00000000-0000-0000-0000-000000000008',
  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800',
  'active'
),

-- Événement 9: Soirée jeux de cartes à Saint-Philippe
(
  '550e8400-e29b-41d4-a716-446655440009',
  'Soirée Jeux de Cartes - Saint-Philippe',
  'Magic, Yu-Gi-Oh!, Pokemon, jeux de cartes classiques... Venez avec vos decks ou découvrez nos jeux !',
  '2025-04-12 19:00:00+04',
  'Maison de quartier de Saint-Philippe',
  18,
  0,
  '00000000-0000-0000-0000-000000000009',
  'https://images.unsplash.com/photo-1596838132731-3301c0aa9a22?w=800',
  'active'
),

-- Événement 10: Grand tournoi final à Saint-Denis
(
  '550e8400-e29b-41d4-a716-446655440010',
  'Grand Tournoi Final - Saint-Denis',
  'Tournoi multi-jeux avec rotation : Catan, 7 Wonders, Azul, Splendor. Champion de La Réunion 2025 !',
  '2025-04-19 10:00:00+04',
  'Palais des Congrès, Saint-Denis',
  32,
  0,
  '00000000-0000-0000-0000-000000000010',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  'active'
);

-- Commentaire sur les événements
COMMENT ON TABLE public.events IS 'Événements de jeux de société à La Réunion - Exemples de données';


-- Migration pour ajouter des profils d'exemple
-- 8 personnes physiques et 2 bars à jeux

-- Insérer les profils de personnes physiques
INSERT INTO public.profiles (id, username, full_name, bio, avatar_url, email, created_at, updated_at) VALUES
-- Personnes physiques
('11111111-1111-1111-1111-111111111111', 'marie_dupont', 'Marie Dupont', 'Passionnée de jeux de stratégie et de coopération. J''adore organiser des soirées jeux entre amis !', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'marie.dupont@example.com', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'pierre_martin', 'Pierre Martin', 'Collectionneur de jeux de société depuis 10 ans. Spécialiste des jeux allemands et des wargames.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'pierre.martin@example.com', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'sophie_bernard', 'Sophie Bernard', 'Maman de 2 enfants, je cherche des jeux familiaux et éducatifs. Toujours partante pour découvrir de nouveaux jeux !', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'sophie.bernard@example.com', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'alex_roux', 'Alex Roux', 'Développeur de jeux vidéo le jour, joueur de jeux de plateau le soir. Fan de jeux narratifs et d''escape games.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'alex.roux@example.com', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'lisa_moreau', 'Lisa Moreau', 'Étudiante en psychologie, je m''intéresse aux jeux qui développent la créativité et la logique. Nouvelle sur l''île !', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'lisa.moreau@example.com', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'thomas_leroy', 'Thomas Leroy', 'Retraité passionné d''histoire, j''adore les jeux historiques et les simulations. Organisateur de tournois de Risk.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'thomas.leroy@example.com', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'julie_petit', 'Julie Petit', 'Professeure des écoles, je cherche des jeux éducatifs pour mes élèves. Spécialiste des jeux coopératifs.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 'julie.petit@example.com', NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'marc_dubois', 'Marc Dubois', 'Ingénieur et père de famille, j''aime les jeux qui se jouent en 30 minutes max. Fan de deck-building et de jeux rapides.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', 'marc.dubois@example.com', NOW(), NOW()),

-- Bars à jeux
('99999999-9999-9999-9999-999999999999', 'le_des_bar', 'Le Dés Bar', 'Bar à jeux de société au cœur de Saint-Denis. Plus de 200 jeux disponibles, ambiance conviviale et boissons artisanales.', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150&h=150&fit=crop', 'contact@ledesbar.re', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cafe_ludique', 'Café Ludique du Sud', 'Café-restaurant spécialisé dans les jeux de société. Menu gourmand et collection de jeux pour tous les âges.', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', 'contact@cafeludique.re', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Ajouter des commentaires pour documenter les profils
COMMENT ON TABLE public.profiles IS 'Table des profils utilisateurs - personnes physiques et établissements';

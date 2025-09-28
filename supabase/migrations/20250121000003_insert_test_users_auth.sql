-- Migration pour créer des utilisateurs de test via l'API d'authentification
-- Cette migration doit être exécutée après avoir créé les utilisateurs via l'API

-- Fonction pour créer un utilisateur de test
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_username TEXT,
  user_full_name TEXT,
  user_bio TEXT,
  user_avatar_url TEXT
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object(
      'full_name', user_full_name,
      'username', user_username,
      'bio', user_bio,
      'avatar_url', user_avatar_url
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Créer le profil correspondant
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    bio,
    avatar_url,
    email,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_username,
    user_full_name,
    user_bio,
    user_avatar_url,
    user_email,
    NOW(),
    NOW()
  );

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les utilisateurs de test
SELECT create_test_user(
  'marie.dupont@example.com',
  'password123',
  'marie_dupont',
  'Marie Dupont',
  'Passionnée de jeux de stratégie et de coopération. J''adore organiser des soirées jeux entre amis !',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'pierre.martin@example.com',
  'password123',
  'pierre_martin',
  'Pierre Martin',
  'Collectionneur de jeux de société depuis 10 ans. Spécialiste des jeux allemands et des wargames.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'sophie.bernard@example.com',
  'password123',
  'sophie_bernard',
  'Sophie Bernard',
  'Maman de 2 enfants, je cherche des jeux familiaux et éducatifs. Toujours partante pour découvrir de nouveaux jeux !',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'alex.roux@example.com',
  'password123',
  'alex_roux',
  'Alex Roux',
  'Développeur de jeux vidéo le jour, joueur de jeux de plateau le soir. Fan de jeux narratifs et d''escape games.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'lisa.moreau@example.com',
  'password123',
  'lisa_moreau',
  'Lisa Moreau',
  'Étudiante en psychologie, je m''intéresse aux jeux qui développent la créativité et la logique. Nouvelle sur l''île !',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'thomas.leroy@example.com',
  'password123',
  'thomas_leroy',
  'Thomas Leroy',
  'Retraité passionné d''histoire, j''adore les jeux historiques et les simulations. Organisateur de tournois de Risk.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'julie.petit@example.com',
  'password123',
  'julie_petit',
  'Julie Petit',
  'Professeure des écoles, je cherche des jeux éducatifs pour mes élèves. Spécialiste des jeux coopératifs.',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'marc.dubois@example.com',
  'password123',
  'marc_dubois',
  'Marc Dubois',
  'Ingénieur et père de famille, j''aime les jeux qui se jouent en 30 minutes max. Fan de deck-building et de jeux rapides.',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
);

SELECT create_test_user(
  'contact@ledesbar.re',
  'password123',
  'le_des_bar',
  'Le Dés Bar',
  'Bar à jeux de société au cœur de Saint-Denis. Plus de 200 jeux disponibles, ambiance conviviale et boissons artisanales.',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150&h=150&fit=crop'
);

SELECT create_test_user(
  'contact@cafeludique.re',
  'password123',
  'cafe_ludique',
  'Café Ludique du Sud',
  'Café-restaurant spécialisé dans les jeux de société. Menu gourmand et collection de jeux pour tous les âges.',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop'
);

-- Nettoyer la fonction temporaire
DROP FUNCTION create_test_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

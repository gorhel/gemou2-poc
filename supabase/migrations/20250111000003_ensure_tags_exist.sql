-- Migration pour s'assurer que les tags prédéfinis existent
-- Cette migration est idempotente et peut être exécutée plusieurs fois

-- Insérer les tags prédéfinis s'ils n'existent pas déjà
INSERT INTO public.tags (name) VALUES
  ('Compétitif'),
  ('Décontracté'),
  ('Famille'),
  ('Expert'),
  ('Débutant'),
  ('Soirée'),
  ('Journée'),
  ('Tournoi'),
  ('Découverte'),
  ('Rapide'),
  ('Stratégie'),
  ('Ambiance'),
  ('Coopératif'),
  ('Party Game'),
  ('Narratif')
ON CONFLICT (name) DO NOTHING;

-- Vérifier et afficher le nombre de tags
DO $$
DECLARE
  tag_count int;
BEGIN
  SELECT COUNT(*) INTO tag_count FROM public.tags;
  RAISE NOTICE 'Nombre de tags dans la base: %', tag_count;
  
  IF tag_count = 0 THEN
    RAISE WARNING 'Aucun tag trouvé dans la base de données!';
  ELSE
    RAISE NOTICE 'Tags disponibles pour utilisation';
  END IF;
END $$;




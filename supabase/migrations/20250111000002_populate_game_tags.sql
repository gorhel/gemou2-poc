-- Migration pour peupler la table game_tags avec des exemples
-- Lie quelques jeux populaires à des tags appropriés

-- Note: Cette migration suppose que des jeux ont déjà été importés dans la table games
-- Les tags sont liés par nom de jeu (via un sous-select)

DO $$
DECLARE
  tag_competitif int;
  tag_decontracte int;
  tag_famille int;
  tag_expert int;
  tag_strategie int;
  tag_ambiance int;
  tag_cooperatif int;
  tag_party int;
BEGIN
  -- Récupérer les IDs des tags (ils existent déjà grâce à la migration précédente)
  SELECT id INTO tag_competitif FROM public.tags WHERE name = 'Compétitif';
  SELECT id INTO tag_decontracte FROM public.tags WHERE name = 'Décontracté';
  SELECT id INTO tag_famille FROM public.tags WHERE name = 'Famille';
  SELECT id INTO tag_expert FROM public.tags WHERE name = 'Expert';
  SELECT id INTO tag_strategie FROM public.tags WHERE name = 'Stratégie';
  SELECT id INTO tag_ambiance FROM public.tags WHERE name = 'Ambiance';
  SELECT id INTO tag_cooperatif FROM public.tags WHERE name = 'Coopératif';
  SELECT id INTO tag_party FROM public.tags WHERE name = 'Party Game';
  
  -- Lier des jeux populaires à leurs tags
  -- Ces insertions ne feront rien si les jeux n'existent pas encore
  
  -- Catan (Stratégie, Famille, Compétitif)
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_strategie FROM public.games WHERE name ILIKE '%catan%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_famille FROM public.games WHERE name ILIKE '%catan%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_competitif FROM public.games WHERE name ILIKE '%catan%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  -- Pandemic (Coopératif, Stratégie, Expert)
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_cooperatif FROM public.games WHERE name ILIKE '%pandemic%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_strategie FROM public.games WHERE name ILIKE '%pandemic%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  -- Codenames (Party Game, Décontracté, Famille)
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_party FROM public.games WHERE name ILIKE '%codenames%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_decontracte FROM public.games WHERE name ILIKE '%codenames%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_famille FROM public.games WHERE name ILIKE '%codenames%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  -- Dobble/Spot It (Ambiance, Décontracté, Famille)
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_ambiance FROM public.games WHERE name ILIKE '%dobble%' OR name ILIKE '%spot%it%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.game_tags (game_id, tag_id)
  SELECT id, tag_decontracte FROM public.games WHERE name ILIKE '%dobble%' OR name ILIKE '%spot%it%' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Tags de jeux peuplés avec succès (si les jeux existent)';
END $$;

-- Commentaire
COMMENT ON TABLE public.game_tags IS 'Liaison entre jeux et tags. Peuplée avec des exemples de jeux populaires et leurs catégories.';





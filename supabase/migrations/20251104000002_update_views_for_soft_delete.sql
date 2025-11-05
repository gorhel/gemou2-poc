-- Migration pour mettre à jour les vues et filtrer les éléments supprimés
-- Date: 04 novembre 2025
-- Description: Mise à jour de la vue marketplace_items_enriched pour exclure les éléments supprimés

-- Supprimer la vue existante pour éviter les conflits de structure
DROP VIEW IF EXISTS public.marketplace_items_enriched;

-- Recréer la vue marketplace_items_enriched avec filtrage des éléments supprimés
-- Structure identique à la migration 20251009120000_add_marketplace_trade_features.sql
CREATE VIEW public.marketplace_items_enriched AS
SELECT 
  mi.*,
  p.username as seller_username,
  p.full_name as seller_full_name,
  p.avatar_url as seller_avatar,
  p.city as seller_city,
  COALESCE(g.name, mi.custom_game_name) as game_name,
  g.photo_url as game_photo,
  g.bgg_id as game_bgg_id,
  g.min_players as game_min_players,
  g.max_players as game_max_players
FROM public.marketplace_items mi
LEFT JOIN public.profiles p ON mi.seller_id = p.id
LEFT JOIN public.games g ON mi.game_id = g.id
WHERE mi.deleted_at IS NULL;  -- Filtrer les éléments supprimés

-- Commentaire pour documentation
COMMENT ON VIEW public.marketplace_items_enriched IS 'Vue enrichie des annonces marketplace actives (non supprimées) avec les informations du vendeur et du jeu.';


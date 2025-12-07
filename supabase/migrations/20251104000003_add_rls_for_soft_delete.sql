-- Migration pour ajouter des politiques RLS pour le soft delete
-- Date: 04 novembre 2025
-- Description: Ajout de politiques RLS pour empêcher la lecture des éléments supprimés

-- Politique pour marketplace_items : empêcher la lecture des éléments supprimés
-- Note: Cette politique s'ajoute aux politiques existantes
DO $$
BEGIN
  -- Supprimer l'ancienne politique si elle existe
  DROP POLICY IF EXISTS "marketplace_items_hide_deleted" ON public.marketplace_items;
  
  -- Créer la nouvelle politique
  CREATE POLICY "marketplace_items_hide_deleted"
    ON public.marketplace_items
    FOR SELECT
    USING (deleted_at IS NULL);

  -- Exception pour les propriétaires : ils peuvent voir leurs propres éléments supprimés
  DROP POLICY IF EXISTS "marketplace_items_owners_see_deleted" ON public.marketplace_items;
  
  CREATE POLICY "marketplace_items_owners_see_deleted"
    ON public.marketplace_items
    FOR SELECT
    USING (seller_id = auth.uid());
END$$;

-- Politique pour events : empêcher la lecture des événements supprimés
DO $$
BEGIN
  -- Supprimer l'ancienne politique si elle existe
  DROP POLICY IF EXISTS "events_hide_deleted" ON public.events;
  
  -- Créer la nouvelle politique
  CREATE POLICY "events_hide_deleted"
    ON public.events
    FOR SELECT
    USING (deleted_at IS NULL);

  -- Exception pour les créateurs : ils peuvent voir leurs propres événements supprimés
  DROP POLICY IF EXISTS "events_creators_see_deleted" ON public.events;
  
  CREATE POLICY "events_creators_see_deleted"
    ON public.events
    FOR SELECT
    USING (creator_id = auth.uid());
END$$;

-- Commentaires pour documentation
COMMENT ON POLICY "marketplace_items_hide_deleted" ON public.marketplace_items IS 
  'Empêche la lecture des annonces supprimées (soft delete). Seuls les propriétaires peuvent voir leurs propres annonces supprimées via la politique "marketplace_items_owners_see_deleted".';

COMMENT ON POLICY "events_hide_deleted" ON public.events IS 
  'Empêche la lecture des événements supprimés (soft delete). Seuls les créateurs peuvent voir leurs propres événements supprimés via la politique "events_creators_see_deleted".';








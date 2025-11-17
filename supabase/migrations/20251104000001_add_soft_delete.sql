-- Migration pour ajouter le soft delete aux annonces et événements
-- Date: 04 novembre 2025
-- Description: Ajout du champ deleted_at pour permettre la suppression logique (soft delete)
--              des annonces marketplace et des événements

-- Ajouter le champ deleted_at à la table marketplace_items
ALTER TABLE public.marketplace_items
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Ajouter le champ deleted_at à la table events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_marketplace_items_deleted_at 
  ON public.marketplace_items(deleted_at) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_deleted_at 
  ON public.events(deleted_at) 
  WHERE deleted_at IS NULL;

-- Créer des vues pour faciliter l'accès aux éléments non supprimés

-- Vue pour marketplace_items non supprimés
CREATE OR REPLACE VIEW public.marketplace_items_active AS
SELECT *
FROM public.marketplace_items
WHERE deleted_at IS NULL;

-- Vue pour events non supprimés
CREATE OR REPLACE VIEW public.events_active AS
SELECT *
FROM public.events
WHERE deleted_at IS NULL;

-- Fonction pour soft delete une annonce marketplace
CREATE OR REPLACE FUNCTION public.soft_delete_marketplace_item(item_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur est le propriétaire
  IF NOT EXISTS (
    SELECT 1 FROM public.marketplace_items
    WHERE id = item_id AND seller_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorisé: vous devez être le propriétaire de cette annonce';
  END IF;

  -- Mettre à jour le champ deleted_at
  UPDATE public.marketplace_items
  SET deleted_at = NOW()
  WHERE id = item_id AND seller_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Fonction pour soft delete un événement
CREATE OR REPLACE FUNCTION public.soft_delete_event(event_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur est le créateur
  IF NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_id AND creator_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorisé: vous devez être le créateur de cet événement';
  END IF;

  -- Mettre à jour le champ deleted_at
  UPDATE public.events
  SET deleted_at = NOW()
  WHERE id = event_id AND creator_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.marketplace_items.deleted_at IS 'Date de suppression logique de l''annonce. NULL si l''annonce est active.';
COMMENT ON COLUMN public.events.deleted_at IS 'Date de suppression logique de l''événement. NULL si l''événement est actif.';
COMMENT ON FUNCTION public.soft_delete_marketplace_item IS 'Supprime logiquement une annonce marketplace (soft delete). Seul le propriétaire peut supprimer son annonce.';
COMMENT ON FUNCTION public.soft_delete_event IS 'Supprime logiquement un événement (soft delete). Seul le créateur peut supprimer son événement.';







-- =====================================================
-- Migration: Correction de la colonne seller_id
-- Date: 2025-10-21
-- Description: Renommer user_id en seller_id si nécessaire
-- =====================================================

-- Vérifier et renommer la colonne si elle s'appelle user_id
DO $$
BEGIN
    -- Si la colonne user_id existe, la renommer en seller_id
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;
        RAISE NOTICE 'Colonne user_id renommée en seller_id';
    END IF;
    
    -- Si la colonne seller_id n'existe pas du tout, la créer
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE marketplace_items ADD COLUMN seller_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Colonne seller_id créée';
    END IF;
END $$;

-- S'assurer que seller_id est bien configuré
ALTER TABLE marketplace_items 
ALTER COLUMN seller_id SET NOT NULL;

-- Recréer l'index si nécessaire
DROP INDEX IF EXISTS idx_marketplace_items_seller_id;
CREATE INDEX idx_marketplace_items_seller_id ON marketplace_items(seller_id);

RAISE NOTICE 'Migration terminée avec succès';






-- =====================================================
-- Migration: Correction de la contrainte conversations_type_check
-- Date: 2025-01-28
-- Description: Ajoute le type 'marketplace' à la contrainte CHECK
--              pour permettre la création de conversations marketplace
-- =====================================================

-- Supprimer l'ancienne contrainte si elle existe
-- Note: Le nom de la contrainte peut varier selon les migrations
-- On essaie les noms possibles
DO $$ 
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Essayer de supprimer la contrainte avec différents noms possibles
  ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_type_check;
  ALTER TABLE conversations DROP CONSTRAINT IF EXISTS check_type_values;
  
  -- Trouver et supprimer toute contrainte CHECK sur la colonne type
  FOR constraint_name_var IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'conversations'
      AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%type%'
  LOOP
    EXECUTE format('ALTER TABLE conversations DROP CONSTRAINT IF EXISTS %I', constraint_name_var);
  END LOOP;
END $$;

-- Recréer la contrainte avec le type 'marketplace' inclus
ALTER TABLE conversations 
ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('direct', 'group', 'event', 'marketplace'));

-- Commentaire pour documentation
COMMENT ON CONSTRAINT conversations_type_check ON conversations IS 
'Contraint les valeurs de type à: direct, group, event, marketplace';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================


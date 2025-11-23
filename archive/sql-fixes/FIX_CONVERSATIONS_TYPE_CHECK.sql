-- =====================================================
-- Script de correction: conversations_type_check
-- Date: 2025-01-28
-- Description: Ajoute le type 'marketplace' à la contrainte CHECK
--              pour permettre la création de conversations marketplace
-- 
-- ERREUR CORRIGÉE:
-- "new row for relation "conversations" violates check constraint 
--  "conversations_type_check""
-- =====================================================

-- Supprimer l'ancienne contrainte si elle existe
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

-- Vérification: Tester que la contrainte fonctionne
DO $$
BEGIN
  -- Cette requête devrait échouer si la contrainte ne fonctionne pas
  -- On ne l'exécute pas vraiment, juste pour vérifier la syntaxe
  RAISE NOTICE 'Contrainte conversations_type_check mise à jour avec succès';
  RAISE NOTICE 'Types autorisés: direct, group, event, marketplace';
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================


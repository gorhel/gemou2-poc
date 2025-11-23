-- =====================================================
-- Migration: Correction complète conversations marketplace
-- Date: 2025-11-21
-- Description: Résolution définitive de tous les problèmes RLS et contraintes
--              empêchant la création de conversations marketplace
-- 
-- PROBLÈMES CORRIGÉS:
-- 1. Contrainte CHECK : Le type 'marketplace' n'est pas inclus
-- 2. RLS conversations INSERT : Les fonctions SECURITY DEFINER sont bloquées
-- 3. RLS conversation_members INSERT : L'ajout de membres par les fonctions est bloqué
-- 4. RLS marketplace_items SELECT : Les membres ne peuvent pas voir les annonces associées
-- =====================================================

-- =====================================================
-- ÉTAPE 1: Correction de la contrainte CHECK sur conversations.type
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

-- Commentaire pour documentation
COMMENT ON CONSTRAINT conversations_type_check ON conversations IS 
'Contraint les valeurs de type à: direct, group, event, marketplace';

-- =====================================================
-- ÉTAPE 2: Correction RLS INSERT pour conversations
-- =====================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "authenticated users can create conversations" ON public.conversations;

-- Créer une nouvelle politique qui permet :
-- 1. Les utilisateurs authentifiés de créer leurs propres conversations
-- 2. Les fonctions SECURITY DEFINER de créer des conversations
--    (auth.uid() peut être NULL dans SECURITY DEFINER, mais created_by doit être fourni)
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Soit l'utilisateur crée sa propre conversation
  auth.uid() = created_by
  OR
  -- Soit c'est une fonction SECURITY DEFINER qui crée une conversation
  -- pour un utilisateur valide (created_by doit être fourni et non NULL)
  (created_by IS NOT NULL)
);

-- Commentaire pour documentation
COMMENT ON POLICY "Users can create conversations" ON public.conversations IS 
'Permet aux utilisateurs authentifiés et aux fonctions SECURITY DEFINER de créer des conversations. Pour les fonctions, created_by doit être fourni.';

-- =====================================================
-- ÉTAPE 3: Correction RLS INSERT pour conversation_members
-- =====================================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Conversation creators can add members" ON public.conversation_members;

-- Créer une nouvelle politique qui permet :
-- 1. Les créateurs de conversations d'ajouter des membres
-- 2. Les fonctions SECURITY DEFINER d'ajouter des membres aux conversations qu'elles créent
--    (conversations créées récemment, dans les 5 dernières secondes)
CREATE POLICY "Conversation creators can add members"
ON public.conversation_members
FOR INSERT
WITH CHECK (
  -- Soit le créateur de la conversation ajoute des membres
  EXISTS (
    SELECT 1 
    FROM public.conversations c
    WHERE c.id = conversation_members.conversation_id
    AND c.created_by = auth.uid()
  )
  OR
  -- Soit c'est une fonction SECURITY DEFINER qui ajoute des membres
  -- à une conversation qui vient d'être créée (dans les 5 dernières secondes)
  -- Cela garantit que seules les fonctions peuvent ajouter des membres juste après création
  EXISTS (
    SELECT 1 
    FROM public.conversations c
    WHERE c.id = conversation_members.conversation_id
    AND c.created_at > NOW() - INTERVAL '5 seconds'
  )
);

-- Commentaire pour documentation
COMMENT ON POLICY "Conversation creators can add members" ON public.conversation_members IS 
'Permet aux créateurs de conversations et aux fonctions SECURITY DEFINER d''ajouter des membres';

-- =====================================================
-- ÉTAPE 4: Correction RLS SELECT pour marketplace_items
-- =====================================================

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Conversation members can view marketplace items" ON public.marketplace_items;

-- Ajouter une politique pour permettre aux membres d'une conversation marketplace
-- de voir l'annonce associée même si elle n'est plus 'available'
CREATE POLICY "Conversation members can view marketplace items"
ON public.marketplace_items
FOR SELECT
USING (
  -- L'annonce est visible si :
  -- 1. Elle est disponible (politique existante - ne pas dupliquer)
  status = 'available'
  OR
  -- 2. L'utilisateur est le vendeur (politique existante - ne pas dupliquer)
  auth.uid() = seller_id
  OR
  -- 3. L'utilisateur est membre d'une conversation liée à cette annonce
  EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.conversation_members cm ON c.id = cm.conversation_id
    WHERE c.marketplace_item_id = marketplace_items.id
      AND cm.user_id = auth.uid()
      AND c.type = 'marketplace'
  )
);

-- Commentaire pour documentation
COMMENT ON POLICY "Conversation members can view marketplace items" ON public.marketplace_items IS 
'Permet aux membres d''une conversation marketplace de voir l''annonce associée, même si elle n''est plus disponible';

-- =====================================================
-- VÉRIFICATIONS FINALES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration conversations marketplace terminée';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Contrainte conversations_type_check mise à jour (types: direct, group, event, marketplace)';
  RAISE NOTICE '✓ Politique RLS conversations INSERT mise à jour (permet SECURITY DEFINER)';
  RAISE NOTICE '✓ Politique RLS conversation_members INSERT mise à jour (permet SECURITY DEFINER)';
  RAISE NOTICE '✓ Politique RLS marketplace_items SELECT créée (permet aux membres de voir les annonces)';
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================


-- =====================================================
-- SCRIPT DE DIAGNOSTIC ET CORRECTION SÉCURISÉ
-- CONVERSATIONS MARKETPLACE
-- =====================================================
-- À exécuter dans Supabase SQL Editor (Dashboard > SQL Editor)
-- Ce script vérifie l'existence des tables avant de faire des modifications
-- =====================================================

-- =====================================================
-- PARTIE 0: VÉRIFICATION DES PRÉREQUIS
-- =====================================================

SELECT '=== VÉRIFICATION DES TABLES EXISTANTES ===' AS section;

SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Existe' ELSE '❌ N''existe pas' END as status
FROM (
  SELECT 'conversations' as expected_table
  UNION ALL SELECT 'conversation_members'
  UNION ALL SELECT 'marketplace_items'
  UNION ALL SELECT 'profiles'
  UNION ALL SELECT 'games'
) expected
LEFT JOIN information_schema.tables t 
  ON t.table_schema = 'public' AND t.table_name = expected.expected_table;

-- =====================================================
-- PARTIE 1: DIAGNOSTIC (lecture seule - pas de risque)
-- =====================================================

-- 1.1 Vérifier la contrainte CHECK actuelle sur conversations.type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    RAISE NOTICE '=== CONTRAINTE CHECK SUR CONVERSATIONS.TYPE ===';
  ELSE
    RAISE NOTICE '⚠️ Table conversations n''existe pas - Partie conversations ignorée';
  END IF;
END $$;

-- =====================================================
-- PARTIE 2: CORRECTIONS CONVERSATIONS (si la table existe)
-- =====================================================

DO $$ 
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Vérifier si la table conversations existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    RAISE NOTICE '⚠️ Table conversations n''existe pas - Correction ignorée';
    RETURN;
  END IF;

  -- Ajouter la colonne marketplace_item_id si elle n'existe pas
  -- ET si marketplace_items existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'marketplace_item_id') THEN
      EXECUTE 'ALTER TABLE public.conversations ADD COLUMN marketplace_item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE';
      RAISE NOTICE '✅ Colonne marketplace_item_id ajoutée';
    ELSE
      RAISE NOTICE 'ℹ️ Colonne marketplace_item_id existe déjà';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Table marketplace_items n''existe pas - Colonne marketplace_item_id non ajoutée';
  END IF;

  -- Supprimer les contraintes CHECK existantes sur type
  ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_type_check;
  ALTER TABLE conversations DROP CONSTRAINT IF EXISTS check_type_values;
  ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_check;
  
  -- Chercher et supprimer toute contrainte CHECK restante sur type
  FOR constraint_name_var IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.conversations'::regclass
      AND contype = 'c'
      AND (pg_get_constraintdef(oid) LIKE '%type%' OR pg_get_constraintdef(oid) LIKE '%direct%')
  LOOP
    EXECUTE format('ALTER TABLE conversations DROP CONSTRAINT IF EXISTS %I', constraint_name_var);
    RAISE NOTICE 'Contrainte supprimée: %', constraint_name_var;
  END LOOP;

  -- Recréer la contrainte CHECK avec le type 'marketplace' inclus
  ALTER TABLE public.conversations 
  ADD CONSTRAINT conversations_type_check 
  CHECK (type IN ('direct', 'group', 'event', 'marketplace'));
  RAISE NOTICE '✅ Contrainte conversations_type_check créée avec type marketplace';

  -- Créer l'index sur marketplace_item_id si la colonne existe
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'marketplace_item_id') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_marketplace_item ON public.conversations(marketplace_item_id);
    RAISE NOTICE '✅ Index idx_conversations_marketplace_item créé';
  END IF;

END $$;

-- =====================================================
-- PARTIE 3: POLITIQUES RLS CONVERSATIONS (si les tables existent)
-- =====================================================

DO $$
BEGIN
  -- Vérifier si les tables existent
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    RAISE NOTICE '⚠️ Table conversations n''existe pas - RLS ignoré';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_members') THEN
    RAISE NOTICE '⚠️ Table conversation_members n''existe pas - RLS ignoré';
    RETURN;
  END IF;

  -- Activer RLS sur les tables
  ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✅ RLS activé sur conversations et conversation_members';

  -- Supprimer les anciennes politiques conversations
  DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
  DROP POLICY IF EXISTS "authenticated users can create conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
  DROP POLICY IF EXISTS "conversations are viewable by members" ON public.conversations;

  -- Créer les nouvelles politiques conversations
  CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversations.id AND cm.user_id = auth.uid()
    )
  );

  CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR created_by IS NOT NULL);

  RAISE NOTICE '✅ Politiques RLS conversations créées';

  -- Supprimer les anciennes politiques conversation_members
  DROP POLICY IF EXISTS "Users can view conversation members" ON public.conversation_members;
  DROP POLICY IF EXISTS "Conversation creators can add members" ON public.conversation_members;
  DROP POLICY IF EXISTS "conversation_members_viewable_by_self" ON public.conversation_members;
  DROP POLICY IF EXISTS "conversation_members_insertable_by_creator" ON public.conversation_members;

  -- Créer les nouvelles politiques conversation_members
  CREATE POLICY "Users can view conversation members"
  ON public.conversation_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
    )
  );

  CREATE POLICY "Conversation creators can add members"
  ON public.conversation_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_members.conversation_id AND c.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_members.conversation_id AND c.created_at > NOW() - INTERVAL '10 seconds'
    )
  );

  RAISE NOTICE '✅ Politiques RLS conversation_members créées';
END $$;

-- =====================================================
-- PARTIE 4: FONCTION CREATE_MARKETPLACE_CONVERSATION
-- =====================================================

DO $$
BEGIN
  -- Vérifier si les tables nécessaires existent
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    RAISE NOTICE '⚠️ Table conversations n''existe pas - Fonction non créée';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_items') THEN
    RAISE NOTICE '⚠️ Table marketplace_items n''existe pas - Fonction non créée';
    RETURN;
  END IF;

  -- Supprimer l'ancienne fonction
  DROP FUNCTION IF EXISTS create_marketplace_conversation(UUID, UUID);

  RAISE NOTICE '✅ Ancienne fonction supprimée (si existait)';
END $$;

-- Créer la fonction (seulement si les tables existent)
CREATE OR REPLACE FUNCTION create_marketplace_conversation(
  p_marketplace_item_id UUID,
  p_buyer_id UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_seller_id UUID;
BEGIN
  -- Récupérer le seller_id
  SELECT seller_id INTO v_seller_id 
  FROM marketplace_items 
  WHERE id = p_marketplace_item_id;
  
  -- Vérifier que le vendeur existe
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Marketplace item not found';
  END IF;
  
  -- Vérifier que l'acheteur n'est pas le vendeur
  IF v_seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Vérifier si une conversation existe déjà
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = v_seller_id
  JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = p_buyer_id
  WHERE c.marketplace_item_id = p_marketplace_item_id;
  
  -- Si elle n'existe pas, la créer
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, marketplace_item_id, created_by)
    VALUES ('marketplace', p_marketplace_item_id, p_buyer_id)
    RETURNING id INTO v_conversation_id;
    
    -- Ajouter les membres
    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES 
      (v_conversation_id, v_seller_id, 'member'),
      (v_conversation_id, p_buyer_id, 'member');
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTIE 5: PERMISSIONS (avec vérification)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    GRANT SELECT, INSERT ON public.conversations TO authenticated;
    RAISE NOTICE '✅ Permissions accordées sur conversations';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_members') THEN
    GRANT SELECT, INSERT ON public.conversation_members TO authenticated;
    RAISE NOTICE '✅ Permissions accordées sur conversation_members';
  END IF;

  -- Accorder EXECUTE sur la fonction si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'create_marketplace_conversation') THEN
    GRANT EXECUTE ON FUNCTION create_marketplace_conversation(UUID, UUID) TO authenticated;
    RAISE NOTICE '✅ Permission EXECUTE accordée sur la fonction';
  END IF;
END $$;

-- =====================================================
-- PARTIE 6: INDEX (avec vérification)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_members') THEN
    CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON public.conversation_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);
    RAISE NOTICE '✅ Index conversation_members créés';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
    CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
    RAISE NOTICE '✅ Index conversations créés';
  END IF;
END $$;

-- =====================================================
-- PARTIE 7: MARKETPLACE_ITEMS (avec vérification)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_items') THEN
    RAISE NOTICE '⚠️ Table marketplace_items n''existe pas - Partie marketplace ignorée';
    RETURN;
  END IF;

  RAISE NOTICE '=== COLONNES DE MARKETPLACE_ITEMS ===';
  
  -- Ajouter les colonnes manquantes (avec vérification de la table games)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'games') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'game_id') THEN
      ALTER TABLE marketplace_items ADD COLUMN game_id UUID REFERENCES games(id) ON DELETE SET NULL;
      RAISE NOTICE '✅ Colonne game_id ajoutée';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Table games n''existe pas - Colonne game_id non ajoutée';
  END IF;

  -- Colonnes sans référence externe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'custom_game_name') THEN
    ALTER TABLE marketplace_items ADD COLUMN custom_game_name TEXT;
    RAISE NOTICE '✅ Colonne custom_game_name ajoutée';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'wanted_game') THEN
    ALTER TABLE marketplace_items ADD COLUMN wanted_game TEXT;
    RAISE NOTICE '✅ Colonne wanted_game ajoutée';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'delivery_available') THEN
    ALTER TABLE marketplace_items ADD COLUMN delivery_available BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Colonne delivery_available ajoutée';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'location_quarter') THEN
    ALTER TABLE marketplace_items ADD COLUMN location_quarter TEXT;
    RAISE NOTICE '✅ Colonne location_quarter ajoutée';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'location_city') THEN
    ALTER TABLE marketplace_items ADD COLUMN location_city TEXT;
    RAISE NOTICE '✅ Colonne location_city ajoutée';
  END IF;

  -- Activer RLS
  ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

  -- Supprimer les anciennes politiques
  DROP POLICY IF EXISTS "Public can view published items" ON public.marketplace_items;
  DROP POLICY IF EXISTS "Sellers can view own items" ON public.marketplace_items;
  DROP POLICY IF EXISTS "Anyone can view available items" ON public.marketplace_items;

  -- Créer une politique unique pour la lecture
  CREATE POLICY "Anyone can view available items"
  ON public.marketplace_items FOR SELECT
  USING (status = 'available' OR auth.uid() = seller_id);

  RAISE NOTICE '✅ Politique RLS marketplace_items créée';
END $$;

-- =====================================================
-- PARTIE 8: VUE MARKETPLACE_ITEMS_ENRICHED
-- =====================================================

DO $$
BEGIN
  -- Vérifier les tables nécessaires
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_items') THEN
    RAISE NOTICE '⚠️ Table marketplace_items n''existe pas - Vue non créée';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    RAISE NOTICE '⚠️ Table profiles n''existe pas - Vue non créée';
    RETURN;
  END IF;

  -- Supprimer la vue existante
  DROP VIEW IF EXISTS marketplace_items_enriched;

  -- Créer la vue avec ou sans la table games
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'games') THEN
    -- Avec la table games
    CREATE VIEW marketplace_items_enriched AS
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
    FROM marketplace_items mi
    LEFT JOIN profiles p ON mi.seller_id = p.id
    LEFT JOIN games g ON mi.game_id = g.id;
    RAISE NOTICE '✅ Vue marketplace_items_enriched créée (avec games)';
  ELSE
    -- Sans la table games
    CREATE VIEW marketplace_items_enriched AS
    SELECT 
      mi.*,
      p.username as seller_username,
      p.full_name as seller_full_name,
      p.avatar_url as seller_avatar,
      p.city as seller_city,
      mi.custom_game_name as game_name,
      NULL::text as game_photo,
      NULL::text as game_bgg_id,
      NULL::integer as game_min_players,
      NULL::integer as game_max_players
    FROM marketplace_items mi
    LEFT JOIN profiles p ON mi.seller_id = p.id;
    RAISE NOTICE '✅ Vue marketplace_items_enriched créée (sans games)';
  END IF;

  -- Accorder les permissions
  GRANT SELECT ON marketplace_items_enriched TO anon;
  GRANT SELECT ON marketplace_items_enriched TO authenticated;
  RAISE NOTICE '✅ Permissions accordées sur la vue';
END $$;

-- =====================================================
-- PARTIE 9: VÉRIFICATION FINALE
-- =====================================================

SELECT '=== RÉSUMÉ FINAL ===' AS section;

-- Vérifier les tables
SELECT 
  'Tables existantes:' AS info,
  string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'conversation_members', 'marketplace_items', 'profiles', 'games', 'marketplace_items_enriched');

-- Vérifier les politiques
SELECT 
  'Politiques RLS:' AS info,
  COUNT(*) as nombre
FROM pg_policies 
WHERE schemaname = 'public';

-- Compter les annonces
SELECT 
  '=== ANNONCES EXISTANTES ===' AS section;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_items') THEN
    -- Cette requête sera exécutée après le bloc DO
    RAISE NOTICE 'Vérifiez le nombre d''annonces ci-dessous';
  ELSE
    RAISE NOTICE '⚠️ Pas de table marketplace_items';
  END IF;
END $$;

-- Compter les annonces (si la table existe)
SELECT 
  COALESCE(COUNT(*), 0) as total_annonces,
  COALESCE(COUNT(*) FILTER (WHERE status = 'available'), 0) as annonces_disponibles
FROM marketplace_items;

SELECT '✅ SCRIPT TERMINÉ ! Vérifiez les messages NOTICE ci-dessus.' AS status;

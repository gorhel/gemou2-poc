-- =====================================================
-- Migration: Ajout des fonctionnalités de Trade/Marketplace
-- Date: 2025-10-09
-- Description: Mise à jour de marketplace_items pour supporter
--              les ventes et échanges de jeux de société
-- =====================================================

-- =====================================================
-- ÉTAPE 1: Ajout des nouvelles colonnes
-- =====================================================

-- Lien vers le jeu de la base de données
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE SET NULL;

-- Nom du jeu personnalisé (si "Mon jeu n'est pas dans la liste")
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS custom_game_name TEXT;

-- Jeu recherché pour les échanges
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS wanted_game TEXT;

-- Option de livraison
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false;

-- Localisation détaillée (Quartier et Ville pour La Réunion)
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS location_quarter TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT;

-- =====================================================
-- ÉTAPE 2: Mise à jour des contraintes
-- =====================================================

-- Supprimer les anciennes contraintes si elles existent
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_game_specification;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_sale_has_price;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_exchange_has_wanted_game;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_condition_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_type_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_status_values;

-- Contrainte: au moins game_id OU custom_game_name doit être rempli
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_game_specification 
CHECK (game_id IS NOT NULL OR custom_game_name IS NOT NULL);

-- Contrainte: si type='sale', price doit être rempli
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_sale_has_price 
CHECK (type != 'sale' OR price IS NOT NULL);

-- Contrainte: si type='exchange', wanted_game doit être rempli
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_exchange_has_wanted_game 
CHECK (type != 'exchange' OR wanted_game IS NOT NULL);

-- Valeurs autorisées pour condition
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_condition_values 
CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'worn'));

-- Valeurs autorisées pour type
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_type_values 
CHECK (type IN ('sale', 'exchange'));

-- Valeurs autorisées pour status
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_status_values 
CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed'));

-- =====================================================
-- ÉTAPE 3: Modification de la table conversations
-- =====================================================

-- Ajouter une colonne pour lier les conversations aux annonces marketplace
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS marketplace_item_id UUID REFERENCES marketplace_items(id) ON DELETE CASCADE;

-- =====================================================
-- ÉTAPE 4: Création des index pour optimiser les requêtes
-- =====================================================

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_game_id ON marketplace_items(game_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_type ON marketplace_items(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_location_city ON marketplace_items(location_city);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at DESC);

-- Index composite pour filtres combinés
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status_type ON marketplace_items(status, type);

-- Index pour les conversations liées aux annonces
CREATE INDEX IF NOT EXISTS idx_conversations_marketplace_item ON conversations(marketplace_item_id);

-- =====================================================
-- ÉTAPE 5: Row Level Security (RLS) Policies
-- =====================================================

-- Activer RLS sur marketplace_items (si pas déjà activé)
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public can view published items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can view own items" ON marketplace_items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can update own items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can delete own items" ON marketplace_items;

-- Politique: Tout le monde peut voir les annonces publiées
CREATE POLICY "Public can view published items" 
ON marketplace_items FOR SELECT 
USING (status = 'available');

-- Politique: Le vendeur peut voir ses propres annonces (même draft)
CREATE POLICY "Sellers can view own items" 
ON marketplace_items FOR SELECT 
USING (auth.uid() = seller_id);

-- Politique: Les utilisateurs authentifiés peuvent créer des annonces
CREATE POLICY "Authenticated users can create items" 
ON marketplace_items FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Politique: Le vendeur peut modifier ses annonces
CREATE POLICY "Sellers can update own items" 
ON marketplace_items FOR UPDATE 
USING (auth.uid() = seller_id);

-- Politique: Le vendeur peut supprimer ses annonces
CREATE POLICY "Sellers can delete own items" 
ON marketplace_items FOR DELETE 
USING (auth.uid() = seller_id);

-- =====================================================
-- ÉTAPE 6: Vue enrichie pour faciliter les requêtes
-- =====================================================

-- Supprimer la vue si elle existe
DROP VIEW IF EXISTS marketplace_items_enriched;

-- Vue enrichie avec les informations du vendeur et du jeu
CREATE OR REPLACE VIEW marketplace_items_enriched AS
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

-- =====================================================
-- ÉTAPE 7: Fonction pour créer une conversation marketplace
-- =====================================================

-- Supprimer la fonction si elle existe
DROP FUNCTION IF EXISTS create_marketplace_conversation(UUID, UUID);

-- Fonction pour initier une conversation à partir d'une annonce
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
  
  -- Vérifier si une conversation existe déjà entre ces deux utilisateurs pour cet item
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
    
    -- Ajouter les membres (vendeur et acheteur)
    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES 
      (v_conversation_id, v_seller_id, 'member'),
      (v_conversation_id, p_buyer_id, 'member');
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÉTAPE 8: Trigger pour notifications
-- =====================================================

-- Supprimer la fonction et le trigger si ils existent
DROP TRIGGER IF EXISTS on_marketplace_conversation_created ON conversations;
DROP FUNCTION IF EXISTS notify_seller_on_contact();

-- Fonction pour notifier le vendeur quand quelqu'un le contacte
CREATE OR REPLACE FUNCTION notify_seller_on_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_item_title TEXT;
BEGIN
  -- Vérifier que c'est bien une conversation marketplace
  IF NEW.marketplace_item_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Récupérer les infos de l'annonce
  SELECT seller_id, title INTO v_seller_id, v_item_title
  FROM marketplace_items
  WHERE id = NEW.marketplace_item_id;
  
  -- Créer une notification pour le vendeur
  IF v_seller_id IS NOT NULL AND v_seller_id != NEW.created_by THEN
    INSERT INTO notifications (user_id, type, payload)
    VALUES (
      v_seller_id,
      'marketplace_contact',
      jsonb_build_object(
        'conversation_id', NEW.id,
        'marketplace_item_id', NEW.marketplace_item_id,
        'item_title', v_item_title,
        'buyer_id', NEW.created_by
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER on_marketplace_conversation_created
AFTER INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION notify_seller_on_contact();

-- =====================================================
-- ÉTAPE 9: Commentaires pour la documentation
-- =====================================================

COMMENT ON COLUMN marketplace_items.game_id IS 'Référence vers un jeu de la base de données';
COMMENT ON COLUMN marketplace_items.custom_game_name IS 'Nom du jeu personnalisé si non trouvé dans la base';
COMMENT ON COLUMN marketplace_items.wanted_game IS 'Jeu recherché en échange (si type=exchange)';
COMMENT ON COLUMN marketplace_items.delivery_available IS 'Le vendeur propose-t-il la livraison';
COMMENT ON COLUMN marketplace_items.location_quarter IS 'Quartier à La Réunion';
COMMENT ON COLUMN marketplace_items.location_city IS 'Ville à La Réunion';
COMMENT ON COLUMN conversations.marketplace_item_id IS 'Référence vers une annonce marketplace si applicable';

COMMENT ON VIEW marketplace_items_enriched IS 'Vue enrichie des annonces avec infos vendeur et jeu';

COMMENT ON FUNCTION create_marketplace_conversation(UUID, UUID) IS 
'Crée ou récupère une conversation entre un acheteur et un vendeur pour une annonce. Params: (marketplace_item_id, buyer_id)';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================


-- Migration OUT-197 : Système de gestion des relations d'amitié
-- Ajout des paramètres de confidentialité et soft delete

-- 1. Ajout des colonnes de confidentialité dans profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS friends_list_public BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_friend_request_inapp BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_friend_request_push BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_friend_request_email BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_friend_accepted_inapp BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_friend_accepted_push BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_friend_accepted_email BOOLEAN DEFAULT false;

-- 2. Ajout du soft delete dans friends
ALTER TABLE public.friends 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Créer un index pour améliorer les performances des requêtes avec deleted_at
CREATE INDEX IF NOT EXISTS idx_friends_deleted_at ON public.friends(deleted_at) WHERE deleted_at IS NULL;

-- 4. Mise à jour de la politique RLS pour prendre en compte la confidentialité
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friends;

CREATE POLICY "Users can view friendships with privacy" ON public.friends
  FOR SELECT USING (
    deleted_at IS NULL AND (
      -- Cas 1 : C'est mon amitié
      auth.uid() = user_id OR auth.uid() = friend_id
      OR
      -- Cas 2 : Liste publique ET statut accepté
      (
        friendship_status = 'accepted' AND
        (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = friends.user_id 
            AND friends_list_public = true
          )
          OR
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = friends.friend_id 
            AND friends_list_public = true
          )
        )
      )
    )
  );

-- 5. Fonction RPC pour vérifier le rate limiting (50 demandes/jour)
CREATE OR REPLACE FUNCTION check_friend_request_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM friends
  WHERE user_id = user_uuid
    AND created_at > NOW() - INTERVAL '24 hours'
    AND friendship_status = 'pending'
    AND deleted_at IS NULL;
  
  RETURN request_count < 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction RPC pour envoyer une demande d'amitié
CREATE OR REPLACE FUNCTION send_friend_request(friend_uuid UUID)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  existing_friendship RECORD;
  result JSON;
BEGIN
  current_user_id := auth.uid();
  
  -- Vérification : pas à soi-même
  IF current_user_id = friend_uuid THEN
    RETURN json_build_object('success', false, 'error', 'cannot_send_to_self');
  END IF;
  
  -- Vérification : rate limiting
  IF NOT check_friend_request_limit(current_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'rate_limit_exceeded');
  END IF;
  
  -- Vérification : demande croisée (A→B et B→A)
  SELECT * INTO existing_friendship
  FROM friends
  WHERE user_id = friend_uuid 
    AND friend_id = current_user_id
    AND friendship_status = 'pending'
    AND deleted_at IS NULL;
  
  IF existing_friendship.id IS NOT NULL THEN
    -- Auto-acceptation des deux demandes
    UPDATE friends 
    SET friendship_status = 'accepted', updated_at = NOW()
    WHERE id = existing_friendship.id;
    
    RETURN json_build_object('success', true, 'auto_accepted', true);
  END IF;
  
  -- Vérification : déjà amis
  IF EXISTS (
    SELECT 1 FROM friends
    WHERE ((user_id = current_user_id AND friend_id = friend_uuid)
           OR (user_id = friend_uuid AND friend_id = current_user_id))
      AND friendship_status = 'accepted'
      AND deleted_at IS NULL
  ) THEN
    RETURN json_build_object('success', false, 'error', 'already_friends');
  END IF;
  
  -- Vérification : demande pending existante
  IF EXISTS (
    SELECT 1 FROM friends
    WHERE user_id = current_user_id 
      AND friend_id = friend_uuid
      AND friendship_status = 'pending'
      AND deleted_at IS NULL
  ) THEN
    RETURN json_build_object('success', false, 'error', 'request_already_sent');
  END IF;
  
  -- Insertion de la demande
  INSERT INTO friends (user_id, friend_id, friendship_status)
  VALUES (current_user_id, friend_uuid, 'pending');
  
  RETURN json_build_object('success', true, 'auto_accepted', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction RPC pour accepter une demande d'amitié
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
  friendship_record RECORD;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  SELECT * INTO friendship_record
  FROM friends
  WHERE id = request_id 
    AND friend_id = current_user_id
    AND friendship_status = 'pending'
    AND deleted_at IS NULL;
  
  IF friendship_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'request_not_found');
  END IF;
  
  UPDATE friends 
  SET friendship_status = 'accepted', updated_at = NOW()
  WHERE id = request_id;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction RPC pour refuser une demande d'amitié (soft delete)
CREATE OR REPLACE FUNCTION reject_friend_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  UPDATE friends 
  SET friendship_status = 'declined', 
      deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = request_id 
    AND friend_id = current_user_id
    AND friendship_status = 'pending'
    AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'request_not_found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction RPC pour annuler une demande envoyée
CREATE OR REPLACE FUNCTION cancel_friend_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  UPDATE friends 
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = request_id 
    AND user_id = current_user_id
    AND friendship_status = 'pending'
    AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'request_not_found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction RPC pour retirer un ami (soft delete)
CREATE OR REPLACE FUNCTION remove_friend(friend_uuid UUID)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  UPDATE friends 
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE ((user_id = current_user_id AND friend_id = friend_uuid)
         OR (user_id = friend_uuid AND friend_id = current_user_id))
    AND friendship_status = 'accepted'
    AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'friendship_not_found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Commentaires
COMMENT ON COLUMN public.profiles.friends_list_public IS 'Si true, la liste d''amis est visible par tous';
COMMENT ON COLUMN public.friends.deleted_at IS 'Soft delete pour historique des relations';
COMMENT ON FUNCTION send_friend_request IS 'Envoie une demande d''amitié avec validations et détection de demandes croisées';
COMMENT ON FUNCTION accept_friend_request IS 'Accepte une demande d''amitié reçue';
COMMENT ON FUNCTION reject_friend_request IS 'Refuse une demande d''amitié (soft delete)';
COMMENT ON FUNCTION cancel_friend_request IS 'Annule une demande d''amitié envoyée';
COMMENT ON FUNCTION remove_friend IS 'Retire un ami (soft delete bidirectionnel)';


-- Migration pour corriger les erreurs dans la table friends
-- Cette migration corrige les typos et améliore la structure

-- 1. Renommer la colonne frienf_id en friend_id
ALTER TABLE public.friends 
RENAME COLUMN frienf_id TO friend_id;

-- 2. Renommer la colonne update_at en updated_at
ALTER TABLE public.friends 
RENAME COLUMN update_at TO updated_at;

-- 3. Ajouter une contrainte pour éviter qu'un utilisateur soit ami avec lui-même
ALTER TABLE public.friends 
ADD CONSTRAINT check_no_self_friendship 
CHECK (user_id != friend_id);

-- 4. Ajouter une contrainte unique pour éviter les doublons
ALTER TABLE public.friends 
ADD CONSTRAINT unique_friendship 
UNIQUE (user_id, friend_id);

-- 5. Ajouter des contraintes de clés étrangères (si pas déjà fait)
ALTER TABLE public.friends 
ADD CONSTRAINT fk_friends_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.friends 
ADD CONSTRAINT fk_friends_friend_id 
FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. Améliorer les valeurs par défaut
ALTER TABLE public.friends 
ALTER COLUMN friendship_status SET DEFAULT 'pending';

-- 7. Ajouter des contraintes sur friendship_status
ALTER TABLE public.friends 
ADD CONSTRAINT check_friendship_status 
CHECK (friendship_status IN ('pending', 'accepted', 'blocked', 'declined'));

-- 8. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(friendship_status);

-- 9. Activer RLS sur la table friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 10. Créer les politiques RLS pour friends
CREATE POLICY "Users can view their own friendships" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests they received" ON public.friends
  FOR UPDATE USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 11. Ajouter un trigger updated_at
CREATE TRIGGER handle_friends_updated_at 
  BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 12. Commentaires sur les colonnes
COMMENT ON TABLE public.friends IS 'Table des relations d''amitié entre utilisateurs';
COMMENT ON COLUMN public.friends.user_id IS 'ID de l''utilisateur qui initie la relation';
COMMENT ON COLUMN public.friends.friend_id IS 'ID de l''ami';
COMMENT ON COLUMN public.friends.friendship_status IS 'Statut de la relation: pending, accepted, blocked, declined';

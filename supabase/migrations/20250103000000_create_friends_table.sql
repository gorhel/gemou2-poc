-- Migration pour créer la table friends
-- Cette migration doit être exécutée AVANT 20250104000002_fix_friends_table.sql
-- Note : Les typos (frienf_id, update_at) sont intentionnelles et seront corrigées dans la migration suivante

-- Créer la table friends avec les colonnes de base
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  frienf_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,  -- Typo intentionnelle, sera corrigée
  friendship_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  update_at timestamptz DEFAULT now() NOT NULL  -- Typo intentionnelle, sera corrigée
);

-- Créer des index de base pour les performances
CREATE INDEX IF NOT EXISTS idx_friends_user_id_basic ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_frienf_id_basic ON public.friends(frienf_id);

-- Activer RLS sur la table friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Créer une politique de base (sera mise à jour dans les migrations suivantes)
CREATE POLICY "Users can view their own friendships basic" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = frienf_id);

-- Commentaire sur la table
COMMENT ON TABLE public.friends IS 'Table des relations d''amitié entre utilisateurs (version initiale)';


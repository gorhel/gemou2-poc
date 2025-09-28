-- Migration OUT-132-2: Ajout des colonnes password et email dans la table profiles
-- Date: 2025-01-12
-- Description: Ajout des colonnes d'authentification dans la table profiles pour OUT-132-2

-- Ajouter les colonnes email et password dans la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Créer un index sur l'email pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Ajouter des contraintes de validation
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Commentaires pour documentation
COMMENT ON COLUMN profiles.email IS 'Adresse email de l\'utilisateur pour l\'authentification';
COMMENT ON COLUMN profiles.password_hash IS 'Hash du mot de passe de l\'utilisateur (bcrypt)';

-- Mettre à jour les politiques RLS si nécessaire
-- Note: Les politiques existantes restent en place
-- La colonne email peut être utilisée pour des requêtes publiques (recherche d'utilisateurs)
-- La colonne password_hash doit rester privée

-- Exemple de politique pour permettre la lecture publique de l'email (optionnel)
-- CREATE POLICY "profiles_email_public_read" ON profiles
-- FOR SELECT USING (true);

-- Exemple de politique pour protéger password_hash (recommandé)
CREATE POLICY "profiles_password_hash_private" ON profiles
FOR ALL USING (auth.uid() = id);

-- Vérification des modifications
DO $$
BEGIN
    -- Vérifier que les colonnes ont été ajoutées
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        RAISE EXCEPTION 'La colonne email n''a pas été ajoutée à la table profiles';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'password_hash'
    ) THEN
        RAISE EXCEPTION 'La colonne password_hash n''a pas été ajoutée à la table profiles';
    END IF;
    
    RAISE NOTICE 'Migration OUT-132-2 terminée avec succès: colonnes email et password_hash ajoutées à profiles';
END $$;

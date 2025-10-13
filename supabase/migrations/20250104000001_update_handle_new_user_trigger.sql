-- Mise à jour du trigger handle_new_user pour sauvegarder tous les champs du profil
-- Cette migration met à jour la fonction pour inclure first_name, last_name, username et email

-- IMPORTANT: Le trigger on_auth_user_created EXISTE DÉJÀ
-- On met seulement à jour la fonction handle_new_user

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username,
    full_name, 
    first_name, 
    last_name, 
    email,
    avatar_url
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Le trigger on_auth_user_created existe déjà et pointe vers cette fonction
-- Pas besoin de le recréer

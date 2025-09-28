-- Migration OUT-132-2: Ajout des colonnes email et password à la table profiles
-- Date: 2024-01-12
-- Branche: OUT-132-2
-- Description: Ajout des colonnes email et password pour l'authentification simplifiée

-- Ajouter la colonne email à la table profiles
alter table public.profiles 
add column email text;

-- Ajouter la colonne password à la table profiles (hashé)
alter table public.profiles 
add column password_hash text;

-- Créer un index unique sur l'email pour éviter les doublons
create unique index if not exists profiles_email_unique_idx 
on public.profiles(email) 
where email is not null;

-- Créer un index sur l'email pour les recherches rapides
create index if not exists profiles_email_idx 
on public.profiles(email);

-- Mettre à jour la fonction handle_new_user pour inclure l'email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Fonction pour vérifier le mot de passe (utilisée côté serveur)
create or replace function public.verify_password(
  user_email text,
  provided_password text
)
returns boolean as $$
declare
  stored_hash text;
begin
  -- Récupérer le hash du mot de passe pour l'email donné
  select password_hash into stored_hash
  from public.profiles
  where email = user_email;
  
  -- Si aucun utilisateur trouvé
  if stored_hash is null then
    return false;
  end if;
  
  -- Ici on utiliserait une fonction de hash comme bcrypt
  -- Pour l'instant, on simule avec une vérification simple
  -- En production, utiliser: select crypt(provided_password, stored_hash) = stored_hash;
  return stored_hash = crypt(provided_password, stored_hash);
end;
$$ language plpgsql security definer;

-- Fonction pour mettre à jour le mot de passe
create or replace function public.update_user_password(
  user_email text,
  new_password text
)
returns boolean as $$
declare
  user_id uuid;
begin
  -- Trouver l'ID de l'utilisateur
  select id into user_id
  from public.profiles
  where email = user_email;
  
  -- Si aucun utilisateur trouvé
  if user_id is null then
    return false;
  end if;
  
  -- Mettre à jour le hash du mot de passe
  -- En production, utiliser: crypt(new_password, gen_salt('bf'))
  update public.profiles
  set password_hash = crypt(new_password, gen_salt('bf'))
  where id = user_id;
  
  return true;
end;
$$ language plpgsql security definer;

-- Mettre à jour les politiques RLS pour permettre la lecture de l'email
-- (nécessaire pour l'authentification)

-- Politique pour permettre aux utilisateurs de voir leur propre email
create policy "Users can view their own email" on public.profiles
  for select using (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur email
create policy "Users can update their own email" on public.profiles
  for update using (auth.uid() = id);

-- Commentaires sur les colonnes
comment on column public.profiles.email is 'Adresse email de l''utilisateur (unique)';
comment on column public.profiles.password_hash is 'Hash du mot de passe utilisateur (bcrypt)';

-- Mise à jour du trigger updated_at pour inclure les nouvelles colonnes
-- Le trigger existant fonctionne déjà car il met à jour updated_at sur toute modification

-- Ajouter des contraintes de validation
alter table public.profiles 
add constraint profiles_email_format_check 
check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Contrainte pour s'assurer que le hash du mot de passe a au moins 60 caractères (bcrypt standard)
alter table public.profiles 
add constraint profiles_password_hash_length_check 
check (password_hash is null or length(password_hash) >= 60);

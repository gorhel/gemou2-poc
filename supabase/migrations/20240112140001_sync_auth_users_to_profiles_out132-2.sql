-- Migration OUT-132-2: Synchronisation des données auth.users vers profiles
-- Date: 2024-01-12
-- Branche: OUT-132-2
-- Description: Synchroniser les emails des utilisateurs existants de auth.users vers profiles

-- Mettre à jour les profils existants avec les emails de auth.users
update public.profiles 
set email = au.email
from auth.users au
where public.profiles.id = au.id 
and public.profiles.email is null;

-- Fonction pour synchroniser un utilisateur spécifique
create or replace function public.sync_user_email(user_uuid uuid)
returns void as $$
begin
  update public.profiles 
  set email = (
    select email 
    from auth.users 
    where id = user_uuid
  )
  where id = user_uuid
  and email is null;
end;
$$ language plpgsql security definer;

-- Fonction pour synchroniser tous les utilisateurs
create or replace function public.sync_all_users_email()
returns integer as $$
declare
  updated_count integer;
begin
  update public.profiles 
  set email = au.email
  from auth.users au
  where public.profiles.id = au.id 
  and public.profiles.email is null;
  
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql security definer;

-- Exécuter la synchronisation initiale
select public.sync_all_users_email();

-- Créer une vue pour les utilisateurs avec informations complètes
create or replace view public.user_profiles_complete as
select 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.email,
  p.created_at,
  p.updated_at,
  au.email_verified,
  au.last_sign_in_at,
  au.created_at as auth_created_at
from public.profiles p
left join auth.users au on p.id = au.id;

-- Politique RLS pour la vue
create policy "Users can view their own complete profile" on public.user_profiles_complete
  for select using (auth.uid() = id);

-- Fonction pour obtenir le profil complet d'un utilisateur
create or replace function public.get_user_profile(user_email text)
returns table(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  email text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  email_verified boolean,
  last_sign_in_at timestamp with time zone
) as $$
begin
  return query
  select 
    upc.id,
    upc.username,
    upc.full_name,
    upc.avatar_url,
    upc.bio,
    upc.email,
    upc.created_at,
    upc.updated_at,
    upc.email_verified,
    upc.last_sign_in_at
  from public.user_profiles_complete upc
  where upc.email = user_email;
end;
$$ language plpgsql security definer;

-- Fonction pour vérifier si un email existe déjà
create or replace function public.email_exists(check_email text)
returns boolean as $$
begin
  return exists(
    select 1 
    from public.profiles 
    where email = check_email
  );
end;
$$ language plpgsql security definer;

-- Commentaires
comment on function public.sync_user_email(uuid) is 'Synchronise l''email d''un utilisateur spécifique depuis auth.users';
comment on function public.sync_all_users_email() is 'Synchronise tous les emails depuis auth.users vers profiles';
comment on view public.user_profiles_complete is 'Vue complète des profils utilisateurs avec informations auth';
comment on function public.get_user_profile(text) is 'Récupère le profil complet d''un utilisateur par email';
comment on function public.email_exists(text) is 'Vérifie si un email existe déjà dans la base';

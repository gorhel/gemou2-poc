-- Migration pour ajouter les colonnes password et email à la table profiles
-- Dans le cadre de la branche OUT-132-2

-- Ajouter la colonne email à la table profiles
alter table public.profiles 
add column email text;

-- Ajouter la colonne password à la table profiles
alter table public.profiles 
add column password text;

-- Ajouter des contraintes pour l'email
alter table public.profiles 
add constraint profiles_email_unique unique (email);

-- Ajouter un index pour améliorer les performances sur l'email
create index idx_profiles_email on public.profiles (email);

-- Mettre à jour les politiques RLS pour inclure les nouvelles colonnes
-- Les utilisateurs peuvent voir leur propre email et password
create policy "Users can view their own email and password." on public.profiles
  for select using (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre email et password
create policy "Users can update their own email and password." on public.profiles
  for update using (auth.uid() = id);

-- Commentaire sur les colonnes ajoutées
comment on column public.profiles.email is 'Adresse email de l''utilisateur';
comment on column public.profiles.password is 'Mot de passe hashé de l''utilisateur';

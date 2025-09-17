-- Migration pour l'issue OUT-123: Mise à jour du schéma de base de données
-- Intègre le modèle de données de l'issue (utilisateurs, événements, inscriptions, messages, évaluations, jeux)
-- avec les extensions avancées (conversations, contacts, notifications, marketplace, tags, etc.)
-- pour une app de gestion d'événements de jeux de société.

-- 0) Ajustements sur profiles (basés sur issue OUT-123)
ALTER TABLE public.profiles
  ADD COLUMN full_name text,
  ADD COLUMN first_name text,
  ADD COLUMN last_name text,
  ADD COLUMN city text,
  ADD COLUMN bio text,
  ADD COLUMN level integer DEFAULT 1,
  ADD COLUMN favorite_games jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN profile_photo_url text;

-- 1) Ajustements sur events (ajouts de la proposition + issue)
ALTER TABLE public.events
  ADD COLUMN capacity integer,
  ADD COLUMN price decimal(10,2),
  ADD COLUMN visibility text DEFAULT 'public' CHECK (visibility IN ('public','private','approval')),
  ADD COLUMN latitude double precision,
  ADD COLUMN longitude double precision,
  ADD COLUMN status text DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  ADD COLUMN game_types jsonb DEFAULT '[]'::jsonb,  -- Liste de types/jeux pour l'événement
  ADD COLUMN event_photo_url text;

-- Liaison événements-jeux (plusieurs-à-plusieurs, comme dans issue)
CREATE TABLE public.event_games (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, game_id)
);

-- 2) event_applications (inscriptions, granulaire comme proposition)
CREATE TABLE IF NOT EXISTS public.event_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','waitlist')),
  answers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (event_id, user_id)
);
-- Migration des anciens participants vers applications si besoin
-- INSERT INTO event_applications (event_id, user_id, status) SELECT event_id, user_id, 'approved' FROM event_participants;

-- 3) Conversations & messages (évolution des messages plats de l'issue)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('direct','group','event')),
  event_id uuid REFERENCES public.events(id),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member','admin')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id),
  content text,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4) Reviews (évaluations, étendu à users/events/items)
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_type text CHECK (subject_type IN ('user','event','item')) NOT NULL,
  subject_id uuid NOT NULL,
  author_id uuid REFERENCES public.profiles(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON public.reviews (subject_type, subject_id);

-- 5) Games & user_games (jeux, avec favoris via state='favorite')
CREATE TABLE IF NOT EXISTS public.games (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  bgg_id text,
  name text NOT NULL,
  description text,
  min_players int,
  max_players int,
  duration_min int,
  photo_url text,
  data jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.user_games (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  state text CHECK (state IN ('owned','wishlist','lent','favorite')) DEFAULT 'owned',
  condition text,
  notes text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, game_id, state)
);

-- 6) Autres tables de la proposition (enrichissement MVP)
-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'requested' CHECK (status IN ('requested','accepted','blocked')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, contact_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON public.notifications (user_id, read_at);

-- Marketplace (pour échanges de jeux/items)
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price decimal(10,2),
  type text NOT NULL CHECK (type IN ('sale','exchange','donation')),
  condition text CHECK (condition IN ('new','like_new','good','fair','poor')),
  seller_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'available' CHECK (status IN ('available','sold','reserved')),
  images text[] DEFAULT '{}',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags (pour taxonomie, ex. types de jeux)
CREATE TABLE IF NOT EXISTS public.tags (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_tags (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

-- Index pour performances (minimum, comme proposition)
CREATE INDEX ON public.events (date_time);
CREATE INDEX ON public.events USING GIST (ll_to_earth(latitude, longitude));  -- Pour recherches géo (extension cube/earthdistance si besoin)
CREATE INDEX ON public.event_applications (event_id, status);
CREATE INDEX ON public.marketplace_items (type, status, created_at);
CREATE INDEX ON public.messages (conversation_id, created_at);

-- RLS (principes, activer via Supabase dashboard ou SQL)
-- Exemples :
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public events readable" ON public.events FOR SELECT USING (visibility = 'public');
CREATE POLICY "Private events for members" ON public.events FOR SELECT USING (visibility != 'public' AND (auth.uid() = organizer_id OR auth.uid() IN (SELECT user_id FROM event_applications WHERE event_id = id)));
-- Similaire pour autres tables (event_applications, conversations, etc.)
-- Note: Les RLS complets doivent être configurés dans le dashboard Supabase pour toutes les tables.
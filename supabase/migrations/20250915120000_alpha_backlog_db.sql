-- Alpha Backlog DB adaptation
-- Safe to run on empty POC database

-- 1) EVENTS: capacity, price, visibility, geo
alter table if exists public.events
  add column if not exists capacity integer,
  add column if not exists price decimal(10,2),
  add column if not exists visibility text default 'public' check (visibility in ('public','private','approval')),
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- 2) Event applications (candidatures)
create table if not exists public.event_applications (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id),
  status text default 'pending' check (status in ('pending','approved','rejected','waitlist')),
  answers jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

-- 3) Conversations & messages_v2
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('direct','group','event')),
  event_id uuid references public.events(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('member','admin')),
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages_v2 (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  content text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4) Contacts (communauté minimale)
create table if not exists public.contacts (
  user_id uuid references public.profiles(id) on delete cascade,
  contact_id uuid references public.profiles(id) on delete cascade,
  status text default 'requested' check (status in ('requested','accepted','blocked')),
  created_at timestamptz default now(),
  primary key (user_id, contact_id)
);

-- 5) Notifications (centre in-app)
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists notifications_user_read_idx on public.notifications (user_id, read_at);

-- 6) Marketplace: assurer PK + champs utiles
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'marketplace_items' and column_name = 'id'
  ) then
    alter table public.marketplace_items add column id uuid default uuid_generate_v4();
    alter table public.marketplace_items add primary key (id);
  end if;
end $$;

-- étendre valeurs et champs si absents
alter table if exists public.marketplace_items
  add column if not exists location text;

-- 7) Bibliothèque de jeux (collection)
create table if not exists public.games (
  id uuid default uuid_generate_v4() primary key,
  bgg_id text,
  name text not null,
  min_players int,
  max_players int,
  duration_min int,
  data jsonb default '{}'::jsonb
);

create table if not exists public.user_games (
  user_id uuid references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  state text check (state in ('owned','wishlist','lent')) default 'owned',
  condition text,
  notes text,
  created_at timestamptz default now(),
  primary key (user_id, game_id, state)
);

-- 8) Avis / réputation (MVP)
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  subject_type text check (subject_type in ('user','event','item')) not null,
  subject_id uuid not null,
  author_id uuid references public.profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
create index if not exists reviews_subject_idx on public.reviews (subject_type, subject_id);

-- 9) Tags simples pour événements
create table if not exists public.tags (
  id serial primary key,
  name text unique not null
);

create table if not exists public.event_tags (
  event_id uuid references public.events(id) on delete cascade,
  tag_id int references public.tags(id) on delete cascade,
  primary key (event_id, tag_id)
);

-- 10) Index utiles
create index if not exists events_datetime_idx on public.events (date_time);
-- Optionnel: index géo selon besoin (cube/earthdistance) non inclus ici

-- RLS à configurer ultérieurement par table selon app (lecture publique vs privée)




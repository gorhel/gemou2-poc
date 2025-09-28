-- Migration pour synchroniser le cloud avec le local
-- Cette migration ne crée que les tables qui n'existent pas

-- 1. Vérifier et créer profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TABLE public.profiles (
            id uuid references auth.users not null primary key,
            username text unique,
            full_name text,
            first_name text,
            last_name text,
            city text,
            avatar_url text,
            bio text,
            level integer DEFAULT 1,
            favorite_games jsonb DEFAULT '[]'::jsonb,
            profile_photo_url text,
            email text,
            password text,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        RAISE NOTICE 'Table profiles créée';
    ELSE
        RAISE NOTICE 'Table profiles existe déjà';
    END IF;
END $$;

-- 2. Vérifier et créer events si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
        CREATE TABLE public.events (
            id uuid default uuid_generate_v4() primary key,
            title text not null,
            description text,
            date_time timestamp with time zone not null,
            location text not null,
            capacity integer,
            max_participants integer,
            current_participants integer default 0,
            creator_id uuid references public.profiles(id),
            price decimal(10,2),
            visibility text DEFAULT 'public' CHECK (visibility IN ('public','private','approval')),
            latitude double precision,
            longitude double precision,
            status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'open', 'closed')),
            game_types jsonb DEFAULT '[]'::jsonb,
            image_url text,
            event_photo_url text,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        RAISE NOTICE 'Table events créée';
    ELSE
        RAISE NOTICE 'Table events existe déjà';
    END IF;
END $$;

-- 3. Vérifier et créer event_participants si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_participants' AND table_schema = 'public') THEN
        CREATE TABLE public.event_participants (
            id uuid default uuid_generate_v4() primary key,
            event_id uuid references public.events(id) on delete cascade,
            user_id uuid references public.profiles(id),
            status text default 'registered' check (status in ('registered', 'attended', 'cancelled')),
            joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
            unique(event_id, user_id)
        );
        RAISE NOTICE 'Table event_participants créée';
    ELSE
        RAISE NOTICE 'Table event_participants existe déjà';
    END IF;
END $$;

-- 4. Vérifier et créer messages si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        CREATE TABLE public.messages (
            id uuid default uuid_generate_v4() primary key,
            content text not null,
            sender_id uuid references public.profiles(id),
            receiver_id uuid references public.profiles(id), -- NULL for group chat
            event_id uuid references public.events(id), -- NULL for private message
            conversation_id uuid references public.conversations(id),
            attachments jsonb DEFAULT '[]'::jsonb,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        RAISE NOTICE 'Table messages créée';
    ELSE
        RAISE NOTICE 'Table messages existe déjà';
    END IF;
END $$;

-- 5. Vérifier et créer marketplace_items si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_items' AND table_schema = 'public') THEN
        CREATE TABLE public.marketplace_items (
            id uuid default uuid_generate_v4() primary key,
            title text not null,
            description text,
            price decimal(10,2),
            type text not null check (type in ('sale', 'exchange', 'donation')),
            category text,
            condition text check (condition in ('new', 'like_new', 'good', 'fair', 'poor')),
            seller_id uuid references public.profiles(id),
            images text[], -- Array of image URLs
            status text default 'available' check (status in ('available', 'sold', 'reserved')),
            location text,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        RAISE NOTICE 'Table marketplace_items créée';
    ELSE
        RAISE NOTICE 'Table marketplace_items existe déjà';
    END IF;
END $$;

-- 6. Vérifier et créer les autres tables si elles n'existent pas
DO $$ 
BEGIN
    -- event_applications
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_applications' AND table_schema = 'public') THEN
        CREATE TABLE public.event_applications (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
            user_id uuid REFERENCES public.profiles(id),
            status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','waitlist')),
            answers jsonb DEFAULT '{}'::jsonb,
            created_at timestamptz DEFAULT now(),
            UNIQUE (event_id, user_id)
        );
        RAISE NOTICE 'Table event_applications créée';
    END IF;

    -- conversations
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        CREATE TABLE public.conversations (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            type text NOT NULL CHECK (type IN ('direct','group','event')),
            event_id uuid REFERENCES public.events(id),
            created_by uuid REFERENCES public.profiles(id),
            created_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'Table conversations créée';
    END IF;

    -- conversation_members
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_members' AND table_schema = 'public') THEN
        CREATE TABLE public.conversation_members (
            conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            role text DEFAULT 'member' CHECK (role IN ('member','admin')),
            joined_at timestamptz DEFAULT now(),
            PRIMARY KEY (conversation_id, user_id)
        );
        RAISE NOTICE 'Table conversation_members créée';
    END IF;

    -- reviews
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        CREATE TABLE public.reviews (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            subject_type text CHECK (subject_type IN ('user','event','item')) NOT NULL,
            subject_id uuid NOT NULL,
            author_id uuid REFERENCES public.profiles(id),
            rating int CHECK (rating BETWEEN 1 AND 5),
            comment text,
            created_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'Table reviews créée';
    END IF;

    -- games
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games' AND table_schema = 'public') THEN
        CREATE TABLE public.games (
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
        RAISE NOTICE 'Table games créée';
    END IF;

    -- user_games (structure de base, sera complétée par les données cloud)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_games' AND table_schema = 'public') THEN
        CREATE TABLE public.user_games (
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
            state text CHECK (state IN ('owned','wishlist','lent','favorite')) DEFAULT 'owned',
            condition text,
            notes text,
            created_at timestamptz DEFAULT now(),
            PRIMARY KEY (user_id, game_id, state)
        );
        RAISE NOTICE 'Table user_games créée';
    END IF;

    -- contacts
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
        CREATE TABLE public.contacts (
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            contact_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            status text DEFAULT 'requested' CHECK (status IN ('requested','accepted','blocked')),
            created_at timestamptz DEFAULT now(),
            PRIMARY KEY (user_id, contact_id)
        );
        RAISE NOTICE 'Table contacts créée';
    END IF;

    -- notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            type text NOT NULL,
            payload jsonb NOT NULL,
            read_at timestamptz,
            created_at timestamptz DEFAULT now()
        );
        RAISE NOTICE 'Table notifications créée';
    END IF;

    -- tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags' AND table_schema = 'public') THEN
        CREATE TABLE public.tags (
            id serial PRIMARY KEY,
            name text UNIQUE NOT NULL
        );
        RAISE NOTICE 'Table tags créée';
    END IF;

    -- event_tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_tags' AND table_schema = 'public') THEN
        CREATE TABLE public.event_tags (
            event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
            tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
            PRIMARY KEY (event_id, tag_id)
        );
        RAISE NOTICE 'Table event_tags créée';
    END IF;

    RAISE NOTICE 'Toutes les tables vérifiées et créées si nécessaire';
END $$;

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

RAISE NOTICE 'Migration de synchronisation terminée avec succès !';

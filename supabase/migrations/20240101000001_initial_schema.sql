-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date_time timestamp with time zone not null,
  location text not null,
  max_participants integer,
  current_participants integer default 0,
  creator_id uuid references public.profiles(id),
  image_url text,
  status text default 'active' check (status in ('active', 'cancelled', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_participants table
create table public.event_participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id),
  status text default 'registered' check (status in ('registered', 'attended', 'cancelled')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id), -- NULL for group chat
  event_id uuid references public.events(id), -- NULL for private message
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create marketplace_items table
create table public.marketplace_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2),
  type text not null check (type in ('sale', 'exchange')),
  category text,
  condition text check (condition in ('new', 'like_new', 'good', 'fair')),
  seller_id uuid references public.profiles(id),
  images text[], -- Array of image URLs
  status text default 'available' check (status in ('available', 'sold', 'reserved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.messages enable row level security;
alter table public.marketplace_items enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Events policies
create policy "Events are viewable by everyone." on public.events
  for select using (true);

create policy "Authenticated users can create events." on public.events
  for insert to authenticated with check (auth.uid() = creator_id);

create policy "Event creators can update their events." on public.events
  for update using (auth.uid() = creator_id);

-- Event participants policies
create policy "Event participants are viewable by everyone." on public.event_participants
  for select using (true);

create policy "Authenticated users can join events." on public.event_participants
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own participation." on public.event_participants
  for update using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages they sent or received." on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert their own messages." on public.messages
  for insert with check (auth.uid() = sender_id);

-- Marketplace policies
create policy "Marketplace items are viewable by everyone." on public.marketplace_items
  for select using (true);

create policy "Authenticated users can create marketplace items." on public.marketplace_items
  for insert to authenticated with check (auth.uid() = seller_id);

create policy "Sellers can update their own items." on public.marketplace_items
  for update using (auth.uid() = seller_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.events
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.marketplace_items
  for each row execute procedure public.handle_updated_at();

-- Create function to handle new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
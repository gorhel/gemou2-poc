-- Ajout d'un suivi historisé des actions des participants

alter table event_participants
  add column if not exists action_at timestamptz not null default timezone('utc', now());

create table if not exists event_participant_actions (
  id uuid not null default gen_random_uuid() primary key,
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  action text not null check (action in ('joined', 'left')),
  action_at timestamptz not null default timezone('utc', now())
);

create index if not exists event_participant_actions_event_id_idx
  on event_participant_actions (event_id, action_at desc);

create index if not exists event_participant_actions_user_id_idx
  on event_participant_actions (user_id, action_at desc);



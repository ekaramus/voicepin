-- profiles

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- conversations

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('self', 'direct')),
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- conversation_members

create table if not exists conversation_members (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- messages

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid
    references conversations(id)
    on delete cascade,

  sender_id uuid
    references auth.users(id)
    on delete cascade,

  audio_path text not null,
  duration_ms integer not null,
  transcript text,

  created_at timestamptz default now()
);
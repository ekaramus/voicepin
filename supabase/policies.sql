-- Enable RLS

alter table profiles enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;

-- Clean old policies

drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

drop policy if exists "Users can read own memberships" on conversation_members;
drop policy if exists "Users can insert own memberships" on conversation_members;
drop policy if exists "Users can add members to conversations they created" on conversation_members;

drop policy if exists "Users can read conversations they belong to" on conversations;
drop policy if exists "Users can read conversations they own or belong to" on conversations;
drop policy if exists "Users can insert conversations" on conversations;
drop policy if exists "Users can insert own conversations" on conversations;

drop policy if exists "Users can read messages in own conversations" on messages;
drop policy if exists "Users can insert messages in own conversations" on messages;

drop policy if exists "Authenticated users can upload voice messages" on storage.objects;
drop policy if exists "Authenticated users can read voice messages" on storage.objects;
drop policy if exists "Public can read voice messages" on storage.objects;

drop policy if exists "Authenticated users can find profiles by email" on profiles;

-- Profiles

create policy "Users can read own profile"
on profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Allow finding users by email (MVP tradeoff)

create policy "Authenticated users can find profiles by email"
on profiles
for select
to authenticated
using (true);

-- Conversation members

create policy "Users can read own memberships"
on conversation_members
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own memberships"
on conversation_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can add members to conversations they created"
on conversation_members
for insert
to authenticated
with check (
  exists (
    select 1
    from conversations
    where conversations.id = conversation_members.conversation_id
    and conversations.created_by = auth.uid()
  )
);

-- Conversations

create policy "Users can read conversations they own or belong to"
on conversations
for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1
    from conversation_members
    where conversation_members.conversation_id = conversations.id
    and conversation_members.user_id = auth.uid()
  )
);

create policy "Users can insert own conversations"
on conversations
for insert
to authenticated
with check (created_by = auth.uid());

-- Messages

create policy "Users can read messages in own conversations"
on messages
for select
to authenticated
using (
  exists (
    select 1
    from conversation_members
    where conversation_members.conversation_id = messages.conversation_id
    and conversation_members.user_id = auth.uid()
  )
);

create policy "Users can insert messages in own conversations"
on messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from conversation_members
    where conversation_members.conversation_id = messages.conversation_id
    and conversation_members.user_id = auth.uid()
  )
);

-- Storage (voice messages)

create policy "Authenticated users can upload voice messages"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'voice-messages');

create policy "Authenticated users can read voice messages"
on storage.objects
for select
to authenticated
using (bucket_id = 'voice-messages');

-- Optional (if bucket is public)

create policy "Public can read voice messages"
on storage.objects
for select
to anon
using (bucket_id = 'voice-messages');
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;

drop policy if exists "Allow public message inserts for MVP" on messages;
drop policy if exists "Allow public message reads for MVP" on messages;

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

create policy "Users can read conversations they belong to"
on conversations
for select
to authenticated
using (
  exists (
    select 1
    from conversation_members
    where conversation_members.conversation_id = conversations.id
    and conversation_members.user_id = auth.uid()
  )
);

create policy "Users can insert conversations"
on conversations
for insert
to authenticated
with check (true);

create policy "Users can read messages in own conversations"
on messages
for select
to authenticated
using (
  exists (
    select 1
    from conversation_members
    where conversation_members.conversation_id = messages.conversation_id::uuid
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
    where conversation_members.conversation_id = messages.conversation_id::uuid
    and conversation_members.user_id = auth.uid()
  )
);
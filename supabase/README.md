# Supabase Setup

This folder documents the Supabase backend setup for VoicePin.

It exists so the backend structure, security rules, and realtime configuration are visible in Git and can be recreated in a fresh Supabase project.

---

## Setup order

For a fresh Supabase project, run the SQL files in this order:

```txt
1. schema.sql
2. functions.sql
3. policies.sql
4. realtime.sql
```

Recommended place to run them:

```txt
Supabase Dashboard → SQL Editor
```

---

## Files

### `schema.sql`

Defines database structure:

- tables
- columns
- constraints
- indexes

This includes core tables such as:

- `profiles`
- `conversations`
- `conversation_members`
- `messages`

It also includes important fields such as:

- `conversations.direct_pair_key`
- `messages.transcription_status`

---

### `functions.sql`

Defines narrow RPC helpers used by the app:

- `find_profile_by_email(text)`
- `get_profiles_by_ids(uuid[])`

These replace broad profile read access while keeping direct conversation lookup possible.

---

### `policies.sql`

Defines Row Level Security policies and storage access rules.

This file controls:

- who can read profiles
- who can create conversations
- who can read conversations
- who can insert messages
- who can upload/read voice message audio
- how user-owned data is protected

This is one of the most important files in the project because VoicePin depends on Supabase RLS for privacy.

---

### `realtime.sql`

Documents realtime setup.

Currently used for message updates, especially:

- new messages
- transcript status changes
- transcript availability after ElevenLabs processing

The main expected realtime setup is:

```sql
alter publication supabase_realtime add table messages;
```

If Supabase says the table is already part of the publication, that is fine.

---

## Storage setup

Create a storage bucket:

```txt
voice-messages
```

Current MVP expectation:

- authenticated users can upload voice messages
- authenticated users can read voice messages

Before wider production use, consider moving to:

- private bucket
- signed URLs
- stricter storage path ownership

---

## Auth setup

VoicePin currently uses Google OAuth through Supabase Auth.

Supabase Dashboard:

```txt
Authentication → Providers → Google
```

Required:

- Google provider enabled
- Client ID configured
- Client Secret configured

For Google Cloud OAuth, the redirect URI should point to Supabase:

```txt
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

---

## Environment variables

Required app environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ELEVENLABS_API_KEY=
```

Important:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are client-safe.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to the browser.
- `ELEVENLABS_API_KEY` is server-only and must never be exposed to the browser.

---

## Development reset SQL

For local/dev testing, it can be useful to clear generated conversations and messages.

Use only in development:

```sql
delete from messages;
delete from conversation_members;
delete from conversations;
```

Usually keep profiles:

```sql
-- delete from profiles;
```

Profiles are needed for direct conversation email lookup.

---

## Verification queries

Use these queries to inspect the current backend state.

### Profiles

```sql
select id, email
from profiles;
```

### Conversations

```sql
select id, type, created_by, direct_pair_key, created_at
from conversations
order by created_at desc;
```

### Conversation members

```sql
select conversation_id, user_id
from conversation_members;
```

### Messages

```sql
select id, conversation_id, sender_id, audio_path, transcript, transcription_status, created_at
from messages
order by created_at desc;
```

---

## Important RLS notes

Avoid recursive RLS policies.

In particular, do not create a `conversation_members` policy that queries `conversation_members` again, because it can cause:

```txt
infinite recursion detected in policy for relation "conversation_members"
```

Current approach:

- users read only their own membership rows
- direct conversation labels are resolved using `direct_pair_key`
- profile lookup is allowed for authenticated users during MVP

This avoids recursive membership reads.

---

## Known MVP tradeoffs

### Authenticated profile lookup

Authenticated users can read profiles to find users by email.

This is acceptable for a small private beta, but should later be replaced with one of:

- usernames
- invite codes
- contact requests

### Audio access

Voice message audio is readable by authenticated users in the current MVP setup.

Before wider launch, consider:

- private bucket
- signed URLs
- ownership-based storage paths

### Manual SQL setup

This project currently keeps SQL files as setup documentation.

A future improvement would be converting them into ordered Supabase migrations.

Example future structure:

```txt
supabase/
  migrations/
    20260509_create_initial_schema.sql
    20260509_add_transcription_status.sql
    20260509_add_direct_pair_key.sql
```

---

## Fresh project checklist

After creating a new Supabase project:

- [ ] Run `schema.sql`
- [ ] Run `policies.sql`
- [ ] Run `realtime.sql`
- [ ] Create `voice-messages` storage bucket
- [ ] Enable Google provider
- [ ] Configure Google OAuth Client ID and Client Secret
- [ ] Add local redirect URL
- [ ] Add production redirect URL when deployed
- [ ] Add env vars to `.env.local`
- [ ] Sign in once to create a profile
- [ ] Confirm messages can upload
- [ ] Confirm messages can transcribe
- [ ] Confirm direct conversations work
- [ ] Confirm users cannot access unrelated conversations

---

## Related docs

See also:

```txt
docs/deployment.md
```

for deployment and production smoke-test notes.

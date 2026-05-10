# Deployment Notes

## Required services

- Vercel for hosting
- Supabase for auth, database, storage, and realtime
- ElevenLabs for speech-to-text

---

## Required environment variables

### Public client variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Server-only variables

```bash
SUPABASE_SERVICE_ROLE_KEY=
ELEVENLABS_API_KEY=
```

Never expose server-only variables with the `NEXT_PUBLIC_` prefix.

---

## Supabase setup checklist

Run SQL files in this order:

```txt
supabase/schema.sql
supabase/functions.sql
supabase/policies.sql
supabase/realtime.sql
```

Then verify:

- Google provider is enabled
- `voice-messages` storage bucket exists
- authenticated users can upload audio
- authenticated users can read audio
- `messages` table is enabled for realtime
- RLS is enabled on user-owned tables
- profiles are created after login
- direct conversations can be created by email
- transcription status exists on `messages`

---

## Google OAuth checklist

### Local development

Use:

```txt
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000
```

Also verify Google Cloud OAuth settings include local development values where needed:

```txt
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI: https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

The Supabase callback URL is the important redirect target for Google OAuth.

---

### Production

After deploying, add the production URL.

Example:

```txt
Site URL: https://your-production-domain
Redirect URL: https://your-production-domain
```

In Google Cloud OAuth settings, add:

```txt
Authorized JavaScript origin: https://your-production-domain
Authorized redirect URI: https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

---

## Vercel checklist

Add these variables in Vercel project settings:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ELEVENLABS_API_KEY
```

Then deploy.

After deployment, verify:

- build succeeds
- app opens
- Google sign-in works
- Supabase callback redirects back to the app
- transcription route works server-side

---

## Local quality checks before deployment

Run:

```bash
npm run test
npm run build
```

If available:

```bash
npm run lint
```

Do not deploy if:

- tests fail
- build fails
- required environment variables are missing
- `.env.local` contains secrets and is accidentally staged

Check Git status:

```bash
git status
```

---

## Production smoke test

After deployment:

1. Open production URL.
2. Sign in with Google.
3. Confirm profile is created.
4. Open the “Me” conversation.
5. Record a voice message.
6. Confirm message uploads.
7. Confirm message persists after refresh.
8. Confirm message shows `Transcribing...`.
9. Confirm transcript appears after processing.
10. Add another user by email.
11. Send a direct voice message.
12. Sign in as the other user.
13. Confirm the direct conversation appears.
14. Confirm the direct message is visible.
15. Confirm an unrelated user cannot see the conversation.

---

## Private beta readiness checklist

Before inviting users:

- [ ] Production deployment works
- [ ] Google auth works on production URL
- [ ] Audio upload works
- [ ] Messages persist after refresh
- [ ] Transcription succeeds
- [ ] Transcription failure state is visible
- [ ] Direct conversations work between two users
- [ ] Users cannot see conversations they do not belong to
- [ ] Core flow works with keyboard
- [ ] README and deployment docs are up to date
- [ ] No secrets are committed
- [ ] Supabase service role key is server-only
- [ ] ElevenLabs API key is server-only

---

## Known production risks

### Profile lookup

Direct conversation lookup now uses narrow RPC helpers instead of broad profile reads.

This is safer for private beta, but a future invite-code system would be better before wider launch.

### Audio access

Audio playback now uses short-lived signed URLs generated server-side after message access is verified.

Future improvement:

- stricter storage path ownership
- shorter signed URL lifetime if needed

---

### Public or broadly readable audio

If audio files are publicly readable or broadly readable by authenticated users, this should be revisited before wider launch.

Future improvement:

- private bucket
- signed URLs
- stricter storage path ownership

---

### Transcription cost

Each uploaded audio message can trigger an ElevenLabs transcription request.

Before beta:

- verify ElevenLabs quota
- monitor usage
- consider max duration enforcement
- consider mock transcription mode for local development

---

## Rollback notes

If production deployment breaks:

1. Revert the Vercel deployment to the previous working version.
2. Check environment variables.
3. Check Supabase Auth redirect URLs.
4. Check Supabase RLS policies.
5. Check server logs for `/api/transcribe`.
6. Check ElevenLabs quota/API key status.

---

## Future improvements

- Convert `supabase/schema.sql`, `supabase/policies.sql`, and `supabase/realtime.sql` into ordered Supabase migrations
- Add production logging/monitoring
- Add safer private audio access with signed URLs
- Add user display names instead of email labels
- Add invite flow before wider beta

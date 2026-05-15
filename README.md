# VoicePin

VoicePin is a mobile-first, voice-only app for capturing ultra-short spoken thoughts (“voice snapshots”).

There is no typing, no editing, and no long recordings.

Just press, speak, and send.

---

## Demo

Coming soon

---

## Concept

Most apps treat voice as a secondary feature.

VoicePin treats voice as the fastest way to capture a thought.

Every message is limited to a few seconds and automatically transcribed so it can be read or listened to.

---

## License

Copyright © 2026 Ewa Karamus. All rights reserved.

This project is shared for portfolio, review, and recruitment purposes only. Use, copying, modification, redistribution, deployment, or forking for independent use is not permitted without prior written approval.

Suggestions and pull requests are welcome for review, but they do not grant usage rights. See [`LICENSE`](LICENSE).

---

## Constraints

- Max message length: 20 seconds
- No typed messages
- No drafts or editing
- 1:1 and self conversations only

---

## Features (MVP)

- Email magic-link authentication
- “Me” conversation (private voice notes)
- 1:1 conversations
- Tap-to-record voice messages
- Automatic send after recording
- Private audio storage
- Automatic transcription
- Audio playback + transcript UI
- Realtime updates
- Delete own messages

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase (Auth, DB, Storage, Realtime)
- ElevenLabs (Speech to Text)
- Vitest

---

## Development

```bash
npm install
npm run dev
```

## Dev Log

### Step 1 — Project Initialization

- Initialized Next.js (App Router) with TypeScript and Tailwind
- Added ESLint configuration
- Set up clean folder structure with `src/`
- Configured environment variables
- Installed core dependencies:
  - lucide-react (icons)
  - framer-motion (animations)
  - zod (validation)
  - @supabase/supabase-js
- Added Vitest + Testing Library
- Created global test setup

### Step 2 — Mobile UI Foundation (Retro App Shell)

- Implemented mobile-first app shell with retro “device frame”
- Added design tokens for consistent styling
- Built initial conversation list (Home screen)
- Added pinned “Me” conversation
- Introduced hard product constraint in UI (20 sec max)
- Added placeholder record button (centered CTA)

Testing:
- Verified AppShell renders children correctly
- Verified constraint banner is visible
- Verified conversation list renders
- Verified “Me” conversation is first
- Verified record button exists

Structure decisions:
- Tests colocated with components
- Global test setup in `src/test/setup.ts`
- Feature-based architecture (`features/`, `components/`)

### Step 3 — Recorder Foundation

- Added recorder domain constants:
  - max duration: 20 seconds
  - minimum duration: 1 second
  - audio format: webm
- Added recorder domain types
- Implemented `useAudioRecorder` hook using the browser MediaRecorder API
- Added recording lifecycle states:
  - idle
  - requesting permission
  - recording
  - recorded
  - error
- Added hard auto-stop at 20 seconds
- Added too-short recording validation
- Added reusable `RecordButton`
- Added full-screen recording overlay
- Connected recorder overlay to the home screen

Testing:
- Verified recorder constraints
- Verified recording starts after microphone permission
- Verified recording stops and creates local audio
- Verified recordings under 1 second are rejected
- Verified recording auto-stops at 20 seconds
- Verified permission denial is handled
- Verified record button interactions
- Verified overlay states

### Step 4 — Local Voice Message Flow

- Added voice message domain types
- Added duration formatter for audio messages
- Added reusable audio message bubble
- Added send callback to recording overlay
- Connected recorded audio to local message state
- Displayed local voice snapshots in a temporary local tape section
- Kept storage/upload out of scope for this step

Testing:
- Verified duration formatting
- Verified audio bubble renders controls, duration, and transcript state
- Verified recording overlay calls send handler
- Verified home screen starts without local messages

### Step 5 — Environment and Supabase Client Setup

- Added `.env.example` for required public configuration
- Added Zod-based validation for client environment variables
- Added tests for valid, missing, and invalid environment values
- Added Supabase browser client factory
- Added tests to verify Supabase client initialization
- Kept service-role credentials out of scope until server-side operations are needed

Decision notes:
- Environment validation is added early to avoid unclear runtime failures later
- Supabase setup is introduced before auth/storage so future steps can build on a stable integration layer
- `.env.local` is used locally and excluded from Git

### Step 6 — Conversation Domain Layer

- Added typed conversation domain models
- Added mock conversation data as a temporary local data source
- Added conversation sorting logic with “Me” always pinned first
- Added conversation repository function to create a future-ready data boundary
- Extracted reusable `ConversationRow`
- Updated the home screen to load conversations through the repository layer
- Kept Supabase queries out of scope for this step

Testing:
- Verified conversation sorting keeps the self conversation first
- Verified direct conversations sort by most recent update
- Verified sorting does not mutate the original array
- Verified repository returns conversations in expected order
- Verified conversation rows render name, preview, initials, and duration
- Updated home screen tests for async conversation loading

Decision notes:
- A repository boundary was introduced before real Supabase queries so the UI will not need major changes when mock data is replaced
- The “Me” conversation is treated as a first-class conversation type instead of a UI-only special case

### Step 7 — Conversation Detail Flow

- Added selectable conversation rows
- Added conversation detail screen with header and back navigation
- Added mock message repository for conversation timelines
- Displayed audio messages inside conversation detail
- Connected home screen to conversation detail through local UI state

- Refactored home screen:
  - removed local “tape” (messages shown outside conversations)
  - removed message rendering from home
  - kept home focused on conversation list only

- Scoped recording to conversation detail screen

Testing:
- Verified conversation rows trigger selection
- Verified navigation from home to conversation detail
- Verified back navigation returns to home
- Verified message repository filters by conversation
- Verified messages render inside conversation detail
- Verified recorder overlay works inside conversation screen

Decision notes:
- Messages are now scoped strictly to conversations instead of being displayed globally
- Home screen is simplified to a navigation layer (conversation list only)
- This prepares the app for a future “draft snapshot” flow:
  - recording can happen globally
  - user decides where to send the recording after capture
- Avoided introducing multiple message entry points to keep UX predictable

### Step 8 — Draft Snapshot System

- Added a draft voice snapshot domain type
- Added a draft state hook that allows only one active draft at a time
- Added a persistent draft bar with audio preview, duration, send, and delete actions
- Added a destination picker for choosing where a draft should be sent
- Added a message factory that converts a draft into a local voice message
- Connected global home recording to draft creation
- Kept direct recording inside conversation detail for quick replies

Testing:
- Verified draft state starts empty
- Verified a recording can create a draft
- Verified new drafts replace older drafts
- Verified drafts can be cleared
- Verified draft bar renders preview, duration, send, and delete actions
- Verified destination picker renders available conversations and selection callbacks
- Verified draft-to-message conversion
- Verified home opens the recorder overlay

Decision notes:
- VoicePin now supports the capture-first flow: record first, choose destination after
- Only one draft is allowed at a time to avoid creating a second inbox
- Drafts are local UI state for now and are not persisted
- Sending a draft is wired as a temporary local action until writable repositories or Supabase persistence are added

### Step 8 — Draft Snapshot System (Refinements)

- Introduced context-aware recording actions:
  - "Save" when creating a draft (no destination selected)
  - "Send" when recording inside a conversation

- Fixed draft lifecycle:
  - Draft now owns its own audio URL (separate from recorder)
  - Recorder state is reset after saving a draft
  - Draft audio URLs are revoked when cleared or replaced

- Improved recording UX:
  - Added explicit “discard and close” (×) action in recording overlay
  - Enabled users to exit recording after finishing without saving
  - Clarified difference between:
    - Redo (stay in recording)
    - Close (discard and exit)
    - Save/Send (commit action)

- Ensured clean state transitions:
  - No stale duration or progress after saving or deleting
  - No residual audio after draft deletion
  - Recorder always returns to a clean idle state

Testing:
- Verified draft creates a new object URL from audio blob
- Verified object URLs are revoked when draft is replaced or cleared
- Verified recorder resets after saving a draft
- Verified discard action triggers close behavior
- Updated overlay tests for context-aware action labels (Save vs Send)

Decision notes:
- Recording and draft are now fully decoupled to prevent state leakage
- Explicit destructive action (×) was added to make discard behavior obvious
- UI actions reflect user intent depending on context (draft vs direct message)
- Clean state reset was prioritized to maintain a “single thought” interaction model

### Step 9 — Supabase Storage and Message Persistence

- Added Supabase Storage bucket for voice message audio
- Added public MVP storage policies for upload and read access
- Added message insert mutation for persisted voice messages
- Connected draft sending to real audio upload and database insert
- Reused a singleton Supabase browser client to avoid multiple client instances

Testing:
- Verified audio upload behavior with mocked Supabase client
- Verified message insertion payload
- Verified insert error handling
- Verified component tests mock persistence boundaries instead of hitting Supabase

Decision notes:
- Public storage and anonymous message policies are temporary MVP choices
- Auth-based RLS will replace public MVP policies in the next phase
- Audio storage and message metadata are kept separate so transcripts can be added later

### Step 10A — Auth Shell

- Added auth domain types for session and user state
- Added Supabase auth repository for:
  - reading current session
  - sending magic link login
  - signing out
- Added mobile-first magic link login form
- Added authenticated app gate
- Protected the main VoicePin UI behind session detection
- Added visible signed-in user state and sign-out action

Testing:
- Verified session mapping from Supabase auth
- Verified signed-out users see login form
- Verified signed-in users see app content
- Verified magic link login form validates email
- Verified sign-out returns user to login state

Decision notes:
- Magic link auth was chosen for private beta simplicity
- Auth shell was added before user-owned data migration to keep the change small and testable
- Database policies are still MVP-level and will be tightened in the next step

Follow-up:
- Surfaced Supabase magic link errors in the login form
- Confirmed repeated login attempts may be blocked by Supabase email rate limits rather than app logic

### Step 10A Follow-up — Switch from Magic Link to Google OAuth

- Replaced magic link as the primary login method with Google OAuth
- Kept the auth gate and session handling unchanged
- Chose Google OAuth because repeated magic-link testing can hit Supabase email rate limits
- Improved beta usability by removing email-link friction from the login flow

Decision notes:
- Google OAuth is the preferred auth method for the private beta
- Magic link may be reintroduced later as a fallback
- Facebook login is intentionally out of scope for now because Google is simpler to configure and more useful for a small technical beta

### Step 10B — User-owned Data Model and RLS (Fixes & Stabilization)

Follow-up fixes after initial RLS implementation:

- Fixed self conversation not appearing in destination picker under RLS
- Introduced `created_by` field on conversations to allow safe creation + visibility
- Ensured self conversation is always readable by its owner immediately after creation
- Fixed missing membership causing message insert failures
- Resolved storage RLS blocking authenticated uploads
- Updated storage policies to allow authenticated users to upload and read voice messages
- Fixed conversation picker showing empty state despite existing self conversation
- Normalized Supabase nested relation (`conversations`) handling in repository
- Aligned `messages.conversation_id` to UUID type for proper relational integrity
- Ensured draft sending pipeline works end-to-end:
  - upload → insert → clear draft → UI update

UX fixes:

- Fixed inability to send draft to "Me" conversation
- Added empty state handling in destination picker
- Improved reliability of draft → send flow

Technical decisions:

- Conversations now include `created_by` to simplify RLS logic
- Membership + ownership model used together for access control
- Storage access limited to authenticated users (public reads optional)
- Self conversation is lazily created per user

Testing:

- Verified draft sending works under RLS constraints
- Verified authenticated upload + insert pipeline
- Verified self conversation appears correctly in picker
- Verified no cross-user data access

Known limitations:

- Recording inside conversation is still local-only (not persisted yet)
- Conversation list currently supports only "Me" (no 1:1 yet)

### Step 11 — Persisted Conversation Detail

- Updated conversation detail to load messages from Supabase instead of relying on temporary local-only state
- Added persisted message mapping from database rows to UI message objects
- Reloaded conversation messages after direct recording sends
- Added loading, empty, and error states for conversation timelines
- Kept direct recording and draft sending on the same persistence path

Testing:
- Verified persisted message repository maps Supabase rows correctly
- Verified empty message lists render the empty state
- Verified load failures render an error state
- Verified conversation detail requests messages for the selected conversation
- Verified recorder overlay still opens from conversation detail

Decision notes:
- Conversation detail now treats Supabase as the source of truth
- Local optimistic rendering was avoided for now to keep persistence behavior simple and reliable
- Realtime updates remain out of scope for this step and can be added later

### Step 12 — Direct Conversations

- Added profile upsert after login so users can be found by email
- Added direct conversation creation by exact email
- Added conversation membership for both users
- Updated RLS to allow authenticated users to find profiles and create direct memberships
- Added Add Friend form to the home screen
- Updated conversation list to include direct conversations

Testing:
- Verified profile upsert
- Verified direct conversation repository creates or returns conversations
- Verified home can open a newly created direct conversation
- Manually verified two signed-in users can share a conversation

Decision notes:
- Exact-email lookup was chosen for MVP simplicity
- Public authenticated profile lookup is acceptable for private beta, but should be replaced later with invite codes or usernames
- Groups, public search, and pending invites remain out of scope

Follow-up:
- Fixed direct conversations falling back to “Friend” after reload
- Updated conversation loading to resolve the other member’s profile email
- Kept email display as the MVP identifier until usernames or contact names are introduced

Testing:
- Verified direct conversations display the other user’s email
- Verified fallback behavior when profile lookup fails

### Step 12A Follow-up — Direct Conversations Stability & RLS Fix

- Introduced `direct_pair_key` to uniquely identify direct conversations between two users
- Updated direct conversation creation to prevent duplicates using deterministic pair keys
- Refactored conversation loading to derive the other user from `direct_pair_key` instead of querying members
- Removed recursive RLS policy that caused infinite recursion errors
- Restored safe membership policy allowing users to read only their own memberships
- Allowed authenticated users to read profiles for email resolution

Testing:
- Verified direct conversations no longer duplicate for the same user pair
- Verified conversations persist correctly after page refresh
- Verified conversation list loads without 500 errors
- Verified RLS policies no longer produce recursion errors

Decision notes:
- Using `direct_pair_key` avoids complex and error-prone RLS joins
- Application-level resolution is simpler and more predictable than database recursion
- Profile reads are temporarily open to authenticated users for MVP simplicity

Follow-up:
- Fixed conversations reverting to “Friend” after refresh
- Stabilized conversation loading by removing dependency on `conversation_members` for label resolution
- Ensured consistent display of the other user’s email using `direct_pair_key`

Testing:
- Verified email labels persist after refresh
- Verified fallback to “Friend” only occurs when profile is missing
- Verified conversation list remains stable across reloads

### Step 13 — Last Message Preview and Activity Sorting

- Added latest message lookup for conversations
- Updated conversation previews to reflect the newest voice snapshot
- Updated conversation duration to show the latest message duration
- Updated conversation `updatedAt` based on latest message activity
- Refreshed conversation list when returning from conversation detail
- Kept fallback preview for conversations without messages

Testing:
- Verified conversations use latest message as preview
- Verified fallback preview is used when no messages exist
- Verified conversation list refreshes after returning from detail view
- Verified updated previews appear without full page reload

Decision notes:
- Conversation list now reflects real activity instead of static placeholder text
- Explicit refresh on navigation was chosen over realtime list updates for simplicity
- Missing transcripts fall back to “Voice snapshot” until transcription is added
- Full conversation metadata denormalization is intentionally deferred

### Step 14 — Sending States and User-visible Errors

- Added sending state for draft message delivery
- Added user-visible errors when draft sending fails
- Added sending/error props to destination picker
- Added direct message sending state inside conversation detail
- Removed reliance on console-only feedback for failed sends

Testing:
- Verified destination picker shows sending state
- Verified destination picker shows send errors
- Verified failed sends no longer silently disappear

Decision notes:
- Simple explicit sending states were chosen before optimistic UI
- Draft is only cleared after upload and database insert succeed
- Errors remain visible so beta testers can report failures clearly

## Product Direction

VoicePin is evolving toward a capture-first model:

Record → decide where it goes

Instead of:

Choose recipient → then message

This allows faster, more natural voice interactions.

### Step 15 — ElevenLabs Speech-to-Text

- Added server-side transcription route using ElevenLabs Speech-to-Text
- Kept ElevenLabs API key server-only
- Added message transcription status
- Marked new messages as transcribing after insert
- Triggered transcription after draft and direct message sends
- Saved transcript and transcription status back to Supabase
- Displayed transcribing and failed states in the message UI
- Added safer transcription error handling and failure recovery
- Updated failed transcription flow to persist `failed` status in the database
- Improved transcription route logging to surface only meaningful server-side errors
- Added clearer client-side transcription request error handling

Testing:
- Verified message insert marks messages as transcribing
- Verified transcription request helper calls API route
- Verified transcription request helper handles failures
- Verified message bubble renders transcription states
- Verified failed transcription updates message state to `failed`
- Verified quota/API failures no longer fail silently
- Verified transcript persists correctly after successful transcription

Decision notes:
- Transcription is handled server-side to protect API keys
- Scribe v2 is used as the transcription model
- Automatic language detection is used instead of forcing a language code
- Transcript updates currently rely on refresh/realtime updates rather than optimistic local transcript generation
- Failed transcription states are intentionally persisted for visibility and debugging during beta

### Step 16 — Transcript States

- Added explicit message UI states for transcription lifecycle
- Displayed “Transcribing...” while transcript generation is pending
- Displayed transcript text only when transcription is ready
- Displayed a visible failure state when transcription fails
- Simplified message status handling around transcription-specific states

Testing:
- Verified audio messages render pending transcription state
- Verified ready transcripts render correctly
- Verified failed transcription state uses visible error text
- Verified pending messages do not show transcript text prematurely

Decision notes:
- Audio remains playable regardless of transcription state
- Transcript display is intentionally tied to persisted transcription status
- Retry behavior is deferred to a later error-handling step

### Step 17 — Realtime Transcript Updates

- Updated message realtime subscription to listen for inserts and updates
- Refreshed open conversation when message transcription status changes
- Allowed transcripts to appear automatically after server-side transcription completes
- Kept Supabase as the source of truth for transcript state

Testing:
- Verified realtime subscription listens to message changes
- Verified realtime callback reloads conversation messages
- Verified transcript updates can appear without manual refresh

Decision notes:
- Realtime events trigger a full message reload instead of local patching
- This keeps transcript state consistent with persisted Supabase data
- Optimistic transcript updates are intentionally avoided because transcripts are generated server-side

### Step 18 — Error Handling Polish

- Added shared helper for converting unknown errors into user-safe messages
- Preserved server-provided transcription error details
- Standardized draft send error handling
- Standardized direct message send error handling
- Kept transcription request failures from breaking the main send flow
- Added visible conversation loading error state

Testing:
- Verified shared error helper handles Error, object-like errors, and fallbacks
- Verified transcription request surfaces server-provided details
- Verified conversation loading failures render visible error state
- Verified drafts are not cleared when sending fails

Decision notes:
- Upload + database insert are treated as the core send operation
- Transcription is treated as a follow-up process and may fail independently
- Errors are visible enough for beta testers to report without opening DevTools

### Step 19 — Message Playback Improvements

- Replaced raw browser audio controls with custom playback UI
- Added play/pause control for voice messages
- Added progress bar and current/total duration display
- Kept audio element hidden while preserving browser playback behavior
- Kept transcript lifecycle states below playback controls

Testing:
- Verified custom playback controls render
- Verified play action calls audio playback
- Verified transcript states still render correctly
- Verified playback hook initializes and resets safely

Decision notes:
- A small custom player was chosen to better match the retro mobile-first UI
- Native audio remains underneath for reliable playback behavior
- Advanced seeking and waveform visuals are deferred

### Step 20 — Accessibility Check

- Added accessibility-focused checks for custom playback controls
- Exposed playback progress as a semantic progressbar
- Added dialog semantics to draft destination picker
- Added dialog semantics to recording overlay
- Improved Add Friend form error accessibility
- Connected form error state with `aria-invalid` and `aria-describedby`

Testing:
- Verified message playback controls have accessible names
- Verified playback progress is exposed as a progressbar
- Verified draft destination picker is announced as a dialog
- Verified recording overlay is announced as a dialog
- Verified Add Friend errors are visible and connected to the email input

Manual checklist:
- Navigate core flow with keyboard only
- Confirm focus is visible on buttons and inputs
- Confirm overlays have clear close/cancel controls
- Confirm screen reader names for Record, Play, Pause, Send, Cancel, and Sign out
- Confirm errors are visible and announced with `role="alert"`
- Confirm text contrast remains readable on mobile

Decision notes:
- Accessibility was added alongside custom UI controls, not postponed to final polish
- Native audio controls were replaced, so custom playback needed explicit accessible semantics
- Focus trapping is deferred, but overlay dialog semantics are now in place

### Step 21 — Performance Optimization

- Prevented overlapping conversation refreshes on the home screen
- Batched profile lookups for direct conversation labels
- Batched latest-message preview lookups for conversation previews
- Reduced per-conversation Supabase queries in the conversation list
- Kept existing RLS-safe `direct_pair_key` label resolution

Testing:
- Verified self conversation still loads
- Verified direct conversation labels still use the other user’s email
- Verified latest message preview still works
- Verified fallback preview still works when no messages exist
- Verified repository errors are still surfaced correctly

Decision notes:
- Batched reads were chosen before denormalized metadata to keep schema changes minimal
- Full conversation metadata denormalization remains a later optimization
- React Query is still deferred until the app has more repeated client-side data flows

## Deployment

Deployment notes are tracked in [`docs/deployment.md`](docs/deployment.md).

Required services:

- Supabase
- Vercel
- ElevenLabs

Before deploying, verify:

- Environment variables are configured
- Supabase SQL setup has been applied
- Google OAuth redirect URLs include the production domain
- Realtime is enabled for messages
- Full test suite passes

## Private Beta Checklist

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

### Step 23 — Recorder UX and Time Limit Indicator

- Updated recording controls so the main button clearly changes from start to stop while recording
- Replaced ambiguous recording action with explicit “Stop recording” state
- Added visible status copy explaining what happens while recording
- Added circular 20-second recording limit indicator
- Displayed elapsed time and remaining seconds during recording
- Added near-limit warning when only a few seconds remain
- Clarified destructive reset action as “Discard and record again”
- Added stronger retro-style borders and 3D treatment to recorder action buttons
- Removed heavy shadow from the circular timer so it reads as an indicator, not a button

Testing:
- Verified idle recorder shows “Start recording”
- Verified recording state shows “Stop recording”
- Verified stop action calls the correct handler
- Verified remaining time is visible and accessible through `role="timer"`
- Verified near-limit warning appears close to the 20-second limit
- Verified preview actions are shown after recording
- Verified reset action clearly communicates that the current recording will be discarded

Decision notes:
- A morphing record/stop button was chosen over separate controls to keep the mobile UI simple
- Circular countdown was chosen for a stronger retro recorder feel
- Text remains visible alongside the circular indicator so time information is not color-only
- The reset action uses explicit destructive wording to reduce accidental data loss

### Step 24 — Security Hardening

- Moved message playback away from public audio URLs
- Added authenticated API route for short-lived signed audio URLs
- Updated message loading to request signed audio URLs per accessible message
- Updated transcription flow to use private storage paths instead of public audio URLs
- Secured transcription route with authenticated message access checks
- Removed broad authenticated profile read policy
- Added narrow RPC helpers for exact-email user lookup and profile label resolution
- Kept Supabase service role usage server-only

Testing:
- Verified signed audio URL helper sends authenticated requests
- Verified unauthenticated audio URL requests fail
- Verified message insert returns private audio path instead of public URL
- Verified transcription requests require authentication
- Verified direct conversation lookup uses narrow RPC instead of broad profile reads
- Verified existing conversation and message repository tests pass after security changes

Decision notes:
- Client uploads remain allowed for MVP speed
- Audio reads now go through server-generated signed URLs
- Profile lookup remains exact-email based for private beta, but broad profile reads were removed
- Invite codes or explicit contact requests remain a future improvement
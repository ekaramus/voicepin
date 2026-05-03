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

---

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

## Product Direction

VoicePin is evolving toward a capture-first model:

Record → decide where it goes

Instead of:

Choose recipient → then message

This allows faster, more natural voice interactions.
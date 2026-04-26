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

## Product Direction

VoicePin is evolving toward a capture-first model:

Record → decide where it goes

Instead of:

Choose recipient → then message

This allows faster, more natural voice interactions.
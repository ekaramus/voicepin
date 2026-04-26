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
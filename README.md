# VoicePin

VoicePin is a mobile-first, voice-only app for capturing ultra-short spoken thoughts (“voice snapshots”).

There is no typing, no editing, and no long recordings.

Just press, speak, and send.

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
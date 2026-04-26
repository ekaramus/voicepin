import type { VoiceMessage } from "./message.types";

export const mockMessages: VoiceMessage[] = [
  {
    id: "message-1",
    conversationId: "me",
    sender: "me",
    audioUrl: "",
    durationMs: 8_000,
    transcript: "Remember to record the demo before lunch.",
    status: "ready",
    createdAt: "2026-04-26T12:00:00.000Z",
  },
  {
    id: "message-2",
    conversationId: "anna",
    sender: "me",
    audioUrl: "",
    durationMs: 6_000,
    transcript: "Leaving now, be there in ten.",
    status: "ready",
    createdAt: "2026-04-26T11:50:00.000Z",
  },
];
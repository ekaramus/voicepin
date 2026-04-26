import type { Conversation } from "./conversation.types";

export const mockConversations: Conversation[] = [
  {
    id: "me",
    type: "self",
    name: "Me",
    initials: "ME",
    preview: "Remember: record the demo before lunch.",
    durationMs: 8_000,
    isPinned: true,
    updatedAt: "2026-04-26T12:00:00.000Z",
  },
  {
    id: "anna",
    type: "direct",
    name: "Anna",
    initials: "AN",
    preview: "Leaving now, be there in ten.",
    durationMs: 6_000,
    isPinned: false,
    updatedAt: "2026-04-26T11:50:00.000Z",
  },
];
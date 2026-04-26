import { sortConversations } from "./sortConversations";
import type { Conversation } from "./conversation.types";

const baseConversation: Conversation = {
  id: "base",
  type: "direct",
  name: "Base",
  initials: "BA",
  preview: "",
  durationMs: 0,
  isPinned: false,
  updatedAt: "2026-04-26T10:00:00.000Z",
};

describe("sortConversations", () => {
  it("keeps self conversation first", () => {
    const conversations: Conversation[] = [
      {
        ...baseConversation,
        id: "anna",
        name: "Anna",
        updatedAt: "2026-04-26T12:00:00.000Z",
      },
      {
        ...baseConversation,
        id: "me",
        type: "self",
        name: "Me",
        isPinned: true,
        updatedAt: "2026-04-26T09:00:00.000Z",
      },
    ];

    expect(sortConversations(conversations)[0].id).toBe("me");
  });

  it("sorts direct conversations by most recently updated", () => {
    const conversations: Conversation[] = [
      {
        ...baseConversation,
        id: "older",
        updatedAt: "2026-04-26T10:00:00.000Z",
      },
      {
        ...baseConversation,
        id: "newer",
        updatedAt: "2026-04-26T12:00:00.000Z",
      },
    ];

    expect(sortConversations(conversations).map((item) => item.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("does not mutate original array", () => {
    const conversations: Conversation[] = [
      {
        ...baseConversation,
        id: "older",
        updatedAt: "2026-04-26T10:00:00.000Z",
      },
      {
        ...baseConversation,
        id: "newer",
        updatedAt: "2026-04-26T12:00:00.000Z",
      },
    ];

    const originalOrder = conversations.map((item) => item.id);

    sortConversations(conversations);

    expect(conversations.map((item) => item.id)).toEqual(originalOrder);
  });
});
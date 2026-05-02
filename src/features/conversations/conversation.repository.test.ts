const mockGetRequiredUser = vi.fn();
const mockGetOrCreateSelfConversation = vi.fn();

const mockConversationMembershipEq = vi.fn();
const mockMemberEq = vi.fn();
const mockProfileSingle = vi.fn();

vi.mock("@/features/auth/getRequiredUser", () => ({
  getRequiredUser: () => mockGetRequiredUser(),
}));

vi.mock("./selfConversation.repository", () => ({
  getOrCreateSelfConversation: (user: unknown) =>
    mockGetOrCreateSelfConversation(user),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: (table: string) => {
      if (table === "conversation_members") {
        return {
          select: (query: string) => {
            if (
              query === "conversation_id, conversations(id, type, created_at)"
            ) {
              return {
                eq: mockConversationMembershipEq,
              };
            }

            if (query === "user_id") {
              return {
                eq: mockMemberEq,
              };
            }

            throw new Error(`Unexpected conversation_members query: ${query}`);
          },
        };
      }

      if (table === "profiles") {
        return {
          select: (query: string) => {
            if (query !== "email") {
              throw new Error(`Unexpected profiles query: ${query}`);
            }

            return {
              eq: () => ({
                single: mockProfileSingle,
              }),
            };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  }),
}));

import { listConversations } from "./conversation.repository";

describe("listConversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequiredUser.mockResolvedValue({
      id: "user-1",
      email: "me@example.com",
    });

    mockGetOrCreateSelfConversation.mockResolvedValue({
      id: "self-conversation",
      type: "self",
      name: "Me",
      initials: "ME",
      preview: "Private voice memories",
      durationMs: 0,
      isPinned: true,
      updatedAt: "2026-04-26T12:00:00.000Z",
    });

    mockConversationMembershipEq.mockResolvedValue({
      data: [],
      error: null,
    });

    mockMemberEq.mockResolvedValue({
      data: [],
      error: null,
    });

    mockProfileSingle.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  it("returns self conversation for current user", async () => {
    const conversations = await listConversations();

    expect(conversations[0]).toEqual(
      expect.objectContaining({
        id: "self-conversation",
        type: "self",
        name: "Me",
      })
    );

    expect(mockGetOrCreateSelfConversation).toHaveBeenCalledWith({
      id: "user-1",
      email: "me@example.com",
    });
  });

  it("shows friend email for direct conversations", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-conversation",
          conversations: {
            id: "direct-conversation",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
          },
        },
      ],
      error: null,
    });

    mockMemberEq.mockResolvedValue({
      data: [{ user_id: "user-1" }, { user_id: "friend-1" }],
      error: null,
    });

    mockProfileSingle.mockResolvedValue({
      data: {
        email: "friend@example.com",
      },
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "direct-conversation",
          type: "direct",
          name: "friend@example.com",
          initials: "FR",
        }),
      ])
    );
  });

  it("falls back to Friend when direct conversation has no other member", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-conversation",
          conversations: {
            id: "direct-conversation",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
          },
        },
      ],
      error: null,
    });

    mockMemberEq.mockResolvedValue({
      data: [{ user_id: "user-1" }],
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "direct-conversation",
          name: "Friend",
          initials: "FR",
        }),
      ])
    );
  });

  it("falls back to Friend when profile lookup fails", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-conversation",
          conversations: {
            id: "direct-conversation",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
          },
        },
      ],
      error: null,
    });

    mockMemberEq.mockResolvedValue({
      data: [{ user_id: "user-1" }, { user_id: "friend-1" }],
      error: null,
    });

    mockProfileSingle.mockResolvedValue({
      data: null,
      error: new Error("Profile missing"),
    });

    const conversations = await listConversations();

    expect(conversations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "direct-conversation",
          name: "Friend",
          initials: "FR",
        }),
      ])
    );
  });

  it("throws when memberships cannot be loaded", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: null,
      error: new Error("Membership load failed"),
    });

    await expect(listConversations()).rejects.toThrow(
      "Membership load failed"
    );
  });

  it("throws when direct conversation members cannot be loaded", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-conversation",
          conversations: {
            id: "direct-conversation",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
          },
        },
      ],
      error: null,
    });

    mockMemberEq.mockResolvedValue({
      data: null,
      error: new Error("Members load failed"),
    });

    await expect(listConversations()).rejects.toThrow("Members load failed");
  });
});
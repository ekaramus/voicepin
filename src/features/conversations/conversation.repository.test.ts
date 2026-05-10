const mockGetRequiredUser = vi.fn();
const mockGetOrCreateSelfConversation = vi.fn();

const mockConversationMembershipEq = vi.fn();
const mockProfilesRpc = vi.fn();
const mockMessagesOrder = vi.fn();

vi.mock("@/features/auth/getRequiredUser", () => ({
  getRequiredUser: () => mockGetRequiredUser(),
}));

vi.mock("./selfConversation.repository", () => ({
  getOrCreateSelfConversation: (user: unknown) =>
    mockGetOrCreateSelfConversation(user),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    rpc: (name: string, args: unknown) => {
      if (name !== "get_profiles_by_ids") {
        throw new Error(`Unexpected RPC: ${name}`);
      }

      return mockProfilesRpc(args);
    },

    from: (table: string) => {
      if (table === "conversation_members") {
        return {
          select: (query: string) => {
            if (
              query ===
              "conversation_id, conversations(id, type, created_at, direct_pair_key)"
            ) {
              return {
                eq: mockConversationMembershipEq,
              };
            }

            throw new Error(`Unexpected conversation_members query: ${query}`);
          },
        };
      }

      if (table === "messages") {
        return {
          select: (query: string) => {
            if (
              query !==
              "conversation_id, transcript, duration_ms, created_at"
            ) {
              throw new Error(`Unexpected messages query: ${query}`);
            }

            return {
              in: () => ({
                order: mockMessagesOrder,
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

    mockProfilesRpc.mockResolvedValue({
      data: [],
      error: null,
    });

    mockMessagesOrder.mockResolvedValue({
      data: [],
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
  });

  it("shows friend email for direct conversations using pair key", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-1",
          conversations: {
            id: "direct-1",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
            direct_pair_key: "user-1:friend-1",
          },
        },
      ],
      error: null,
    });

    mockProfilesRpc.mockResolvedValue({
      data: [
        {
          id: "friend-1",
          email: "friend@example.com",
        },
      ],
      error: null,
    });

    const conversations = await listConversations();

    expect(mockProfilesRpc).toHaveBeenCalledWith({
      profile_ids: ["friend-1"],
    });

    expect(conversations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "direct-1",
          name: "friend@example.com",
          initials: "FR",
        }),
      ])
    );
  });

  it("falls back to Friend when pair key is missing", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-1",
          conversations: {
            id: "direct-1",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
            direct_pair_key: null,
          },
        },
      ],
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Friend",
          initials: "FR",
        }),
      ])
    );
  });

  it("uses latest message as preview", async () => {
    mockMessagesOrder.mockResolvedValue({
      data: [
        {
          conversation_id: "self-conversation",
          transcript: "Latest voice note",
          duration_ms: 6_000,
          created_at: "2026-04-26T14:00:00.000Z",
        },
      ],
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations[0]).toEqual(
      expect.objectContaining({
        preview: "Latest voice note",
        durationMs: 6_000,
        updatedAt: "2026-04-26T14:00:00.000Z",
      })
    );
  });

  it("uses first latest message per conversation", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-1",
          conversations: {
            id: "direct-1",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
            direct_pair_key: "user-1:friend-1",
          },
        },
      ],
      error: null,
    });

    mockProfilesRpc.mockResolvedValue({
      data: [
        {
          id: "friend-1",
          email: "friend@example.com",
        },
      ],
      error: null,
    });

    mockMessagesOrder.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-1",
          transcript: "Newest",
          duration_ms: 7_000,
          created_at: "2026-04-26T15:00:00.000Z",
        },
        {
          conversation_id: "direct-1",
          transcript: "Older",
          duration_ms: 5_000,
          created_at: "2026-04-26T14:00:00.000Z",
        },
      ],
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "direct-1",
          name: "friend@example.com",
          preview: "Newest",
          durationMs: 7_000,
          updatedAt: "2026-04-26T15:00:00.000Z",
        }),
      ])
    );
  });

  it("uses fallback preview when no messages exist", async () => {
    mockMessagesOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations[0]).toEqual(
      expect.objectContaining({
        preview: "No voice snapshots yet",
        durationMs: 0,
      })
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

  it("throws when batched profile lookup fails", async () => {
    mockConversationMembershipEq.mockResolvedValue({
      data: [
        {
          conversation_id: "direct-1",
          conversations: {
            id: "direct-1",
            type: "direct",
            created_at: "2026-04-26T13:00:00.000Z",
            direct_pair_key: "user-1:friend-1",
          },
        },
      ],
      error: null,
    });

    mockProfilesRpc.mockResolvedValue({
      data: null,
      error: new Error("Profiles failed"),
    });

    await expect(listConversations()).rejects.toThrow("Profiles failed");
  });

  it("throws when batched message preview lookup fails", async () => {
    mockMessagesOrder.mockResolvedValue({
      data: null,
      error: new Error("Messages failed"),
    });

    await expect(listConversations()).rejects.toThrow("Messages failed");
  });
});
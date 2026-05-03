const mockGetRequiredUser = vi.fn();
const mockGetOrCreateSelfConversation = vi.fn();

const mockConversationMembershipEq = vi.fn();
const mockProfileSingle = vi.fn();
const mockMessageMaybeSingle = vi.fn();

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
              query ===
              "conversation_id, conversations(id, type, created_at, direct_pair_key)"
            ) {
              return {
                eq: mockConversationMembershipEq,
              };
            }

            throw new Error(
              `Unexpected conversation_members query: ${query}`
            );
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

      if (table === "messages") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: mockMessageMaybeSingle,
                }),
              }),
            }),
          }),
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

    mockProfileSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockMessageMaybeSingle.mockResolvedValue({
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
    mockMessageMaybeSingle.mockResolvedValue({
      data: {
        transcript: "Latest voice note",
        duration_ms: 6000,
        created_at: "2026-04-26T14:00:00.000Z",
      },
      error: null,
    });

    const conversations = await listConversations();

    expect(conversations[0]).toEqual(
      expect.objectContaining({
        preview: "Latest voice note",
        durationMs: 6000,
        updatedAt: "2026-04-26T14:00:00.000Z",
      })
    );
  });

  it("uses fallback preview when no messages exist", async () => {
    mockMessageMaybeSingle.mockResolvedValue({
      data: null,
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
});
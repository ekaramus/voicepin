const mockGetRequiredUser = vi.fn();

const mockProfileSingle = vi.fn();
const mockExistingConversationMaybeSingle = vi.fn();
const mockConversationSingle = vi.fn();
const mockConversationMembersInsert = vi.fn();

vi.mock("@/features/auth/getRequiredUser", () => ({
  getRequiredUser: () => mockGetRequiredUser(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: mockProfileSingle,
            }),
          }),
        };
      }

      if (table === "conversations") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: mockExistingConversationMaybeSingle,
              }),
            }),
          }),
          insert: vi.fn(() => ({
            select: () => ({
              single: mockConversationSingle,
            }),
          })),
        };
      }

      if (table === "conversation_members") {
        return {
          insert: mockConversationMembersInsert,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  }),
}));

import { createOrGetDirectConversationByEmail } from "./directConversation.repository";

describe("createOrGetDirectConversationByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequiredUser.mockResolvedValue({
      id: "user-a",
      email: "me@example.com",
    });

    mockProfileSingle.mockResolvedValue({
      data: {
        id: "user-b",
        email: "friend@example.com",
      },
      error: null,
    });

    mockExistingConversationMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockConversationSingle.mockResolvedValue({
      data: {
        id: "conversation-1",
        type: "direct",
        created_at: "2026-04-26T12:00:00.000Z",
      },
      error: null,
    });

    mockConversationMembersInsert.mockResolvedValue({
      error: null,
    });
  });

  it("creates a direct conversation by email", async () => {
    const conversation = await createOrGetDirectConversationByEmail(
      "friend@example.com"
    );

    expect(conversation).toEqual({
      id: "conversation-1",
      type: "direct",
      name: "friend@example.com",
      initials: "FR",
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: "2026-04-26T12:00:00.000Z",
    });

    expect(mockConversationMembersInsert).toHaveBeenCalledWith([
      {
        conversation_id: "conversation-1",
        user_id: "user-a",
      },
      {
        conversation_id: "conversation-1",
        user_id: "user-b",
      },
    ]);
  });

  it("normalizes email before lookup", async () => {
    await createOrGetDirectConversationByEmail("  FRIEND@EXAMPLE.COM ");

    expect(mockProfileSingle).toHaveBeenCalledOnce();
  });

  it("returns existing direct conversation when pair already exists", async () => {
    mockExistingConversationMaybeSingle.mockResolvedValue({
      data: {
        id: "existing-conversation",
        type: "direct",
        created_at: "2026-04-26T13:00:00.000Z",
      },
      error: null,
    });

    const conversation = await createOrGetDirectConversationByEmail(
      "friend@example.com"
    );

    expect(conversation).toEqual({
      id: "existing-conversation",
      type: "direct",
      name: "friend@example.com",
      initials: "FR",
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: "2026-04-26T13:00:00.000Z",
    });

    expect(mockConversationMembersInsert).not.toHaveBeenCalled();
  });

  it("rejects empty email", async () => {
    await expect(createOrGetDirectConversationByEmail("   ")).rejects.toThrow(
      "Email is required"
    );
  });

  it("rejects current user's own email", async () => {
    await expect(
      createOrGetDirectConversationByEmail("me@example.com")
    ).rejects.toThrow("Choose another user's email");
  });

  it("throws when user profile is not found", async () => {
    mockProfileSingle.mockResolvedValue({
      data: null,
      error: new Error("Not found"),
    });

    await expect(
      createOrGetDirectConversationByEmail("missing@example.com")
    ).rejects.toThrow("User not found");
  });

  it("throws when existing conversation lookup fails", async () => {
    mockExistingConversationMaybeSingle.mockResolvedValue({
      data: null,
      error: new Error("Existing conversation lookup failed"),
    });

    await expect(
      createOrGetDirectConversationByEmail("friend@example.com")
    ).rejects.toThrow("Existing conversation lookup failed");
  });

  it("throws when conversation creation fails", async () => {
    mockConversationSingle.mockResolvedValue({
      data: null,
      error: new Error("Conversation creation failed"),
    });

    await expect(
      createOrGetDirectConversationByEmail("friend@example.com")
    ).rejects.toThrow("Conversation creation failed");
  });

  it("throws when member insertion fails", async () => {
    mockConversationMembersInsert.mockResolvedValue({
      error: new Error("Member insert failed"),
    });

    await expect(
      createOrGetDirectConversationByEmail("friend@example.com")
    ).rejects.toThrow("Member insert failed");
  });
});
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  }),
}));

import { listMessagesByConversation } from "./message.repository";

describe("listMessagesByConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      order: mockOrder,
    });

    mockGetPublicUrl.mockReturnValue({
      data: {
        publicUrl: "https://example.supabase.co/audio.webm",
      },
    });
  });

  it("returns mapped messages for the requested conversation", async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          id: "message-1",
          conversation_id: "conversation-1",
          sender_id: "user-1",
          audio_path: "audio.webm",
          duration_ms: 8_000,
          transcript: "Remember the demo.",
          created_at: "2026-04-26T12:00:00.000Z",
        },
      ],
      error: null,
    });

    await expect(
      listMessagesByConversation("conversation-1")
    ).resolves.toEqual([
      {
        id: "message-1",
        conversationId: "conversation-1",
        sender: "me",
        audioUrl: "https://example.supabase.co/audio.webm",
        durationMs: 8_000,
        transcript: "Remember the demo.",
        status: "ready",
        createdAt: "2026-04-26T12:00:00.000Z",
      },
    ]);

    expect(mockEq).toHaveBeenCalledWith("conversation_id", "conversation-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("returns empty list when there are no messages", async () => {
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    await expect(
      listMessagesByConversation("conversation-1")
    ).resolves.toEqual([]);
  });

  it("throws when Supabase returns an error", async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: new Error("Failed to load messages"),
    });

    await expect(
      listMessagesByConversation("conversation-1")
    ).rejects.toThrow("Failed to load messages");
  });
});
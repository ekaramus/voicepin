const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockGetRequiredUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  }),
}));

vi.mock("@/features/auth/getRequiredUser", () => ({
  getRequiredUser: () => mockGetRequiredUser(),
}));

import { insertMessage } from "./message.mutations";

describe("insertMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequiredUser.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    });

    mockInsert.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      single: mockSingle,
    });
  });

  it("inserts a persisted voice message with sender id", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "message-1",
        audio_path: "audio.webm",
      },
      error: null,
    });

    const result = await insertMessage({
      conversationId: "conversation-1",
      audioPath: "audio.webm",
      durationMs: 8_000,
    });

    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: "conversation-1",
      sender_id: "user-1",
      audio_path: "audio.webm",
      duration_ms: 8_000,
      transcription_status: "transcribing",
    });

    expect(mockSelect).toHaveBeenCalledWith("id, audio_path");

    expect(result).toEqual({
      id: "message-1",
      audioPath: "audio.webm",
    });
  });

  it("throws when user is not authenticated", async () => {
    mockGetRequiredUser.mockRejectedValue(
      new Error("User is not authenticated")
    );

    await expect(
      insertMessage({
        conversationId: "conversation-1",
        audioPath: "audio.webm",
        durationMs: 8_000,
      })
    ).rejects.toThrow("User is not authenticated");

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("throws when insert fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: new Error("Insert failed"),
    });

    await expect(
      insertMessage({
        conversationId: "conversation-1",
        audioPath: "audio.webm",
        durationMs: 8_000,
      })
    ).rejects.toThrow("Insert failed");
  });
});
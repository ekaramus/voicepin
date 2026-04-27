const mockInsert = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  }),
}));

import { insertMessage } from "./message.mutations";

describe("insertMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a persisted voice message", async () => {
    mockInsert.mockResolvedValue({ error: null });

    await insertMessage({
      conversationId: "me",
      audioPath: "audio.webm",
      durationMs: 8_000,
    });

    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: "me",
      audio_path: "audio.webm",
      duration_ms: 8_000,
    });
  });

  it("throws when insert fails", async () => {
    mockInsert.mockResolvedValue({
      error: new Error("Insert failed"),
    });

    await expect(
      insertMessage({
        conversationId: "me",
        audioPath: "audio.webm",
        durationMs: 8_000,
      })
    ).rejects.toThrow("Insert failed");
  });
});
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockRequestAudioUrl = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: mockEq,
      }),
    }),
  }),
}));

vi.mock("./requestAudioUrl", () => ({
  requestAudioUrl: (input: unknown) => mockRequestAudioUrl(input),
}));

import { listMessagesByConversation } from "./message.repository";

describe("listMessagesByConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockEq.mockReturnValue({
      order: mockOrder,
    });

    mockOrder.mockResolvedValue({
      data: [
        {
          id: "message-1",
          conversation_id: "conversation-1",
          sender_id: "user-1",
          audio_path: "audio.webm",
          duration_ms: 8_000,
          transcript: "Remember to record the demo.",
          transcription_status: "ready",
          created_at: "2026-04-26T12:00:00.000Z",
        },
      ],
      error: null,
    });

    mockRequestAudioUrl.mockResolvedValue("https://signed.example.com/audio.webm");
  });

  it("returns persisted messages with signed audio URLs", async () => {
    const messages = await listMessagesByConversation("conversation-1");

    expect(mockRequestAudioUrl).toHaveBeenCalledWith({
      messageId: "message-1",
    });

    expect(messages).toEqual([
      {
        id: "message-1",
        conversationId: "conversation-1",
        sender: "me",
        audioUrl: "https://signed.example.com/audio.webm",
        durationMs: 8_000,
        transcript: "Remember to record the demo.",
        status: "ready",
        createdAt: "2026-04-26T12:00:00.000Z",
      },
    ]);
  });

  it("maps failed transcription status", async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          id: "message-1",
          conversation_id: "conversation-1",
          sender_id: "user-1",
          audio_path: "audio.webm",
          duration_ms: 8_000,
          transcript: null,
          transcription_status: "failed",
          created_at: "2026-04-26T12:00:00.000Z",
        },
      ],
      error: null,
    });

    const messages = await listMessagesByConversation("conversation-1");

    expect(messages[0].status).toBe("transcription_failed");
  });

  it("maps missing transcription status as transcribing", async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          id: "message-1",
          conversation_id: "conversation-1",
          sender_id: "user-1",
          audio_path: "audio.webm",
          duration_ms: 8_000,
          transcript: null,
          transcription_status: null,
          created_at: "2026-04-26T12:00:00.000Z",
        },
      ],
      error: null,
    });

    const messages = await listMessagesByConversation("conversation-1");

    expect(messages[0].status).toBe("transcribing");
  });

  it("throws when messages cannot be loaded", async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: new Error("Messages failed"),
    });

    await expect(
      listMessagesByConversation("conversation-1")
    ).rejects.toThrow("Messages failed");
  });
});
import { requestTranscription } from "./requestTranscription";

describe("requestTranscription", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests transcription for a message", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    await requestTranscription({
      messageId: "message-1",
      audioUrl: "https://example.com/audio.webm",
    });

    expect(fetch).toHaveBeenCalledWith("/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId: "message-1",
        audioUrl: "https://example.com/audio.webm",
      }),
    });
  });

  it("throws when transcription request fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Could not request transcription.",
      }),
    } as Response);

    await expect(
      requestTranscription({
        messageId: "message-1",
        audioUrl: "https://example.com/audio.webm",
      })
    ).rejects.toThrow("Could not request transcription.");
  });

  it("throws fallback error when response body cannot be parsed", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Response);

    await expect(
      requestTranscription({
        messageId: "message-1",
        audioUrl: "https://example.com/audio.webm",
      })
    ).rejects.toThrow("Could not request transcription.");
  });

  it("throws server-provided transcription details", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Transcription failed.",
        details: "quota_exceeded",
      }),
    } as Response);

    await expect(
      requestTranscription({
        messageId: "message-1",
        audioUrl: "https://example.com/audio.webm",
      })
    ).rejects.toThrow("quota_exceeded");
  });
});
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
    } as Response);

    await expect(
      requestTranscription({
        messageId: "message-1",
        audioUrl: "https://example.com/audio.webm",
      })
    ).rejects.toThrow("Could not request transcription.");
  });
});
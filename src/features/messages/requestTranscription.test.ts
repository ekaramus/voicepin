const mockGetSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

import { requestTranscription } from "./requestTranscription";

describe("requestTranscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal("fetch", vi.fn());

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: "token-1",
        },
      },
    });
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
      audioPath: "audio.webm",
    });

    expect(fetch).toHaveBeenCalledWith("/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-1",
      },
      body: JSON.stringify({
        messageId: "message-1",
        audioPath: "audio.webm",
      }),
    });
  });

  it("throws when user is not authenticated", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: null,
      },
    });

    await expect(
      requestTranscription({
        messageId: "message-1",
        audioPath: "audio.webm",
      })
    ).rejects.toThrow("Authentication is required to transcribe audio.");

    expect(fetch).not.toHaveBeenCalled();
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
        audioPath: "audio.webm",
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
        audioPath: "audio.webm",
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
        audioPath: "audio.webm",
      })
    ).rejects.toThrow("quota_exceeded");
  });
});
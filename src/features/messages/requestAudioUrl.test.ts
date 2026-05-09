const mockGetSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

import { requestAudioUrl } from "./requestAudioUrl";

describe("requestAudioUrl", () => {
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

  it("requests a signed audio URL", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        audioUrl: "https://signed.example.com/audio.webm",
      }),
    } as Response);

    const audioUrl = await requestAudioUrl({
      messageId: "message-1",
    });

    expect(fetch).toHaveBeenCalledWith("/api/audio-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-1",
      },
      body: JSON.stringify({
        messageId: "message-1",
      }),
    });

    expect(audioUrl).toBe("https://signed.example.com/audio.webm");
  });

  it("throws when user is not authenticated", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: null,
      },
    });

    await expect(
      requestAudioUrl({
        messageId: "message-1",
      })
    ).rejects.toThrow("Authentication is required to load audio.");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws when signed URL request fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Audio message was not found or is not accessible.",
      }),
    } as Response);

    await expect(
      requestAudioUrl({
        messageId: "message-1",
      })
    ).rejects.toThrow("Audio message was not found or is not accessible.");
  });
});
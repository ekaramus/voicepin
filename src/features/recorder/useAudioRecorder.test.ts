import { act, renderHook } from "@testing-library/react";
import { useAudioRecorder } from "./useAudioRecorder";

class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);

  state: "inactive" | "recording" = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {}

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";

    this.ondataavailable?.({
      data: new Blob(["audio"], { type: "audio/webm" }),
    } as BlobEvent);

    this.onstop?.();
  }
}

const stopTrack = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();

  vi.stubGlobal("MediaRecorder", MockMediaRecorder);

  Object.defineProperty(global.navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: stopTrack }],
      }),
    },
    configurable: true,
  });

  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:voicepin-audio"),
    revokeObjectURL: vi.fn(),
  });

  vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useAudioRecorder", () => {
  it("starts recording after microphone permission is granted", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.status).toBe("recording");
    expect(result.current.isRecording).toBe(true);
  });

  it("creates recorded audio when stopped after minimum duration", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      vi.advanceTimersByTime(1_500);
      vi.setSystemTime(new Date("2026-01-01T00:00:01.500Z"));
      result.current.stopRecording();
    });

    expect(result.current.status).toBe("recorded");
    expect(result.current.audio?.url).toBe("blob:voicepin-audio");
    expect(result.current.audio?.durationMs).toBeGreaterThanOrEqual(1_000);
    expect(stopTrack).toHaveBeenCalled();
  });

  it("rejects recordings shorter than minimum duration", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      vi.advanceTimersByTime(500);
      vi.setSystemTime(new Date("2026-01-01T00:00:00.500Z"));
      result.current.stopRecording();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("too-short");
    expect(result.current.audio).toBeNull();
  });

  it("auto-stops at the maximum duration", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      vi.setSystemTime(new Date("2026-01-01T00:00:20.000Z"));
      vi.advanceTimersByTime(20_000);
    });

    expect(result.current.status).toBe("recorded");
    expect(result.current.audio).not.toBeNull();
  });

  it("handles permission denial", async () => {
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("denied")),
      },
      configurable: true,
    });

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("permission-denied");
  });
});
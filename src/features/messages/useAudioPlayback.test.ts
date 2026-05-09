import { act, renderHook } from "@testing-library/react";
import { useAudioPlayback } from "./useAudioPlayback";

describe("useAudioPlayback", () => {
  it("starts with fallback duration and zero progress", () => {
    const { result } = renderHook(() =>
      useAudioPlayback({
        audioUrl: "blob:test-audio",
        fallbackDurationMs: 8_000,
      })
    );

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.durationMs).toBe(8_000);
    expect(result.current.progress).toBe(0);
  });

  it("resets when audio url changes", () => {
    const { result, rerender } = renderHook(
      ({ audioUrl }) =>
        useAudioPlayback({
          audioUrl,
          fallbackDurationMs: 8_000,
        }),
      {
        initialProps: {
          audioUrl: "blob:first-audio",
        },
      }
    );

    act(() => {
      result.current.handleEnded();
    });

    rerender({
      audioUrl: "blob:second-audio",
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.durationMs).toBe(8_000);
  });

  it("marks playback as ended", () => {
    const { result } = renderHook(() =>
      useAudioPlayback({
        audioUrl: "blob:test-audio",
        fallbackDurationMs: 8_000,
      })
    );

    act(() => {
      result.current.handleEnded();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTimeMs).toBe(0);
  });
});
import { act, renderHook } from "@testing-library/react";
import { useDraftSnapshot } from "./useDraftSnapshot";
import type { RecordedAudio } from "@/features/recorder/recorder.types";

const audio: RecordedAudio = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  durationMs: 8_000,
  url: "blob:test-audio", // original recorder URL (no longer used directly)
};

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "draft-1"),
  });

  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:draft-audio"),
    revokeObjectURL: vi.fn(),
  });

  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-26T12:00:00.000Z"));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useDraftSnapshot", () => {
  it("starts without a draft", () => {
    const { result } = renderHook(() => useDraftSnapshot());

    expect(result.current.draft).toBeNull();
    expect(result.current.hasDraft).toBe(false);
  });

  it("creates a draft from recorded audio", () => {
    const { result } = renderHook(() => useDraftSnapshot());

    act(() => {
      result.current.createDraft(audio);
    });

    expect(result.current.draft).toEqual({
      id: "draft-1",
      blob: audio.blob,
      audioUrl: "blob:draft-audio", // ← comes from mocked createObjectURL
      durationMs: 8_000,
      createdAt: "2026-04-26T12:00:00.000Z",
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(audio.blob);
    expect(result.current.hasDraft).toBe(true);
  });

  it("replaces existing draft with a new one", () => {
    const { result } = renderHook(() => useDraftSnapshot());

    act(() => {
      result.current.createDraft(audio);
      result.current.createDraft({
        ...audio,
        durationMs: 10_000,
        blob: new Blob(["new"], { type: "audio/webm" }),
      });
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:draft-audio");
    expect(result.current.draft?.durationMs).toBe(10_000);
  });

  it("clears the draft", () => {
    const { result } = renderHook(() => useDraftSnapshot());

    act(() => {
      result.current.createDraft(audio);
      result.current.clearDraft();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:draft-audio");
    expect(result.current.draft).toBeNull();
    expect(result.current.hasDraft).toBe(false);
  });
});
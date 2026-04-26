import { createMessageFromDraft } from "./createMessageFromDraft";
import type { DraftVoiceSnapshot } from "@/features/drafts/draft.types";

const draft: DraftVoiceSnapshot = {
  id: "draft-1",
  audioUrl: "blob:test-audio",
  durationMs: 8_000,
  createdAt: "2026-04-26T12:00:00.000Z",
};

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "message-1"),
  });

  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-26T12:05:00.000Z"));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("createMessageFromDraft", () => {
  it("creates a local voice message from draft", () => {
    expect(
      createMessageFromDraft({
        draft,
        conversationId: "me",
      })
    ).toEqual({
      id: "message-1",
      conversationId: "me",
      sender: "me",
      audioUrl: "blob:test-audio",
      durationMs: 8_000,
      transcript: null,
      status: "local",
      createdAt: "2026-04-26T12:05:00.000Z",
    });
  });
});
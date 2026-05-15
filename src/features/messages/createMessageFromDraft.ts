import type { DraftVoiceSnapshot } from "@/features/drafts/draft.types";
import type { VoiceMessage } from "./message.types";

type CreateMessageFromDraftInput = {
  draft: DraftVoiceSnapshot;
  conversationId: string;
};

export function createMessageFromDraft({
  draft,
  conversationId,
}: CreateMessageFromDraftInput): VoiceMessage {
  return {
    id: crypto.randomUUID(),
    conversationId,
    sender: "me",
    audioUrl: draft.audioUrl,
    durationMs: draft.durationMs,
    transcript: null,
    status: "transcribing",
    createdAt: new Date().toISOString(),
  };
}
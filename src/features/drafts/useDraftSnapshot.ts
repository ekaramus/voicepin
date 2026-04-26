"use client";

import { useCallback, useState } from "react";
import type { RecordedAudio } from "@/features/recorder/recorder.types";
import type { DraftVoiceSnapshot } from "./draft.types";

export function useDraftSnapshot() {
  const [draft, setDraft] = useState<DraftVoiceSnapshot | null>(null);

  const createDraft = useCallback((audio: RecordedAudio) => {
    setDraft({
      id: crypto.randomUUID(),
      audioUrl: audio.url,
      durationMs: audio.durationMs,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const clearDraft = useCallback(() => {
    setDraft(null);
  }, []);

  return {
    draft,
    hasDraft: draft !== null,
    createDraft,
    clearDraft,
  };
}
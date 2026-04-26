"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecordedAudio } from "@/features/recorder/recorder.types";
import type { DraftVoiceSnapshot } from "./draft.types";

export function useDraftSnapshot() {
  const [draft, setDraft] = useState<DraftVoiceSnapshot | null>(null);

  const revokeDraftUrl = useCallback((draftToRevoke: DraftVoiceSnapshot | null) => {
    if (draftToRevoke?.audioUrl) {
      URL.revokeObjectURL(draftToRevoke.audioUrl);
    }
  }, []);

  const createDraft = useCallback(
    (audio: RecordedAudio) => {
      setDraft((currentDraft) => {
        revokeDraftUrl(currentDraft);

        return {
          id: crypto.randomUUID(),
          audioUrl: audio.url,
          durationMs: audio.durationMs,
          createdAt: new Date().toISOString(),
        };
      });
    },
    [revokeDraftUrl]
  );

  const clearDraft = useCallback(() => {
    setDraft((currentDraft) => {
      revokeDraftUrl(currentDraft);
      return null;
    });
  }, [revokeDraftUrl]);

  useEffect(() => {
    return () => {
      revokeDraftUrl(draft);
    };
  }, [draft, revokeDraftUrl]);

  return {
    draft,
    hasDraft: draft !== null,
    createDraft,
    clearDraft,
  };
}
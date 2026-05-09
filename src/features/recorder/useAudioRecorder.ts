"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MAX_RECORDING_MS,
  MIN_RECORDING_MS,
  RECORDING_MIME_TYPE,
} from "./recorder.constants";
import type { RecordedAudio, RecorderError, RecorderStatus } from "./recorder.types";

type UseAudioRecorderResult = {
  status: RecorderStatus;
  error: RecorderError | null;
  durationMs: number;
  audio: RecordedAudio | null;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
};

export function useAudioRecorder(): UseAudioRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [audio, setAudio] = useState<RecordedAudio | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (maxTimerRef.current) {
      window.clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resetRecording = useCallback(() => {
    clearTimers();

    if (audio?.url) {
      URL.revokeObjectURL(audio.url);
    }

    chunksRef.current = [];
    startedAtRef.current = null;
    setDurationMs(0);
    setAudio(null);
    setError(null);
    setStatus("idle");
  }, [audio, clearTimers]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("not-supported");
      setStatus("error");
      return;
    }

    try {
      setStatus("requesting-permission");
      setError(null);
      setAudio(null);
      setDurationMs(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(RECORDING_MIME_TYPE)
          ? RECORDING_MIME_TYPE
          : undefined,
      });

      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError("unknown");
        setStatus("error");
        clearTimers();
        stopStream();
      };

      recorder.onstop = () => {
        clearTimers();
        stopStream();

        const finalDurationMs =
          startedAtRef.current === null ? 0 : Date.now() - startedAtRef.current;

        setDurationMs(finalDurationMs);

        if (finalDurationMs < MIN_RECORDING_MS) {
          setError("too-short");
          setStatus("error");
          chunksRef.current = [];
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: RECORDING_MIME_TYPE,
        });

        const url = URL.createObjectURL(blob);

        setAudio({
          blob,
          durationMs: finalDurationMs,
          url,
        });

        setStatus("recorded");
      };

      recorder.start();
      setStatus("recording");

      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current !== null) {
          setDurationMs(Date.now() - startedAtRef.current);
        }
      }, 100);

      maxTimerRef.current = window.setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_MS);
    } catch {
      setError("permission-denied");
      setStatus("error");
      clearTimers();
      stopStream();
    }
  }, [clearTimers, stopRecording, stopStream]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopStream();

      if (audio?.url) {
        URL.revokeObjectURL(audio.url);
      }
    };
  }, [audio?.url, clearTimers, stopStream]);

  return {
    status,
    error,
    durationMs,
    audio,
    isRecording: status === "recording",
    startRecording,
    stopRecording,
    resetRecording,
  };
}
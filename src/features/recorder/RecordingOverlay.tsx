"use client";

import { Mic, Square } from "lucide-react";

type RecordingOverlayProps = {
  mode: "draft" | "conversation";
  status: "idle" | "recording" | "stopped" | "error";
  error: string | null;
  durationMs: number;
  audioUrl?: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onClose: () => void;
  onSend: () => void;
};

const MAX_RECORDING_DURATION_MS = 20_000;

function formatSeconds(durationMs: number) {
  return Math.floor(durationMs / 1000);
}

function getRecordingProgress(durationMs: number) {
  return Math.min(durationMs / MAX_RECORDING_DURATION_MS, 1);
}

function getSecondsLeft(durationMs: number) {
  return Math.max(
    0,
    Math.ceil((MAX_RECORDING_DURATION_MS - durationMs) / 1000)
  );
}

export function RecordingOverlay({
  mode,
  status,
  error,
  durationMs,
  audioUrl,
  onStart,
  onStop,
  onReset,
  onClose,
  onSend,
}: RecordingOverlayProps) {
  const isRecording = status === "recording";
  const hasPreview = Boolean(audioUrl);

  const progress = getRecordingProgress(durationMs);
  const secondsLeft = getSecondsLeft(durationMs);
  const progressDegrees = progress * 360;

  function handlePrimaryAction() {
    if (isRecording) {
      onStop();
      return;
    }

    onStart();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recording-overlay-title"
      className="fixed inset-0 z-20 flex flex-col bg-[#27251f] text-[#f4ead7]"
    >
      <header className="flex items-center justify-between border-b-2 border-[#f4ead7] px-5 py-4">
        <h2
          id="recording-overlay-title"
          className="text-lg font-black tracking-[-0.08em]"
        >
          Tiny thought
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close recorder and discard current recording"
          className="rounded-xl border-2 border-[#f7d35f] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f7d35f] shadow-[3px_3px_0_#f7d35f] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Close
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f7d35f]">
          {mode === "draft" ? "Draft snapshot" : "Voice message"}
        </p>

        <div className="mt-6 grid place-items-center">
          <div
            role="timer"
            aria-label={`${secondsLeft} seconds left out of 20`}
            className="grid h-40 w-40 place-items-center rounded-full border-[3px] border-[#f4ead7]"
            style={{
              background: `conic-gradient(#f7d35f ${progressDegrees}deg, #3a352b ${progressDegrees}deg)`,
            }}
          >
            <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-[#f4ead7] bg-[#27251f]">
              <div>
                <p className="text-5xl font-black tracking-[-0.08em]">
                  {formatSeconds(durationMs)}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f7d35f]">
                  of 20s
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#eadfc9]">
            {secondsLeft}s left
          </p>
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-[#eadfc9]">
          {isRecording
            ? secondsLeft <= 5
              ? `Almost there. ${secondsLeft} seconds left.`
              : "Recording now. Tap stop to finish."
            : hasPreview
              ? "Recording ready. You can send, save, or reset it."
              : "Tap record to start."}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-2xl border-2 border-[#f7d35f] p-3 text-sm text-[#f7d35f]"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePrimaryAction}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          aria-pressed={isRecording}
          className="mt-8 grid h-24 w-24 place-items-center rounded-full border-[3px] border-[#f4ead7] bg-[#d94f2b] text-[#f4ead7] shadow-[6px_6px_0_#f4ead7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          {isRecording ? (
            <Square aria-hidden="true" size={34} fill="currentColor" />
          ) : (
            <Mic aria-hidden="true" size={38} strokeWidth={3} />
          )}
        </button>

        <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#eadfc9]">
          {isRecording ? "Stop recording" : "Start recording"}
        </p>

        {hasPreview && !isRecording && (
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <audio controls src={audioUrl} className="w-full" />

            <button
              type="button"
              onClick={onSend}
              className="rounded-2xl border-2 border-[#f4ead7] bg-[#f7d35f] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#27251f] shadow-[4px_4px_0_#f4ead7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {mode === "draft" ? "Save draft" : "Send"}
            </button>

            <button
              type="button"
              onClick={onReset}
              aria-label="Discard current recording and record again"
              className="rounded-2xl border-2 border-[#f7d35f] bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f7d35f] shadow-[4px_4px_0_#f7d35f] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Discard and record again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
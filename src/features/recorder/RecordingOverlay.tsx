import { MAX_RECORDING_MS } from "./recorder.constants";
import type { RecorderError, RecorderStatus } from "./recorder.types";
import { RecordButton } from "./RecordButton";

type RecordingOverlayProps = {
  status: RecorderStatus;
  error: RecorderError | null;
  durationMs: number;
  audioUrl?: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onClose: () => void;
  onSend: () => void;
};

function formatDuration(durationMs: number) {
  const seconds = Math.floor(durationMs / 1000);
  return `0:${seconds.toString().padStart(2, "0")}`;
}

export function RecordingOverlay({
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
  const isRecorded = status === "recorded";
  const progress = Math.min(durationMs / MAX_RECORDING_MS, 1);

  return (
    <section className="absolute inset-0 z-50 flex flex-col bg-[#27251f]/95 p-5 text-[#f4ead7]">
      <header className="rounded-3xl border-2 border-[#f4ead7] bg-[#3a352c] p-4 shadow-[6px_6px_0_#0f0e0c]">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#f7d35f]">
          Recording
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.08em]">
          Tiny thought
        </h2>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-6xl font-black tracking-[-0.12em]">
            {formatDuration(durationMs)}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#f7d35f]">
            / 0:20 max
          </p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full border-2 border-[#f4ead7] bg-[#3a352c]">
          <div
            className="h-full bg-[#d94f2b]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {audioUrl ? (
          <audio controls src={audioUrl} className="w-full" />
        ) : (
          <RecordButton
            isRecording={isRecording}
            onClick={isRecording ? onStop : onStart}
            label={isRecording ? "Stop recording" : "Start recording"}
          />
        )}

        {error && (
          <p role="alert" className="max-w-[260px] text-center text-sm text-[#f7d35f]">
            {error === "too-short"
              ? "Recording is too short. Try at least one second."
              : "Could not record audio. Check microphone permission."}
          </p>
        )}

        {isRecorded && (
          <p className="text-center text-sm text-[#d7cfbd]">
            Voice snapshot ready.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={isRecorded ? onReset : onClose}
          className="rounded-2xl border-2 border-[#f4ead7] px-4 py-4 text-sm font-black uppercase tracking-[0.16em]"
        >
          {isRecorded ? "Redo" : "Cancel"}
        </button>

        <button
          type="button"
          disabled={!isRecorded}
          onClick={onSend}
          className="rounded-2xl border-2 border-[#f4ead7] bg-[#d94f2b] px-4 py-4 text-sm font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_#0f0e0c] disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </section>
  );
}
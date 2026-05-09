import { formatDuration } from "./formatDuration";
import type { VoiceMessage } from "./message.types";
import { Pause, Play } from "lucide-react";
import { useAudioPlayback } from "./useAudioPlayback";

type AudioMessageBubbleProps = {
  message: VoiceMessage;
};

export function AudioMessageBubble({ message }: AudioMessageBubbleProps) {
  const playback = useAudioPlayback({
    audioUrl: message.audioUrl,
    fallbackDurationMs: message.durationMs,
  });

  return (
    <article className="rounded-[22px] border-2 border-[#27251f] bg-[#f7d35f] p-3 shadow-[4px_4px_0_#27251f]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            void playback.togglePlayback();
          }}
          aria-label={playback.isPlaying ? "Pause voice message" : "Play voice message"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#27251f] bg-[#d94f2b] text-[#f4ead7] shadow-[3px_3px_0_#27251f] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {playback.isPlaying ? (
            <Pause aria-hidden="true" size={20} strokeWidth={3} />
          ) : (
            <Play aria-hidden="true" size={20} strokeWidth={3} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div
            role="progressbar"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(playback.progress * 100)}
            className="h-3 overflow-hidden rounded-full border-2 border-[#27251f] bg-[#f4ead7]"
          >
            <div
              className="h-full bg-[#27251f]"
              style={{
                width: `${playback.progress * 100}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-black text-[#27251f]">
            <span>{formatDuration(playback.currentTimeMs)}</span>
            <span>{formatDuration(playback.durationMs)}</span>
          </div>
        </div>

        <audio
          ref={playback.audioRef}
          src={message.audioUrl}
          preload="metadata"
          onLoadedMetadata={playback.handleLoadedMetadata}
          onTimeUpdate={playback.handleTimeUpdate}
          onEnded={playback.handleEnded}
          className="hidden"
        />
      </div>

      {message.status === "transcribing" && (
        <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#6f6758]">
          Transcribing...
        </p>
      )}

      {message.status === "transcription_failed" && (
        <p
          role="alert"
          className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#d94f2b]"
        >
          Transcription failed
        </p>
      )}

      {message.status === "ready" && message.transcript && (
        <p className="mt-3 rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] px-3 py-2 text-sm leading-6 text-[#27251f]">
          {message.transcript}
        </p>
      )}
    </article>
  );
}
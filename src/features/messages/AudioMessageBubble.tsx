import { formatDuration } from "./formatDuration";
import type { VoiceMessage } from "./message.types";

type AudioMessageBubbleProps = {
  message: VoiceMessage;
};

export function AudioMessageBubble({ message }: AudioMessageBubbleProps) {
  return (
    <article className="rounded-[22px] border-2 border-[#27251f] bg-[#f7d35f] p-3 shadow-[4px_4px_0_#27251f]">
      <div className="flex items-center gap-3">
        <audio controls src={message.audioUrl} className="h-9 w-full" />

        <span className="shrink-0 text-xs font-black">
          {formatDuration(message.durationMs)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-5 text-[#27251f]">
        {message.transcript ?? "Transcript pending..."}
      </p>
    </article>
  );
}
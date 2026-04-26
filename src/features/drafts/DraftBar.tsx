import { formatDuration } from "@/features/messages/formatDuration";
import type { DraftVoiceSnapshot } from "./draft.types";

type DraftBarProps = {
  draft: DraftVoiceSnapshot;
  onSend: () => void;
  onDelete: () => void;
};

export function DraftBar({ draft, onSend, onDelete }: DraftBarProps) {
  return (
    <section className="border-t-2 border-[#27251f] bg-[#f7d35f] p-3">
      <div className="flex items-center gap-3">
        <audio
          aria-label="Draft audio preview"
          controls
          src={draft.audioUrl}
          className="h-9 min-w-0 flex-1"
        />

        <span className="shrink-0 text-xs font-black">
          {formatDuration(draft.durationMs)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_2fr] gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#27251f]"
        >
          Delete
        </button>

        <button
          type="button"
          onClick={onSend}
          className="rounded-2xl border-2 border-[#27251f] bg-[#d94f2b] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f4ead7] shadow-[3px_3px_0_#27251f]"
        >
          Send to...
        </button>
      </div>
    </section>
  );
}
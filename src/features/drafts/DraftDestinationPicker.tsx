import type { Conversation } from "@/features/conversations/conversation.types";
import type { DraftVoiceSnapshot } from "./draft.types";
import { formatDuration } from "@/features/messages/formatDuration";

type DraftDestinationPickerProps = {
  draft: DraftVoiceSnapshot;
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  onCancel: () => void;
};

export function DraftDestinationPicker({
  draft,
  conversations,
  onSelect,
  onCancel,
}: DraftDestinationPickerProps) {
  return (
    <section className="absolute inset-0 z-50 flex flex-col bg-[#27251f]/95 p-5 text-[#f4ead7]">
      <header className="rounded-3xl border-2 border-[#f4ead7] bg-[#3a352c] p-4 shadow-[6px_6px_0_#0f0e0c]">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#f7d35f]">
          Draft snapshot
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.08em]">
          Send where?
        </h2>
        <p className="mt-2 text-sm text-[#d7cfbd]">
          {formatDuration(draft.durationMs)} voice snapshot
        </p>
      </header>

      <div className="mt-5 flex-1 overflow-y-auto">
        
        {
        conversations.length === 0 ?
        (<p className="rounded-2xl border-2 border-[#f4ead7] p-4 text-sm text-[#d7cfbd]">
          No conversations available. Refresh and try again.
        </p>) 
        :
        (conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            aria-label={`Send to ${conversation.name}`}
            onClick={() => onSelect(conversation)}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl border-2 border-[#f4ead7] bg-[#f4ead7] p-4 text-left text-[#27251f] shadow-[4px_4px_0_#0f0e0c]"
          >
            <span
              className={
                conversation.type === "self"
                  ? "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#27251f] bg-[#f7d35f] text-sm font-black"
                  : "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#27251f] bg-[#b8d8c0] text-sm font-black"
              }
            >
              {conversation.initials}
            </span>

            <span>
              <span className="block font-black">{conversation.name}</span>
              <span className="text-xs uppercase tracking-[0.14em] text-[#6f6758]">
                {conversation.type === "self" ? "Private tape" : "1:1"}
              </span>
            </span>
          </button>
        )))
        }
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border-2 border-[#f4ead7] px-4 py-4 text-sm font-black uppercase tracking-[0.16em]"
      >
        Cancel
      </button>
    </section>
  );
}
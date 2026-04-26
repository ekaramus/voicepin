import { formatDuration } from "@/features/messages/formatDuration";
import type { Conversation } from "./conversation.types";

type ConversationRowProps = {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
};

export function ConversationRow({ conversation, onClick }: ConversationRowProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(conversation)}
      className="w-full border-b-2 border-[#27251f] p-4 text-left active:bg-[#eadfc9]"
    >
      <div className="flex items-start gap-3">
        <div
          className={
            conversation.isPinned
              ? "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#27251f] bg-[#f7d35f] text-sm font-black shadow-[4px_4px_0_#27251f]"
              : "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#27251f] bg-[#b8d8c0] text-sm font-black shadow-[4px_4px_0_#27251f]"
          }
        >
          {conversation.initials}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-black tracking-[-0.04em]">{conversation.name}</h2>

          <p className="mt-1 truncate text-sm text-[#5a5347]">
            {conversation.preview}
          </p>

          <p className="mt-2 text-xs font-bold text-[#d94f2b]">
            {formatDuration(conversation.durationMs)}
          </p>
        </div>
      </div>
    </button>
  );
}
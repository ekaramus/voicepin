import type { Conversation } from "./conversation.types";

type ConversationHeaderProps = {
  conversation: Conversation;
  onBack: () => void;
};

export function ConversationHeader({
  conversation,
  onBack,
}: ConversationHeaderProps) {
  const subtitle =
    conversation.type === "self" ? "private tape" : "1:1 voice pings";

  return (
    <header className="border-b-2 border-[#27251f] bg-[#f4ead7] px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to conversations"
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#27251f] bg-[#f7d35f] shadow-[3px_3px_0_#27251f] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          ←
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black tracking-[-0.08em]">
            {conversation.name}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6f6758]">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
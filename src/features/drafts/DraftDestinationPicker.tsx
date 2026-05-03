"use client";

import type { Conversation } from "@/features/conversations/conversation.types";
import type { DraftVoiceSnapshot } from "./draft.types";

type DraftDestinationPickerProps = {
  draft: DraftVoiceSnapshot;
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  onCancel: () => void;
  sendStatus?: "idle" | "sending" | "error";
  sendError?: string | null;
};

export function DraftDestinationPicker({
  draft,
  conversations,
  onSelect,
  onCancel,
  sendStatus = "idle",
  sendError = null,
}: DraftDestinationPickerProps) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-[#eadfc9]">
      <header className="flex items-center justify-between border-b-2 border-[#27251f] px-5 py-4">
        <h2 className="text-lg font-black tracking-[-0.08em]">
          Send to
        </h2>

        <button
          type="button"
          onClick={onCancel}
          disabled={sendStatus === "sending"}
          className="text-xs font-black uppercase tracking-[0.12em] text-[#d94f2b] disabled:opacity-50"
        >
          Cancel
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 text-sm text-[#6f6758]">
          {Math.round(draft.durationMs / 1000)}s voice snapshot
        </div>

        {sendStatus === "error" && sendError && (
          <p
            role="alert"
            className="mb-4 rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] p-3 text-sm text-[#d94f2b]"
          >
            {sendError}
          </p>
        )}

        <div className="space-y-3">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              aria-label={`Send draft to ${conversation.name}`}
              onClick={() => onSelect(conversation)}
              disabled={sendStatus === "sending"}
              className="flex w-full items-center justify-between rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] px-4 py-4 text-left shadow-[4px_4px_0_#27251f] disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-black tracking-[-0.04em]">
                  {conversation.name}
                </p>

                <p className="mt-1 text-xs text-[#6f6758]">
                  {conversation.preview}
                </p>
              </div>

              <span className="ml-4 text-xs font-black uppercase tracking-[0.12em] text-[#d94f2b]">
                {sendStatus === "sending" ? "Sending..." : "Send"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
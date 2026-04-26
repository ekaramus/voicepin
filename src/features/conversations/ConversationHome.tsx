"use client";

import { useEffect, useState } from "react";
import { ConversationDetail } from "./ConversationDetail";
import { ConversationRow } from "./ConversationRow";
import { listConversations } from "./conversation.repository";
import type { Conversation } from "./conversation.types";

export function ConversationHome() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      const data = await listConversations();

      if (isMounted) {
        setConversations(data);
      }
    }

    void loadConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  if (selectedConversation) {
    return (
      <ConversationDetail
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-[#27251f] px-5 py-4">
        <h1 className="text-2xl font-black tracking-[-0.08em]">
          VoicePin
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6f6758]">
          tiny voice snapshots
        </p>
      </header>

      <section className="border-b-2 border-[#27251f] bg-[#27251f] px-5 py-3 text-[#f4ead7]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#f7d35f]">
          Beta recorder
        </p>
        <p className="mt-1 text-sm">
          No typing. Max 20 seconds.
        </p>
      </section>

      <div>
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            onClick={setSelectedConversation}
          />
        ))}
      </div>
    </div>
  );
}
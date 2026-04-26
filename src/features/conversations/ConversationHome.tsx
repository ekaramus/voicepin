"use client";

import { useEffect, useState } from "react";
import { ConversationRow } from "./ConversationRow";
import { listConversations } from "./conversation.repository";
import type { Conversation } from "./conversation.types";import { RecordingOverlay } from "@/features/recorder/RecordingOverlay";
import { RecordButton } from "@/features/recorder/RecordButton";
import { useAudioRecorder } from "@/features/recorder/useAudioRecorder";
import { AudioMessageBubble } from "@/features/messages/AudioMessageBubble";
import type { VoiceMessage } from "@/features/messages/message.types";

export function ConversationHome() {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);  const recorder = useAudioRecorder();

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
  
  function closeRecorder() {
    setIsRecorderOpen(false);
    recorder.resetRecording();
  }

  function sendLocalMessage() {
    if (!recorder.audio) {
      return;
    }

    const message: VoiceMessage = {
      id: crypto.randomUUID(),
      conversationId: "me",
      sender: "me",
      audioUrl: recorder.audio.url,
      durationMs: recorder.audio.durationMs,
      transcript: null,
      status: "local",
      createdAt: new Date().toISOString(),
    };

    setMessages((currentMessages) => [message, ...currentMessages]);
    setIsRecorderOpen(false);
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="border-b-2 border-[#27251f] px-5 py-4">
        <h1 className="text-2xl font-black tracking-[-0.08em]">VoicePin</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6f6758]">
          tiny voice snapshots
        </p>
      </header>

      <section className="border-b-2 border-[#27251f] bg-[#27251f] px-5 py-3 text-[#f4ead7]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#f7d35f]">
          Beta recorder
        </p>
        <p className="mt-1 text-sm">No typing. Max 20 seconds.</p>
      </section>

      <div>
        {conversations.map((conversation) => (
          <ConversationRow key={conversation.id} conversation={conversation} />
        ))}
      </div>

      {messages.length > 0 && (
        <section className="space-y-4 border-t-2 border-[#27251f] bg-[#eadfc9] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6f6758]">
            Local tape
          </p>

          {messages.map((message) => (
            <AudioMessageBubble key={message.id} message={message} />
          ))}
        </section>
      )}

      <div className="mt-auto flex justify-center p-6">
        <RecordButton
          onClick={() => {
            setIsRecorderOpen(true);
          }}
        />
      </div>

      {isRecorderOpen && (
        <RecordingOverlay
          status={recorder.status}
          error={recorder.error}
          durationMs={recorder.durationMs}
          audioUrl={recorder.audio?.url}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
          onReset={recorder.resetRecording}
          onClose={closeRecorder}
          onSend={sendLocalMessage}
        />
      )}
    </div>
  );
}
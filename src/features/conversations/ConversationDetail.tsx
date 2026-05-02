"use client";

import { useEffect, useState } from "react";
import { AudioMessageBubble } from "@/features/messages/AudioMessageBubble";
import { listMessagesByConversation } from "@/features/messages/message.repository";
import type { VoiceMessage } from "@/features/messages/message.types";
import { RecordButton } from "@/features/recorder/RecordButton";
import { RecordingOverlay } from "@/features/recorder/RecordingOverlay";
import { useAudioRecorder } from "@/features/recorder/useAudioRecorder";
import { ConversationHeader } from "./ConversationHeader";
import type { Conversation } from "./conversation.types";
import { uploadAudio } from "@/features/messages/uploadAudio";
import { insertMessage } from "@/features/messages/message.mutations";

type ConversationDetailProps = {
  conversation: Conversation;
  onBack: () => void;
};

export function ConversationDetail({
  conversation,
  onBack,
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const recorder = useAudioRecorder();

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      const data = await listMessagesByConversation(conversation.id);

      if (isMounted) {
        setMessages(data);
      }
    }

    void loadMessages();

    return () => {
      isMounted = false;
    };
  }, [conversation.id]);

  function closeRecorder() {
    setIsRecorderOpen(false);
    recorder.resetRecording();
  }

  async function sendLocalMessage() {
    if (!recorder.audio) {
      return;
    }

    try {
      const { path, publicUrl } = await uploadAudio(recorder.audio.blob);

      await insertMessage({
        conversationId: conversation.id,
        audioPath: path,
        durationMs: recorder.audio.durationMs,
      });

      const message: VoiceMessage = {
        id: crypto.randomUUID(),
        conversationId: conversation.id,
        sender: "me",
        audioUrl: publicUrl,
        durationMs: recorder.audio.durationMs,
        transcript: null,
        status: "local",
        createdAt: new Date().toISOString(),
      };

      setMessages((currentMessages) => [...currentMessages, message]);
      setIsRecorderOpen(false);
      recorder.resetRecording();
    } catch (error) {
      console.error("Failed to send direct message:", error);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <ConversationHeader conversation={conversation} onBack={onBack} />

      <main className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(#eadfc9_1px,transparent_1px)] bg-[length:100%_34px] px-4 py-5 pb-32">
        <div className="rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] p-3 text-center text-xs uppercase tracking-[0.14em] text-[#6f6758] shadow-[3px_3px_0_#27251f]">
          {conversation.type === "self"
            ? "private voice memories"
            : "short thoughts only"}{" "}
          · 20s max
        </div>

        {messages.length === 0 ? (
          <div className="rounded-[22px] border-2 border-dashed border-[#27251f] bg-[#f4ead7] p-5 text-center text-sm text-[#6f6758]">
            No voice snapshots yet.
          </div>
        ) : (
          messages.map((message) => (
            <AudioMessageBubble key={message.id} message={message} />
          ))
        )}
      </main>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <RecordButton onClick={() => setIsRecorderOpen(true)} />
      </div>

      {isRecorderOpen && (
        <RecordingOverlay
          mode="direct"
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
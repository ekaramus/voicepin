"use client";

import { useCallback, useEffect, useState } from "react";
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
import { subscribeToConversationMessages } from "@/features/messages/message.realtime";
import { requestTranscription } from "@/features/messages/requestTranscription";
import { getErrorMessage } from "@/lib/getErrorMessage";

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
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "error">("idle");
  const [sendError, setSendError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setStatus("loading");

      const data = await listMessagesByConversation(conversation.id);

      setMessages(data);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load messages:", error);
      setStatus("error");
    }
  }, [conversation.id]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const unsubscribe = subscribeToConversationMessages({
      conversationId: conversation.id,
      onMessageChange: () => {
        void loadMessages();
      },
    });

    return unsubscribe;
  }, [conversation.id, loadMessages]);

  function closeRecorder() {
    setIsRecorderOpen(false);
    recorder.resetRecording();
  }

  async function sendLocalMessage() {
    if (!recorder.audio || sendStatus === "sending") {
      return;
    }

    try {
      setSendStatus("sending");
      setSendError(null);

      const { path } = await uploadAudio(recorder.audio.blob);

      const message = await insertMessage({
        conversationId: conversation.id,
        audioPath: path,
        durationMs: recorder.audio.durationMs,
      });

      void requestTranscription({
        messageId: message.id,
        audioUrl: message.audioUrl,
      }).catch((error) => {
        console.error("Failed to request transcription:", error);
      });

      setIsRecorderOpen(false);
      recorder.resetRecording();

      await loadMessages();

      setSendStatus("idle");
    } catch (error) {
      setSendStatus("error");
      setSendError(
        getErrorMessage(error, "Could not send voice snapshot.")
      );
    }
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <ConversationHeader conversation={conversation} onBack={onBack} />

      <main className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(#eadfc9_1px,transparent_1px)] bg-[length:100%_34px] px-4 py-5 pb-32">
        {status === "loading" && (
          <div className="rounded-[22px] border-2 border-dashed border-[#27251f] bg-[#f4ead7] p-5 text-center text-sm text-[#6f6758]">
            Loading voice snapshots...
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="rounded-[22px] border-2 border-[#27251f] bg-[#f4ead7] p-5 text-center text-sm text-[#d94f2b]">
            Could not load voice snapshots.
          </div>
        )}

        {status === "ready" && messages.length === 0 && (
          <div className="rounded-[22px] border-2 border-dashed border-[#27251f] bg-[#f4ead7] p-5 text-center text-sm text-[#6f6758]">
            No voice snapshots yet.
          </div>
        )}

        {status === "ready" &&
          messages.map((message) => (
            <AudioMessageBubble key={message.id} message={message} />
          )
        )}
        
        {sendStatus === "error" && sendError && (
          <div role="alert" className="rounded-[22px] border-2 border-[#27251f] bg-[#f4ead7] p-5 text-center text-sm text-[#d94f2b]">
            {sendError}
          </div>
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
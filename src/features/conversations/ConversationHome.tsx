"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationDetail } from "./ConversationDetail";
import { ConversationRow } from "./ConversationRow";
import { listConversations } from "./conversation.repository";
import type { Conversation } from "./conversation.types";
import { DraftBar } from "@/features/drafts/DraftBar";
import { DraftDestinationPicker } from "@/features/drafts/DraftDestinationPicker";
import { useDraftSnapshot } from "@/features/drafts/useDraftSnapshot";
import { RecordButton } from "@/features/recorder/RecordButton";
import { RecordingOverlay } from "@/features/recorder/RecordingOverlay";
import { useAudioRecorder } from "@/features/recorder/useAudioRecorder";
import { uploadAudio } from "@/features/messages/uploadAudio";
import { insertMessage } from "@/features/messages/message.mutations";
import { AddFriendForm } from "./AddFriendForm";
import { requestTranscription } from "@/features/messages/requestTranscription";
import { getErrorMessage } from "@/lib/getErrorMessage";

export function ConversationHome() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [conversationStatus, setConversationStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [conversationError, setConversationError] = useState<string | null>(
    null
  );

  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDestinationPickerOpen, setIsDestinationPickerOpen] = useState(false);
 
  const draftState = useDraftSnapshot();
  const [draftSendStatus, setDraftSendStatus] = useState<
    "idle" | "sending" | "error"
  >("idle");
  const [draftSendError, setDraftSendError] = useState<string | null>(null);
 
  const recorder = useAudioRecorder();
 
  const isRefreshingConversationsRef = useRef(false);

  const refreshConversations = useCallback(async () => {
    if (isRefreshingConversationsRef.current) {
      return;
    }

    try {
      isRefreshingConversationsRef.current = true;
      setConversationStatus("loading");
      setConversationError(null);

      const data = await listConversations();

      setConversations(data);
      setConversationStatus("ready");
    } catch (error) {
      console.error("Failed to load conversations:", error);

      setConversationStatus("error");
      setConversationError(
        getErrorMessage(error, "Could not load conversations.")
      );
    } finally {
      isRefreshingConversationsRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialConversations() {
      try {
        const data = await listConversations();

        if (!isMounted) {
          return;
        }

        setConversations(data);
        setConversationStatus("ready");
      } catch (error) {
        console.error("Failed to load conversations:", error);

        if (!isMounted) {
          return;
        }

        setConversationStatus("error");
        setConversationError(
          getErrorMessage(error, "Could not load conversations.")
        );
      }
    }

    void loadInitialConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  function closeRecorder() {
    setIsRecorderOpen(false);
    recorder.resetRecording();
  }

  function createDraftFromRecording() {
    if (!recorder.audio) {
      return;
    }

    draftState.createDraft(recorder.audio);
    setIsRecorderOpen(false);
    recorder.resetRecording();
  }

  async function sendDraftToConversation(conversation: Conversation) {
    if (!draftState.draft || draftSendStatus === "sending") {
      return;
    }

    try {
      setDraftSendStatus("sending");
      setDraftSendError(null);

      const { path } = await uploadAudio(draftState.draft.blob);

      const message = await insertMessage({
        conversationId: conversation.id,
        audioPath: path,
        durationMs: draftState.draft.durationMs,
      });

      draftState.clearDraft();
      setIsDestinationPickerOpen(false);
      setDraftSendStatus("idle");

      await refreshConversations();

      void requestTranscription({
        messageId: message.id,
        audioUrl: message.audioUrl,
      }).catch((error) => {
        console.error("Failed to request transcription:", error);
      });
    } catch (error) {
      setDraftSendStatus("error");
      setDraftSendError(
        getErrorMessage(error, "Could not send voice snapshot.")
      );
    }
  }

  function handleConversationReady(conversation: Conversation) {
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);

      if (exists) {
        return current;
      }

      return [...current, conversation];
    });

    setSelectedConversation(conversation);
  }

  function handleBackToConversations() {
    setSelectedConversation(null);
    void refreshConversations();
  }

  if (selectedConversation) {
    return (
      <ConversationDetail
        conversation={selectedConversation}
        onBack={handleBackToConversations}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
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

      {conversationStatus === "loading" && (
        <p className="px-5 py-4 text-sm text-[#6f6758]">
          Loading conversations...
        </p>
      )}

      {conversationStatus === "error" && (
        <p
          role="alert"
          className="mx-5 mt-4 rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] p-4 text-sm text-[#d94f2b]"
        >
          {conversationError ?? "Could not load conversations."}
        </p>
      )}

      <div>
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            onClick={setSelectedConversation}
          />
        ))}
      </div>

      <div className="mt-auto flex justify-center p-6">
        <RecordButton onClick={() => setIsRecorderOpen(true)} />
      </div>

      <AddFriendForm onConversationReady={handleConversationReady} />

      {draftState.draft && (
        <DraftBar
          draft={draftState.draft}
          onSend={() => {
            setDraftSendStatus("idle");
            setDraftSendError(null);
            setIsDestinationPickerOpen(true);
          }}
          onDelete={draftState.clearDraft}
        />
      )}

      {isRecorderOpen && (
        <RecordingOverlay
          mode="draft"
          status={recorder.status}
          error={recorder.error}
          durationMs={recorder.durationMs}
          audioUrl={recorder.audio?.url}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
          onReset={recorder.resetRecording}
          onClose={closeRecorder}
          onSend={createDraftFromRecording}
        />
      )}

      {draftState.draft && isDestinationPickerOpen && (
        <DraftDestinationPicker
          draft={draftState.draft}
          conversations={conversations}
          onSelect={sendDraftToConversation}
          onCancel={() => setIsDestinationPickerOpen(false)}
          sendStatus={draftSendStatus}
          sendError={draftSendError}
        />
      )}
    </div>
  );
}
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { VoiceMessage, VoiceMessageStatus } from "./message.types";
import { requestAudioUrl } from "./requestAudioUrl";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  audio_path: string;
  duration_ms: number;
  transcript: string | null;
  transcription_status: "transcribing" | "ready" | "failed" | null;
  created_at: string;
};

function mapTranscriptionStatus(
  status: "transcribing" | "ready" | "failed" | null
): VoiceMessageStatus {
  if (status === "failed") {
    return "transcription_failed";
  }

  if (status === "ready") {
    return "ready";
  }

  return "transcribing";
}

async function mapMessage(row: MessageRow): Promise<VoiceMessage> {
  const audioUrl = await requestAudioUrl({
    messageId: row.id,
  });

  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: "me",
    audioUrl,
    durationMs: row.duration_ms,
    transcript: row.transcript,
    status: mapTranscriptionStatus(row.transcription_status),
    createdAt: row.created_at,
  };
}

export async function listMessagesByConversation(
  conversationId: string
): Promise<VoiceMessage[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, audio_path, duration_ms, transcript, transcription_status, created_at"
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return Promise.all(((data ?? []) as MessageRow[]).map(mapMessage));
}
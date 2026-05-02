import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { VoiceMessage } from "./message.types";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  audio_path: string;
  duration_ms: number;
  transcript: string | null;
  created_at: string;
};

export async function listMessagesByConversation(
  conversationId: string
): Promise<VoiceMessage[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, audio_path, duration_ms, transcript, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as MessageRow[]).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    sender: "me",
    audioUrl: supabase.storage
      .from("voice-messages")
      .getPublicUrl(row.audio_path).data.publicUrl,
    durationMs: row.duration_ms,
    transcript: row.transcript,
    status: row.transcript ? "ready" : "local",
    createdAt: row.created_at,
  }));
}
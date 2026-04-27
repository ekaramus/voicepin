import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { VoiceMessage } from "./message.types";

export async function listMessagesByConversation(
  conversationId: string
): Promise<VoiceMessage[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    sender: "me",
    audioUrl: supabase.storage
      .from("voice-messages")
      .getPublicUrl(row.audio_path).data.publicUrl,
    durationMs: row.duration_ms,
    transcript: row.transcript,
    status: "ready",
    createdAt: row.created_at,
  }));
}
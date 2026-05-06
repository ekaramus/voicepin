import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type InsertMessageInput = {
  conversationId: string;
  audioPath: string;
  durationMs: number;
};

type InsertMessageResult = {
  id: string;
  audioUrl: string;
};

export async function insertMessage({
  conversationId,
  audioPath,
  durationMs,
}: InsertMessageInput): Promise<InsertMessageResult> {
  const supabase = createSupabaseBrowserClient();
  const user = await getRequiredUser();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      audio_path: audioPath,
      duration_ms: durationMs,
      transcription_status: "transcribing",
    })
    .select("id, audio_path")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    audioUrl: supabase.storage.from("voice-messages").getPublicUrl(data.audio_path)
      .data.publicUrl,
  };
}
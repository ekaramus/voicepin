import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type InsertMessageInput = {
  conversationId: string;
  audioPath: string;
  durationMs: number;
};

export async function insertMessage({
  conversationId,
  audioPath,
  durationMs,
}: InsertMessageInput) {
  const supabase = createSupabaseBrowserClient();
  const user = await getRequiredUser();

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    audio_path: audioPath,
    duration_ms: durationMs,
    transcription_status: "transcribing",
  });

  if (error) {
    throw error;
  }
}
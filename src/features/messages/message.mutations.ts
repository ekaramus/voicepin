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

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    audio_path: audioPath,
    duration_ms: durationMs,
  });

  if (error) {
    throw error;
  }
}
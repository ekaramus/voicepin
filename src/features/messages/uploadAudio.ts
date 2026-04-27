import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadAudio(blob: Blob) {
  const supabase = createSupabaseBrowserClient();

  const filePath = `audio-${crypto.randomUUID()}.webm`;

  const { error } = await supabase.storage
    .from("voice-messages")
    .upload(filePath, blob);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("voice-messages")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}
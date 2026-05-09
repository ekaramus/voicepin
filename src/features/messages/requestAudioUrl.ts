import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RequestAudioUrlInput = {
  messageId: string;
};

type AudioUrlResponse = {
  audioUrl?: string;
  error?: string;
};

export async function requestAudioUrl({
  messageId,
}: RequestAudioUrlInput): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("Authentication is required to load audio.");
  }

  const response = await fetch("/api/audio-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messageId,
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | AudioUrlResponse
    | null;

  if (!response.ok || !body?.audioUrl) {
    throw new Error(body?.error ?? "Could not load audio.");
  }

  return body.audioUrl;
}
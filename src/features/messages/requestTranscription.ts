import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RequestTranscriptionInput = {
  messageId: string;
  audioPath: string;
};

type TranscriptionErrorResponse = {
  error?: string;
  details?: string;
};

export async function requestTranscription({
  messageId,
  audioPath,
}: RequestTranscriptionInput): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("Authentication is required to transcribe audio.");
  }

  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messageId,
      audioPath,
    }),
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as TranscriptionErrorResponse | null;

    throw new Error(
      body?.details ?? body?.error ?? "Could not request transcription."
    );
  }
}
type RequestTranscriptionInput = {
  messageId: string;
  audioUrl: string;
};

type TranscriptionErrorResponse = {
  error?: string;
  details?: string;
};

export async function requestTranscription({
  messageId,
  audioUrl,
}: RequestTranscriptionInput): Promise<void> {
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messageId,
      audioUrl,
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
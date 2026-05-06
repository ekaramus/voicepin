type RequestTranscriptionInput = {
  messageId: string;
  audioUrl: string;
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
    throw new Error("Could not request transcription.");
  }
}
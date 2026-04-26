export type VoiceMessageStatus = "local" | "uploading" | "transcribing" | "ready" | "failed";

export type VoiceMessage = {
  id: string;
  conversationId: string;
  sender: "me";
  audioUrl: string;
  durationMs: number;
  transcript: string | null;
  status: VoiceMessageStatus;
  createdAt: string;
};
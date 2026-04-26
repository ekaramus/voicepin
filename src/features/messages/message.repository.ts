import { mockMessages } from "./message.mock";
import type { VoiceMessage } from "./message.types";

export async function listMessagesByConversation(
  conversationId: string
): Promise<VoiceMessage[]> {
  return mockMessages
    .filter((message) => message.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}
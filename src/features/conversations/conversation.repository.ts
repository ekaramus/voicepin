import { mockConversations } from "./conversation.mock";
import { sortConversations } from "./sortConversations";
import type { Conversation } from "./conversation.types";

export async function listConversations(): Promise<Conversation[]> {
  return sortConversations(mockConversations);
}
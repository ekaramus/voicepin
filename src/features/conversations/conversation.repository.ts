import { sortConversations } from "./sortConversations";
import type { Conversation } from "./conversation.types";
import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { getOrCreateSelfConversation } from "./selfConversation.repository";

export async function listConversations(): Promise<Conversation[]> {
  const user = await getRequiredUser();

  const selfConversation = await getOrCreateSelfConversation(user);

  return sortConversations([selfConversation]);
}
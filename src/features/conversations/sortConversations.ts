import type { Conversation } from "./conversation.types";

export function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    if (a.type === "self" && b.type !== "self") {
      return -1;
    }

    if (a.type !== "self" && b.type === "self") {
      return 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
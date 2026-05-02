import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { sortConversations } from "./sortConversations";
import type { Conversation } from "./conversation.types";
import { getOrCreateSelfConversation } from "./selfConversation.repository";

type MembershipRow = {
  conversation_id: string;
  conversations:
    | {
        id: string;
        type: "self" | "direct";
        created_at: string;
      }
    | {
        id: string;
        type: "self" | "direct";
        created_at: string;
      }[]
    | null;
};

function normalizeConversation(
  value: MembershipRow["conversations"]
): { id: string; type: "self" | "direct"; created_at: string } | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export async function listConversations(): Promise<Conversation[]> {
  const supabase = createSupabaseBrowserClient();
  const user = await getRequiredUser();

  const selfConversation = await getOrCreateSelfConversation(user);

  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id, conversations(id, type, created_at)")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  const directConversations: Conversation[] = [];

  for (const membership of (data ?? []) as MembershipRow[]) {
    const conversation = normalizeConversation(membership.conversations);

    if (!conversation || conversation.type !== "direct") {
      continue;
    }

    directConversations.push({
      id: conversation.id,
      type: "direct",
      name: "Friend",
      initials: "FR",
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: conversation.created_at,
    });
  }

  return sortConversations([selfConversation, ...directConversations]);
}
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/features/auth/auth.types";
import type { Conversation } from "./conversation.types";

type ConversationRow = {
  id: string;
  type: "self" | "direct";
  created_at: string;
};

function mapSelfConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    type: "self",
    name: "Me",
    initials: "ME",
    preview: "Private voice memories",
    durationMs: 0,
    isPinned: true,
    updatedAt: row.created_at,
  };
}

export async function getOrCreateSelfConversation(
  user: AuthUser
): Promise<Conversation> {
  const supabase = createSupabaseBrowserClient();

  const { data: existingMemberships, error: membershipError } = await supabase
    .from("conversation_members")
    .select("conversation_id, conversations(id, type, created_at)")
    .eq("user_id", user.id);

  if (membershipError) {
    throw membershipError;
  }

  const existingSelf = existingMemberships?.find(
    (membership) => membership.conversations?.type === "self"
  );

  if (existingSelf?.conversations) {
    return mapSelfConversation(existingSelf.conversations);
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({ type: "self" })
    .select("id, type, created_at")
    .single();

  if (conversationError) {
    throw conversationError;
  }

  const { error: memberError } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: conversation.id,
      user_id: user.id,
    });

  if (memberError) {
    throw memberError;
  }

  return mapSelfConversation(conversation);
}
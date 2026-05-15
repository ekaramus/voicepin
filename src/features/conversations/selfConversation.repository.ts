import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/features/auth/auth.types";
import type { Conversation } from "./conversation.types";

type ConversationRow = {
  id: string;
  type: "self" | "direct";
  created_at: string;
};

type MembershipRow = {
  conversation_id: string;
  conversations: ConversationRow | ConversationRow[] | null;
};

function normalizeConversation(
  value: MembershipRow["conversations"]
): ConversationRow | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function mapSelfConversation(conversation: ConversationRow): Conversation {
  return {
    id: conversation.id,
    type: "self",
    name: "Me",
    initials: "ME",
    preview: "Private voice memories",
    durationMs: 0,
    isPinned: true,
    updatedAt: conversation.created_at,
  };
}

export async function getOrCreateSelfConversation(
  user: AuthUser
): Promise<Conversation> {
  const supabase = createSupabaseBrowserClient();

  const { data: existingMemberships, error: existingMembershipsError } =
    await supabase
      .from("conversation_members")
      .select("conversation_id, conversations(id, type, created_at)")
      .eq("user_id", user.id);

  if (existingMembershipsError) {
    throw existingMembershipsError;
  }

  const existingSelfMembership = (existingMemberships ?? []).find(
    (membership) => {
      const conversation = normalizeConversation(
        (membership as MembershipRow).conversations
      );

      return conversation?.type === "self";
    }
  ) as MembershipRow | undefined;

  const existingSelfConversation = normalizeConversation(
    existingSelfMembership?.conversations ?? null
  );

  if (existingSelfConversation) {
    return mapSelfConversation(existingSelfConversation);
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      type: "self",
      created_by: user.id,
    })
    .select("id, type, created_at")
    .single();

  if (conversationError) {
    throw conversationError;
  }

  const { error: membershipError } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: conversation.id,
      user_id: user.id,
    });

  if (membershipError) {
    throw membershipError;
  }

  return mapSelfConversation(conversation as ConversationRow);
}
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

async function getDirectConversationName(
  conversationId: string,
  currentUserId: string
): Promise<{ name: string; initials: string }> {
  const supabase = createSupabaseBrowserClient();

  const { data: members, error: membersError } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId);

  if (membersError) {
    throw membersError;
  }

  const otherMember = members?.find((member) => member.user_id !== currentUserId);

  if (!otherMember) {
    return {
      name: "Friend",
      initials: "FR",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", otherMember.user_id)
    .single();

  if (profileError || !profile?.email) {
    return {
      name: "Friend",
      initials: "FR",
    };
  }

  return {
    name: profile.email,
    initials: profile.email.slice(0, 2).toUpperCase(),
  };
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

    const friend = await getDirectConversationName(conversation.id, user.id);

    directConversations.push({
      id: conversation.id,
      type: "direct",
      name: friend.name,
      initials: friend.initials,
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: conversation.created_at,
    });
  }

  return sortConversations([selfConversation, ...directConversations]);
}
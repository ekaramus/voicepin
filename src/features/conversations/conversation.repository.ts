import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { sortConversations } from "./sortConversations";
import type { Conversation } from "./conversation.types";
import { getOrCreateSelfConversation } from "./selfConversation.repository";

type ConversationRow = {
  id: string;
  type: "self" | "direct";
  created_at: string;
};

type MembershipRow = {
  conversation_id: string;
  conversations: ConversationRow | ConversationRow[] | null;
};

type MemberRow = {
  user_id: string;
};

type ProfileRow = {
  email: string | null;
};

function normalizeConversation(
  value: MembershipRow["conversations"]
): ConversationRow | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function getInitials(value: string) {
  return value.slice(0, 2).toUpperCase();
}

async function getDirectConversationLabel(
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

  const otherMember = ((members ?? []) as MemberRow[]).find(
    (member) => member.user_id !== currentUserId
  );

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

  if (profileError || !(profile as ProfileRow | null)?.email) {
    return {
      name: "Friend",
      initials: "FR",
    };
  }

  const email = (profile as ProfileRow).email ?? "Friend";

  return {
    name: email,
    initials: getInitials(email),
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

    const label = await getDirectConversationLabel(conversation.id, user.id);

    directConversations.push({
      id: conversation.id,
      type: "direct",
      name: label.name,
      initials: label.initials,
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: conversation.created_at,
    });
  }

  return sortConversations([selfConversation, ...directConversations]);
}
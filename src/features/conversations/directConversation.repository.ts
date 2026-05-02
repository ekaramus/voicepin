import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Conversation } from "./conversation.types";

type ProfileRow = {
  id: string;
  email: string | null;
};

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

export async function createOrGetDirectConversationByEmail(
  email: string
): Promise<Conversation> {
  const supabase = createSupabaseBrowserClient();
  const currentUser = await getRequiredUser();

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || normalizedEmail === currentUser.email?.toLowerCase()) {
    throw new Error("Choose another user's email");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", normalizedEmail)
    .single();

  if (profileError || !profile) {
    throw new Error("User not found");
  }

  const friend = profile as ProfileRow;

  const { data: memberships, error: membershipsError } = await supabase
    .from("conversation_members")
    .select("conversation_id, conversations(id, type, created_at)")
    .eq("user_id", currentUser.id);

  if (membershipsError) {
    throw membershipsError;
  }

  for (const membership of (memberships ?? []) as MembershipRow[]) {
    const conversation = normalizeConversation(membership.conversations);

    if (!conversation || conversation.type !== "direct") {
      continue;
    }

    const { data: members, error: membersError } = await supabase
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", conversation.id);

    if (membersError) {
      throw membersError;
    }

    const memberIds = (members ?? []).map((member) => member.user_id);

    if (
      memberIds.includes(currentUser.id) &&
      memberIds.includes(friend.id) &&
      memberIds.length === 2
    ) {
      return {
        id: conversation.id,
        type: "direct",
        name: friend.email ?? "Friend",
        initials: (friend.email ?? "FR").slice(0, 2).toUpperCase(),
        preview: "Short thoughts only",
        durationMs: 0,
        isPinned: false,
        updatedAt: conversation.created_at,
      };
    }
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      type: "direct",
      created_by: currentUser.id,
    })
    .select("id, type, created_at")
    .single();

  if (conversationError) {
    throw conversationError;
  }

  const { error: insertMembersError } = await supabase
    .from("conversation_members")
    .insert([
      {
        conversation_id: conversation.id,
        user_id: currentUser.id,
      },
      {
        conversation_id: conversation.id,
        user_id: friend.id,
      },
    ]);

  if (insertMembersError) {
    throw insertMembersError;
  }

  return {
    id: conversation.id,
    type: "direct",
    name: friend.email ?? "Friend",
    initials: (friend.email ?? "FR").slice(0, 2).toUpperCase(),
    preview: "Short thoughts only",
    durationMs: 0,
    isPinned: false,
    updatedAt: conversation.created_at,
  };
}
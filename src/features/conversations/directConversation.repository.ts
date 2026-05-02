import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Conversation } from "./conversation.types";

type ProfileRow = {
  id: string;
  email: string | null;
};

type ExistingConversationRow = {
  id: string;
  type: "self" | "direct";
  created_at: string;
};

function createDirectPairKey(userA: string, userB: string) {
  return [userA, userB].sort().join(":");
}

function mapDirectConversation(
  conversation: ExistingConversationRow,
  friend: ProfileRow
): Conversation {
  const email = friend.email ?? "Friend";

  return {
    id: conversation.id,
    type: "direct",
    name: email,
    initials: email.slice(0, 2).toUpperCase(),
    preview: "Short thoughts only",
    durationMs: 0,
    isPinned: false,
    updatedAt: conversation.created_at,
  };
}

export async function createOrGetDirectConversationByEmail(
  email: string
): Promise<Conversation> {
  const supabase = createSupabaseBrowserClient();
  const currentUser = await getRequiredUser();

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  if (normalizedEmail === currentUser.email?.toLowerCase()) {
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
  const directPairKey = createDirectPairKey(currentUser.id, friend.id);

  const { data: existingDirect, error: existingDirectError } = await supabase
    .from("conversations")
    .select("id, type, created_at")
    .eq("type", "direct")
    .eq("direct_pair_key", directPairKey)
    .maybeSingle();

  if (existingDirectError) {
    throw existingDirectError;
  }

  if (existingDirect) {
    return mapDirectConversation(existingDirect as ExistingConversationRow, friend);
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      type: "direct",
      created_by: currentUser.id,
      direct_pair_key: directPairKey,
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

  return mapDirectConversation(conversation as ExistingConversationRow, friend);
}
import { getRequiredUser } from "@/features/auth/getRequiredUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { sortConversations } from "./sortConversations";
import type { Conversation } from "./conversation.types";
import { getOrCreateSelfConversation } from "./selfConversation.repository";

type ConversationRow = {
  id: string;
  type: "self" | "direct";
  created_at: string;
  direct_pair_key: string | null;
};

type MembershipRow = {
  conversation_id: string;
  conversations: ConversationRow | ConversationRow[] | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
};

type MessagePreviewRow = {
  conversation_id: string;
  transcript: string | null;
  duration_ms: number;
  created_at: string;
};

type ConversationPreview = {
  preview: string;
  durationMs: number;
  updatedAt: string;
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

function getOtherUserIdFromPairKey(
  directPairKey: string | null,
  currentUserId: string
): string | null {
  if (!directPairKey) {
    return null;
  }

  const [userA, userB] = directPairKey.split(":");

  if (userA === currentUserId) {
    return userB ?? null;
  }

  if (userB === currentUserId) {
    return userA ?? null;
  }

  return null;
}

async function getProfilesById(
  userIds: string[]
): Promise<Map<string, ProfileRow>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  );
}

async function getLatestMessagePreviewsByConversationId(
  conversationIds: string[]
): Promise<Map<string, ConversationPreview>> {
  if (conversationIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("messages")
    .select("conversation_id, transcript, duration_ms, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const previews = new Map<string, ConversationPreview>();

  for (const message of (data ?? []) as MessagePreviewRow[]) {
    if (previews.has(message.conversation_id)) {
      continue;
    }

    previews.set(message.conversation_id, {
      preview: message.transcript ?? "Voice snapshot",
      durationMs: message.duration_ms,
      updatedAt: message.created_at,
    });
  }

  return previews;
}

function getFallbackPreview(updatedAt: string): ConversationPreview {
  return {
    preview: "No voice snapshots yet",
    durationMs: 0,
    updatedAt,
  };
}

export async function listConversations(): Promise<Conversation[]> {
  const supabase = createSupabaseBrowserClient();
  const user = await getRequiredUser();

  const selfConversation = await getOrCreateSelfConversation(user);

  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      "conversation_id, conversations(id, type, created_at, direct_pair_key)"
    )
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  const directConversationRows: ConversationRow[] = [];

  for (const membership of (data ?? []) as MembershipRow[]) {
    const conversation = normalizeConversation(membership.conversations);

    if (!conversation || conversation.type !== "direct") {
      continue;
    }

    directConversationRows.push(conversation);
  }

  const allConversationIds = [
    selfConversation.id,
    ...directConversationRows.map((conversation) => conversation.id),
  ];

  const otherUserIds = directConversationRows
    .map((conversation) =>
      getOtherUserIdFromPairKey(conversation.direct_pair_key, user.id)
    )
    .filter((value): value is string => Boolean(value));

  const [profilesById, previewsByConversationId] = await Promise.all([
    getProfilesById(otherUserIds),
    getLatestMessagePreviewsByConversationId(allConversationIds),
  ]);

  const selfPreview =
    previewsByConversationId.get(selfConversation.id) ??
    getFallbackPreview(selfConversation.updatedAt);

  const hydratedSelfConversation: Conversation = {
    ...selfConversation,
    preview: selfPreview.preview,
    durationMs: selfPreview.durationMs,
    updatedAt: selfPreview.updatedAt,
  };

  const directConversations: Conversation[] = directConversationRows.map(
    (conversation) => {
      const otherUserId = getOtherUserIdFromPairKey(
        conversation.direct_pair_key,
        user.id
      );

      const profile = otherUserId ? profilesById.get(otherUserId) : null;
      const name = profile?.email ?? "Friend";
      const preview =
        previewsByConversationId.get(conversation.id) ??
        getFallbackPreview(conversation.created_at);

      return {
        id: conversation.id,
        type: "direct",
        name,
        initials: getInitials(name),
        preview: preview.preview,
        durationMs: preview.durationMs,
        isPinned: false,
        updatedAt: preview.updatedAt,
      };
    }
  );

  return sortConversations([
    hydratedSelfConversation,
    ...directConversations,
  ]);
}
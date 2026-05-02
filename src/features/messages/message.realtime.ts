import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MessageChangePayload = {
  new: {
    conversation_id: string;
  };
};

type SubscribeToConversationMessagesInput = {
  conversationId: string;
  onMessageChange: () => void;
};

export function subscribeToConversationMessages({
  conversationId,
  onMessageChange,
}: SubscribeToConversationMessagesInput) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      () => {onMessageChange();}
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
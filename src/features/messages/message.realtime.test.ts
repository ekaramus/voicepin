const mockOn = vi.fn();
const mockSubscribe = vi.fn();
const mockRemoveChannel = vi.fn();

const mockChannel = {
  on: mockOn,
  subscribe: mockSubscribe,
};

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    channel: vi.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  }),
}));

import { subscribeToConversationMessages } from "./message.realtime";

describe("subscribeToConversationMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockOn.mockReturnValue(mockChannel);
    mockSubscribe.mockReturnValue(mockChannel);
  });

  it("subscribes to message changes for a conversation", () => {
    subscribeToConversationMessages({
      conversationId: "conversation-1",
      onMessageChange: vi.fn(),
    });

    expect(mockOn).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: "conversation_id=eq.conversation-1",
      },
      expect.any(Function)
    );

    expect(mockSubscribe).toHaveBeenCalledOnce();
  });

  it("calls handler when a message changes", () => {
    const onMessageChange = vi.fn();

    subscribeToConversationMessages({
      conversationId: "conversation-1",
      onMessageChange,
    });

    const handler = mockOn.mock.calls[0][2];

    handler({
      new: {
        conversation_id: "conversation-1",
      },
    });

    expect(onMessageChange).toHaveBeenCalledOnce();
  });

  it("removes channel on unsubscribe", () => {
    const unsubscribe = subscribeToConversationMessages({
      conversationId: "conversation-1",
      onMessageChange: vi.fn(),
    });

    unsubscribe();

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel);
  });
});
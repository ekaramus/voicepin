import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationDetail } from "./ConversationDetail";
import type { Conversation } from "./conversation.types";

const mockListMessagesByConversation = vi.fn();
const mockUploadAudio = vi.fn();
const mockInsertMessage = vi.fn();
const mockSubscribeToConversationMessages = vi.fn();

vi.mock("@/features/messages/message.realtime", () => ({
  subscribeToConversationMessages: (input: unknown) =>
    mockSubscribeToConversationMessages(input),
}));

vi.mock("@/features/messages/message.repository", () => ({
  listMessagesByConversation: (conversationId: string) =>
    mockListMessagesByConversation(conversationId),
}));

vi.mock("@/features/messages/uploadAudio", () => ({
  uploadAudio: (blob: Blob) => mockUploadAudio(blob),
}));

vi.mock("@/features/messages/message.mutations", () => ({
  insertMessage: (input: unknown) => mockInsertMessage(input),
}));

const conversation: Conversation = {
  id: "conversation-1",
  type: "self",
  name: "Me",
  initials: "ME",
  preview: "",
  durationMs: 0,
  isPinned: true,
  updatedAt: "2026-04-26T12:00:00.000Z",
};

describe("ConversationDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribeToConversationMessages.mockReturnValue(() => {});

    mockListMessagesByConversation.mockResolvedValue([
      {
        id: "message-1",
        conversationId: "conversation-1",
        sender: "me",
        audioUrl: "blob:test-audio",
        durationMs: 8_000,
        transcript: "Remember to record the demo before lunch.",
        status: "ready",
        createdAt: "2026-04-26T12:00:00.000Z",
      },
    ]);

    mockUploadAudio.mockResolvedValue({
      path: "audio.webm",
      publicUrl: "https://example.supabase.co/audio.webm",
    });

    mockInsertMessage.mockResolvedValue(undefined);
  });

  it("renders selected conversation", async () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    expect(screen.getByRole("heading", { name: "Me" })).toBeInTheDocument();

    expect(
      await screen.findByText("Remember to record the demo before lunch.")
    ).toBeInTheDocument();
  });

  it("loads messages for selected conversation", async () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    await waitFor(() => {
      expect(mockListMessagesByConversation).toHaveBeenCalledWith(
        "conversation-1"
      );
    });

    expect(
      await screen.findByText("Remember to record the demo before lunch.")
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no messages", async () => {
    mockListMessagesByConversation.mockResolvedValue([]);

    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    expect(
      await screen.findByText(/No voice snapshots yet/i)
    ).toBeInTheDocument();
  });

  it("shows error state when messages fail to load", async () => {
    mockListMessagesByConversation.mockRejectedValue(new Error("Failed"));

    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/could not load voice snapshots/i);
  });

  it("opens recorder overlay from detail screen", async () => {
    const user = userEvent.setup();

    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    await screen.findByText("Remember to record the demo before lunch.");

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(screen.getByText("Tiny thought")).toBeInTheDocument();
  });

  it("calls onBack", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(<ConversationDetail conversation={conversation} onBack={onBack} />);

    await screen.findByText("Remember to record the demo before lunch.");

    await user.click(
      screen.getByRole("button", { name: /back to conversations/i })
    );

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("subscribes to realtime message changes", async () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    await screen.findByText("Remember to record the demo before lunch.");

    expect(mockSubscribeToConversationMessages).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      onMessageChange: expect.any(Function),
    });
  });
  
  it("reloads messages when realtime change is received", async () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    await screen.findByText("Remember to record the demo before lunch.");

    const subscriptionInput = mockSubscribeToConversationMessages.mock.calls[0][0];

    await subscriptionInput.onMessageChange();

    expect(mockListMessagesByConversation).toHaveBeenCalledTimes(2);
  });
});
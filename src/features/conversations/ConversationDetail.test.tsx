import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationDetail } from "./ConversationDetail";
import type { Conversation } from "./conversation.types";

vi.mock("@/features/messages/message.repository", () => ({
  listMessagesByConversation: vi.fn(async (conversationId: string) => {
    if (conversationId === "me") {
      return [
        {
          id: "message-1",
          conversationId: "me",
          sender: "me",
          audioUrl: "blob:test-audio",
          durationMs: 8_000,
          transcript: "Remember to record the demo before lunch.",
          status: "ready",
          createdAt: "2026-04-26T12:00:00.000Z",
        },
      ];
    }

    return [];
  }),
}));

const conversation: Conversation = {
  id: "me",
  type: "self",
  name: "Me",
  initials: "ME",
  preview: "",
  durationMs: 0,
  isPinned: true,
  updatedAt: "2026-04-26T12:00:00.000Z",
};

describe("ConversationDetail", () => {
  it("renders selected conversation", async () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    expect(screen.getByRole("heading", { name: "Me" })).toBeInTheDocument();

    await screen.findByText("Remember to record the demo before lunch.");
  });

  it("loads messages for selected conversation", async () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    expect(
      await screen.findByText("Remember to record the demo before lunch.")
    ).toBeInTheDocument();
  });

  it("opens recorder overlay from detail screen", async () => {
    const user = userEvent.setup();

    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(screen.getByText("Tiny thought")).toBeInTheDocument();
  });

  it("calls onBack", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(<ConversationDetail conversation={conversation} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /back to conversations/i }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
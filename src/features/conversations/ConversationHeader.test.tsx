import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationHeader } from "./ConversationHeader";
import type { Conversation } from "./conversation.types";

const selfConversation: Conversation = {
  id: "me",
  type: "self",
  name: "Me",
  initials: "ME",
  preview: "",
  durationMs: 0,
  isPinned: true,
  updatedAt: "2026-04-26T12:00:00.000Z",
};

describe("ConversationHeader", () => {
  it("renders conversation name", () => {
    render(<ConversationHeader conversation={selfConversation} onBack={() => {}} />);

    expect(screen.getByRole("heading", { name: "Me" })).toBeInTheDocument();
  });

  it("uses private tape subtitle for self conversation", () => {
    render(<ConversationHeader conversation={selfConversation} onBack={() => {}} />);

    expect(screen.getByText(/private tape/i)).toBeInTheDocument();
  });

  it("uses 1:1 subtitle for direct conversation", () => {
    render(
      <ConversationHeader
        conversation={{ ...selfConversation, type: "direct", name: "Anna" }}
        onBack={() => {}}
      />
    );

    expect(screen.getByText(/1:1 voice pings/i)).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(<ConversationHeader conversation={selfConversation} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /back to conversations/i }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
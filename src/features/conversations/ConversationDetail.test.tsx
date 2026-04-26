import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationDetail } from "./ConversationDetail";
import type { Conversation } from "./conversation.types";

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
  it("renders selected conversation", () => {
    render(<ConversationDetail conversation={conversation} onBack={() => {}} />);

    expect(screen.getByRole("heading", { name: "Me" })).toBeInTheDocument();
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
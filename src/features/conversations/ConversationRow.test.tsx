import { render, screen } from "@testing-library/react";
import { ConversationRow } from "./ConversationRow";
import type { Conversation } from "./conversation.types";
import userEvent from "@testing-library/user-event";

const conversation: Conversation = {
  id: "me",
  type: "self",
  name: "Me",
  initials: "ME",
  preview: "Remember this.",
  durationMs: 8_000,
  isPinned: true,
  updatedAt: "2026-04-26T12:00:00.000Z",
};

describe("ConversationRow", () => {
  it("renders conversation name", () => {
    render(<ConversationRow conversation={conversation} />);

    expect(screen.getByText("Me")).toBeInTheDocument();
  });

  it("renders preview text", () => {
    render(<ConversationRow conversation={conversation} />);

    expect(screen.getByText("Remember this.")).toBeInTheDocument();
  });

  it("renders formatted duration", () => {
    render(<ConversationRow conversation={conversation} />);

    expect(screen.getByText("0:08")).toBeInTheDocument();
  });

  it("renders initials", () => {
    render(<ConversationRow conversation={conversation} />);

    expect(screen.getByText("ME")).toBeInTheDocument();
  });

  it("calls onClick with conversation when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<ConversationRow conversation={conversation} onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledWith(conversation);
  });
});
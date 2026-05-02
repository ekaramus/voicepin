import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddFriendForm } from "./AddFriendForm";

const mockCreateOrGetDirectConversationByEmail = vi.fn();

vi.mock("./directConversation.repository", () => ({
  createOrGetDirectConversationByEmail: (email: string) =>
    mockCreateOrGetDirectConversationByEmail(email),
}));

describe("AddFriendForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email input and add button", () => {
    render(<AddFriendForm onConversationReady={() => {}} />);

    expect(screen.getByLabelText(/add friend by email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("creates direct conversation by email", async () => {
    const user = userEvent.setup();
    const onConversationReady = vi.fn();

    const conversation = {
      id: "conversation-1",
      type: "direct",
      name: "friend@example.com",
      initials: "FR",
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: "2026-04-26T12:00:00.000Z",
    };

    mockCreateOrGetDirectConversationByEmail.mockResolvedValue(conversation);

    render(<AddFriendForm onConversationReady={onConversationReady} />);

    await user.type(
      screen.getByLabelText(/add friend by email/i),
      "friend@example.com"
    );

    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(mockCreateOrGetDirectConversationByEmail).toHaveBeenCalledWith(
      "friend@example.com"
    );

    expect(onConversationReady).toHaveBeenCalledWith(conversation);
  });

  it("clears email after conversation is ready", async () => {
    const user = userEvent.setup();

    mockCreateOrGetDirectConversationByEmail.mockResolvedValue({
      id: "conversation-1",
      type: "direct",
      name: "friend@example.com",
      initials: "FR",
      preview: "Short thoughts only",
      durationMs: 0,
      isPinned: false,
      updatedAt: "2026-04-26T12:00:00.000Z",
    });

    render(<AddFriendForm onConversationReady={() => {}} />);

    const input = screen.getByLabelText(/add friend by email/i);

    await user.type(input, "friend@example.com");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(input).toHaveValue("");
  });

  it("shows error when conversation creation fails", async () => {
    const user = userEvent.setup();

    mockCreateOrGetDirectConversationByEmail.mockRejectedValue(
      new Error("User not found")
    );

    render(<AddFriendForm onConversationReady={() => {}} />);

    await user.type(
      screen.getByLabelText(/add friend by email/i),
      "missing@example.com"
    );

    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "User not found"
    );
  });
});
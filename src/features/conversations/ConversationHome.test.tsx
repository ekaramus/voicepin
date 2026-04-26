import { render, screen } from "@testing-library/react";
import { ConversationHome } from "./ConversationHome";
import userEvent from "@testing-library/user-event";

describe("ConversationHome", () => {
  it("renders product name", () => {
    render(<ConversationHome />);

    expect(screen.getByRole("heading", { name: "VoicePin" })).toBeInTheDocument();
  });

  it("renders Me conversation first", () => {
    render(<ConversationHome />);

    const conversations = screen.getAllByRole("button");
    expect(conversations[0]).toHaveTextContent("Me");
  });

  it("shows voice-only constraint", () => {
    render(<ConversationHome />);

    expect(screen.getByText(/No typing/i)).toBeInTheDocument();
    expect(screen.getByText(/Max 20 seconds/i)).toBeInTheDocument();
  });

  it("renders record button", () => {
    render(<ConversationHome />);

    expect(screen.getByRole("button", { name: "Record" })).toBeInTheDocument();
  });

  it("opens recorder overlay when record button is clicked", async () => {
    const user = userEvent.setup();

    render(<ConversationHome />);

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(screen.getByText("Tiny thought")).toBeInTheDocument();
  });

  it("does not show local tape before any message is sent", () => {
    render(<ConversationHome />);

    expect(screen.queryByText(/Local tape/i)).not.toBeInTheDocument();
  });
});
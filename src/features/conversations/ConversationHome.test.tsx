import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationHome } from "./ConversationHome";

describe("ConversationHome", () => {
  it("renders product name", () => {
    render(<ConversationHome />);

    expect(screen.getByRole("heading", { name: "VoicePin" })).toBeInTheDocument();
  });

  it("renders Me conversation", async () => {
    render(<ConversationHome />);

    expect(await screen.findByText("Me")).toBeInTheDocument();
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
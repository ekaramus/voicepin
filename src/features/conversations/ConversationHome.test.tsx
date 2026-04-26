import { render, screen } from "@testing-library/react";
import { ConversationHome } from "./ConversationHome";

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

    expect(screen.getByRole("button", { name: "REC" })).toBeInTheDocument();
  });
});
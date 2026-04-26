import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationHome } from "./ConversationHome";

describe("ConversationHome", () => {
  it("renders product name", () => {
    render(<ConversationHome />);
    expect(
      screen.getByRole("heading", { name: "VoicePin" })
    ).toBeInTheDocument();
  });

  it("renders Me conversation", async () => {
    render(<ConversationHome />);
    expect(await screen.findByText("Me")).toBeInTheDocument();
  });

  it("navigates to conversation detail", async () => {
    const user = userEvent.setup();

    render(<ConversationHome />);

    await user.click(await screen.findByText("Me"));

    expect(
      screen.getByRole("heading", { name: "Me" })
    ).toBeInTheDocument();
  });

  it("opens recorder overlay from home", async () => {
    const user = userEvent.setup();

    render(<ConversationHome />);

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(screen.getByText("Tiny thought")).toBeInTheDocument();
  });
});
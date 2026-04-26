import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationHome } from "./ConversationHome";

const mockClearDraft = vi.hoisted(() => vi.fn());

vi.mock("@/features/drafts/useDraftSnapshot", () => ({
  useDraftSnapshot: () => ({
    draft: {
      id: "draft-1",
      blob: new Blob(["audio"], { type: "audio/webm" }),
      audioUrl: "blob:test-audio",
      durationMs: 8_000,
      createdAt: "2026-04-26T12:00:00.000Z",
    },
    hasDraft: true,
    createDraft: vi.fn(),
    clearDraft: mockClearDraft,
  }),
}));

describe("ConversationHome", () => {
  beforeEach(() => {
    mockClearDraft.mockClear();
  });
  
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

  it("clears draft after selecting a send destination", async () => {
    const user = userEvent.setup();

    render(<ConversationHome />);

    await user.click(screen.getByRole("button", { name: /send to/i }));

    await user.click(
      await screen.findByRole("button", { name: /send to me/i })
    );

    expect(mockClearDraft).toHaveBeenCalledOnce();
  });
});
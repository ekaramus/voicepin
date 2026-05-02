import { render, screen, waitFor } from "@testing-library/react";import userEvent from "@testing-library/user-event";
import { ConversationHome } from "./ConversationHome";

vi.mock("./conversation.repository", () => ({
  listConversations: vi.fn(async () => [
    {
      id: "11111111-1111-1111-1111-111111111111",
      type: "self",
      name: "Me",
      initials: "ME",
      preview: "Private voice memories",
      durationMs: 0,
      isPinned: true,
      updatedAt: "2026-04-26T12:00:00.000Z",
    },
  ]),
}));

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

vi.mock("@/features/messages/uploadAudio", () => ({
  uploadAudio: vi.fn(async () => ({
    path: "audio.webm",
    publicUrl: "https://example.supabase.co/audio.webm",
  })),
}));

vi.mock("@/features/messages/message.mutations", () => ({
  insertMessage: vi.fn(async () => undefined),
}));

vi.mock("@/features/messages/message.repository", () => ({
  listMessagesByConversation: vi.fn(async () => []),
}));

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

vi.mock("@/features/messages/message.realtime", () => ({
  subscribeToConversationMessages: vi.fn(() => () => {}),
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

    await user.click(await screen.findByRole("button", { name: /Me/i }));

    expect(
      await screen.findByRole("heading", { name: "Me" })
    ).toBeInTheDocument();

    expect(await screen.findByText(/private tape/i)).toBeInTheDocument();
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

    await waitFor(() => {
      expect(mockClearDraft).toHaveBeenCalledOnce();
    });
  });
});
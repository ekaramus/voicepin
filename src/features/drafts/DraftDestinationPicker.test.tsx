import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftDestinationPicker } from "./DraftDestinationPicker";
import type { Conversation } from "@/features/conversations/conversation.types";
import type { DraftVoiceSnapshot } from "./draft.types";

const draft: DraftVoiceSnapshot = {
  id: "draft-1",
  audioUrl: "blob:test-audio",
  durationMs: 8_000,
  createdAt: "2026-04-26T12:00:00.000Z",
};

const conversations: Conversation[] = [
  {
    id: "me",
    type: "self",
    name: "Me",
    initials: "ME",
    preview: "",
    durationMs: 0,
    isPinned: true,
    updatedAt: "2026-04-26T12:00:00.000Z",
  },
  {
    id: "anna",
    type: "direct",
    name: "Anna",
    initials: "AN",
    preview: "",
    durationMs: 0,
    isPinned: false,
    updatedAt: "2026-04-26T12:00:00.000Z",
  },
];

describe("DraftDestinationPicker", () => {
  it("renders title", () => {
    render(
      <DraftDestinationPicker
        draft={draft}
        conversations={conversations}
        onSelect={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole("heading", { name: /send to/i })).toBeInTheDocument();
  });

  it("renders conversations", () => {
    render(
      <DraftDestinationPicker
        draft={draft}
        conversations={conversations}
        onSelect={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Me")).toBeInTheDocument();
    expect(screen.getByText("Anna")).toBeInTheDocument();
  });

  it("selects a destination", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DraftDestinationPicker
        draft={draft}
        conversations={conversations}
        onSelect={onSelect}
        onCancel={() => {}}
      />
    );

    await user.click(screen.getByRole("button", { name: /Anna/i }));

    expect(onSelect).toHaveBeenCalledWith(conversations[1]);
  });

  it("calls onCancel", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <DraftDestinationPicker
        draft={draft}
        conversations={conversations}
        onSelect={() => {}}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows sending state", () => {
    render(
      <DraftDestinationPicker
        draft={draft}
        conversations={conversations}
        onSelect={() => {}}
        onCancel={() => {}}
        sendStatus="sending"
      />
    );

    expect(screen.getAllByText(/sending/i)[0]).toBeInTheDocument();
  });

  it("shows send error", () => {
    render(
      <DraftDestinationPicker
        draft={draft}
        conversations={conversations}
        onSelect={() => {}}
        onCancel={() => {}}
        sendStatus="error"
        sendError="Upload failed"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Upload failed");
  });
});
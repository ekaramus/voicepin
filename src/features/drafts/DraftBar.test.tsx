import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftBar } from "./DraftBar";
import type { DraftVoiceSnapshot } from "./draft.types";

const draft: DraftVoiceSnapshot = {
  id: "draft-1",
  audioUrl: "blob:test-audio",
  durationMs: 8_000,
  createdAt: "2026-04-26T12:00:00.000Z",
};

describe("DraftBar", () => {
  it("renders draft audio preview", () => {
    render(<DraftBar draft={draft} onSend={() => {}} onDelete={() => {}} />);

    expect(screen.getByLabelText(/draft audio preview/i)).toBeInTheDocument();
  });

  it("renders duration", () => {
    render(<DraftBar draft={draft} onSend={() => {}} onDelete={() => {}} />);

    expect(screen.getByText("0:08")).toBeInTheDocument();
  });

  it("calls onSend", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<DraftBar draft={draft} onSend={onSend} onDelete={() => {}} />);

    await user.click(screen.getByRole("button", { name: /send to/i }));

    expect(onSend).toHaveBeenCalledOnce();
  });

  it("calls onDelete", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<DraftBar draft={draft} onSend={() => {}} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
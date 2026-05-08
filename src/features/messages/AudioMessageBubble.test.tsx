import { render, screen } from "@testing-library/react";
import { AudioMessageBubble } from "./AudioMessageBubble";
import type { VoiceMessage } from "./message.types";

const baseMessage: VoiceMessage = {
  id: "message-1",
  conversationId: "conversation-1",
  sender: "me",
  audioUrl: "blob:test-audio",
  durationMs: 8_000,
  transcript: null,
  status: "transcribing",
  createdAt: "2026-04-26T12:00:00.000Z",
};

describe("AudioMessageBubble", () => {
  it("renders audio player", () => {
    render(<AudioMessageBubble message={baseMessage} />);

    expect(screen.getByText("0:08")).toBeInTheDocument();
  });

  it("shows transcribing state when transcript is pending", () => {
    render(<AudioMessageBubble message={baseMessage} />);

    expect(screen.getByText(/transcribing/i)).toBeInTheDocument();
  });

  it("renders transcript when ready", () => {
    render(
      <AudioMessageBubble
        message={{
          ...baseMessage,
          transcript: "Remember to record the demo.",
          status: "ready",
        }}
      />
    );

    expect(screen.getByText("Remember to record the demo.")).toBeInTheDocument();
  });

  it("shows failed state when transcription failed", () => {
    render(
      <AudioMessageBubble
        message={{
          ...baseMessage,
          status: "transcription_failed",
        }}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /transcription failed/i
    );
  });

  it("does not render transcript text while still transcribing", () => {
    render(
      <AudioMessageBubble
        message={{
          ...baseMessage,
          transcript: "Hidden pending transcript",
          status: "transcribing",
        }}
      />
    );

    expect(screen.queryByText("Hidden pending transcript")).not.toBeInTheDocument();
  });
});
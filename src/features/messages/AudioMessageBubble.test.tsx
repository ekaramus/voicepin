import { render, screen } from "@testing-library/react";
import { AudioMessageBubble } from "./AudioMessageBubble";
import type { VoiceMessage } from "./message.types";

const message: VoiceMessage = {
  id: "message-1",
  conversationId: "me",
  sender: "me",
  audioUrl: "blob:test-audio",
  durationMs: 8_000,
  transcript: null,
  status: "local",
  createdAt: "2026-04-26T12:00:00.000Z",
};

describe("AudioMessageBubble", () => {
  it("renders audio controls", () => {
    render(<AudioMessageBubble message={message} />);

    expect(document.querySelector("audio")).toBeInTheDocument();
  });

  it("renders formatted duration", () => {
    render(<AudioMessageBubble message={message} />);

    expect(screen.getByText("0:08")).toBeInTheDocument();
  });

  it("shows pending transcript when transcript is missing", () => {
    render(<AudioMessageBubble message={message} />);

    expect(screen.getByText(/Transcript pending/i)).toBeInTheDocument();
  });

  it("renders transcript when available", () => {
    render(
      <AudioMessageBubble
        message={{
          ...message,
          transcript: "Remember to record the demo.",
          status: "ready",
        }}
      />
    );

    expect(screen.getByText("Remember to record the demo.")).toBeInTheDocument();
  });
});
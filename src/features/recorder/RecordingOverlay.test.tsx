import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordingOverlay } from "./RecordingOverlay";

const defaultProps = {
  mode: "draft" as const,
  status: "idle" as const,
  error: null,
  durationMs: 0,
  onStart: vi.fn(),
  onStop: vi.fn(),
  onReset: vi.fn(),
  onClose: vi.fn(),
  onSend: vi.fn(),
};

describe("RecordingOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the 20 second max constraint", () => {
    render(<RecordingOverlay {...defaultProps} />);

    expect(screen.getByText(/0:20 max/i)).toBeInTheDocument();
  });

  it("starts recording when idle record button is pressed", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();

    render(<RecordingOverlay {...defaultProps} onStart={onStart} />);

    await user.click(screen.getByRole("button", { name: /start recording/i }));

    expect(onStart).toHaveBeenCalledOnce();
  });

  it("stops recording when recording button is pressed", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();

    render(
      <RecordingOverlay
        {...defaultProps}
        status="recording"
        durationMs={5_000}
        onStop={onStop}
      />
    );

    await user.click(screen.getByRole("button", { name: /stop recording/i }));

    expect(onStop).toHaveBeenCalledOnce();
  });

  it("disables send until audio is recorded", () => {
    render(<RecordingOverlay {...defaultProps} />);

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("enables send when audio is recorded", () => {
    render(
      <RecordingOverlay
        {...defaultProps}
        status="recorded"
        durationMs={1_500}
        audioUrl="blob:test"
      />
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  it("shows too-short error", () => {
    render(<RecordingOverlay {...defaultProps} status="error" error="too-short" />);

    expect(screen.getByRole("alert")).toHaveTextContent(/too short/i);
  });
  it("calls onSend when recorded audio is sent", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <RecordingOverlay
        {...defaultProps}
        status="recorded"
        durationMs={1_500}
        audioUrl="blob:test"
        onSend={onSend}
      />
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSend).toHaveBeenCalledOnce();
  });

  it("shows Save button in draft mode", () => {
    render(
      <RecordingOverlay
        {...defaultProps}
        mode="draft"
        status="recorded"
        durationMs={1500}
        audioUrl="blob:test"
      />
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows Send button in direct mode", () => {
    render(
      <RecordingOverlay
        {...defaultProps}
        mode="direct"
        status="recorded"
        durationMs={1500}
        audioUrl="blob:test"
      />
    );

    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });
});
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordingOverlay } from "./RecordingOverlay";

const defaultProps = {
  mode: "draft" as const,
  status: "idle" as const,
  error: null,
  durationMs: 0,
  audioUrl: undefined,
  onStart: vi.fn(),
  onStop: vi.fn(),
  onReset: vi.fn(),
  onClose: vi.fn(),
  onSend: vi.fn(),
};

function renderRecordingOverlay(
  props: Partial<React.ComponentProps<typeof RecordingOverlay>> = {}
) {
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  render(<RecordingOverlay {...mergedProps} />);

  return mergedProps;
}

describe("RecordingOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders as an accessible dialog", () => {
    renderRecordingOverlay();

    expect(
      screen.getByRole("dialog", { name: /tiny thought/i })
    ).toBeInTheDocument();
  });

  it("shows start recording button when idle", () => {
    renderRecordingOverlay();

    expect(
      screen.getByRole("button", { name: /start recording/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/tap record to start/i)).toBeInTheDocument();
  });

  it("calls onStart when primary button is clicked while idle", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();

    renderRecordingOverlay({ onStart });

    await user.click(
      screen.getByRole("button", { name: /start recording/i })
    );

    expect(onStart).toHaveBeenCalledOnce();
  });

  it("shows stop recording button while recording", () => {
    renderRecordingOverlay({
      status: "recording",
      durationMs: 3_000,
    });

    expect(
      screen.getByRole("button", { name: /stop recording/i })
    ).toHaveAttribute("aria-pressed", "true");

    expect(screen.getByText(/recording now/i)).toBeInTheDocument();
  });

  it("calls onStop when primary button is clicked while recording", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();

    renderRecordingOverlay({
      status: "recording",
      durationMs: 3_000,
      onStop,
    });

    await user.click(
      screen.getByRole("button", { name: /stop recording/i })
    );

    expect(onStop).toHaveBeenCalledOnce();
  });

  it("shows remaining recording time", () => {
    renderRecordingOverlay({
      status: "recording",
      durationMs: 8_000,
    });

    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText(/of 20s/i)).toBeInTheDocument();
    expect(screen.getByText(/12s left/i)).toBeInTheDocument();

    expect(
      screen.getByRole("timer", { name: /12 seconds left out of 20/i })
    ).toBeInTheDocument();
  });

  it("warns when recording is close to the limit", () => {
    renderRecordingOverlay({
      status: "recording",
      durationMs: 16_000,
    });

    expect(screen.getByText(/almost there/i)).toBeInTheDocument();
    expect(screen.getByText(/4 seconds left/i)).toBeInTheDocument();
  });

  it("shows error message", () => {
    renderRecordingOverlay({
      status: "error",
      error: "Microphone access denied",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Microphone access denied"
    );
  });

  it("shows preview actions when audio is available", () => {
    renderRecordingOverlay({
      status: "stopped",
      durationMs: 5_000,
      audioUrl: "blob:test-audio",
    });

    expect(
      screen.getByRole("button", { name: /save draft/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /discard current recording and record again/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/recording ready/i)).toBeInTheDocument();
  });

  it("uses Send label in conversation mode", () => {
    renderRecordingOverlay({
      mode: "conversation",
      status: "stopped",
      durationMs: 5_000,
      audioUrl: "blob:test-audio",
    });

    expect(
      screen.getByRole("button", { name: /^send$/i })
    ).toBeInTheDocument();
  });

  it("calls onSend when save draft is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    renderRecordingOverlay({
      status: "stopped",
      durationMs: 5_000,
      audioUrl: "blob:test-audio",
      onSend,
    });

    await user.click(screen.getByRole("button", { name: /save draft/i }));

    expect(onSend).toHaveBeenCalledOnce();
  });

  it("calls onReset when discard and record again is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    renderRecordingOverlay({
      status: "stopped",
      durationMs: 5_000,
      audioUrl: "blob:test-audio",
      onReset,
    });

    await user.click(
      screen.getByRole("button", {
        name: /discard current recording and record again/i,
      })
    );

    expect(onReset).toHaveBeenCalledOnce();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderRecordingOverlay({ onClose });

    await user.click(
      screen.getByRole("button", {
        name: /close recorder and discard current recording/i,
      })
    );

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows microphone permission state", () => {
    renderRecordingOverlay({
      status: "requesting-permission",
    });

    expect(screen.getByText(/waiting for microphone permission/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /start recording/i })
    ).toBeDisabled();

    expect(screen.getByText(/opening microphone/i)).toBeInTheDocument();
  });
});
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordButton } from "./RecordButton";

describe("RecordButton", () => {
  it("renders as a button", () => {
    render(<RecordButton onClick={() => {}} />);

    expect(screen.getByRole("button", { name: "Record" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<RecordButton onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("exposes pressed state while recording", () => {
    render(<RecordButton isRecording onClick={() => {}} />);

    expect(screen.getByRole("button", { name: "Record" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
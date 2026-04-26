import { render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders children inside the shell", () => {
    render(
      <AppShell>
        <p>VoicePin content</p>
      </AppShell>
    );

    expect(screen.getByText("VoicePin content")).toBeInTheDocument();
  });

  it("shows the product constraint", () => {
    render(
      <AppShell>
        <p>Content</p>
      </AppShell>
    );

    expect(screen.getByText(/20 sec max/i)).toBeInTheDocument();
  });
});
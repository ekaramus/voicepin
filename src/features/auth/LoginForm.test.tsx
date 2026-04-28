import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

const mockSignInWithMagicLink = vi.fn();

vi.mock("./auth.repository", () => ({
  signInWithMagicLink: (email: string) => mockSignInWithMagicLink(email),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email input", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("sends magic link for valid email", async () => {
    const user = userEvent.setup();
    mockSignInWithMagicLink.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(mockSignInWithMagicLink).toHaveBeenCalledWith("test@example.com");
    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "invalid");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockSignInWithMagicLink).not.toHaveBeenCalled();
  });

  it("shows error when magic link fails", async () => {
    const user = userEvent.setup();
    mockSignInWithMagicLink.mockRejectedValue(new Error("failed"));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

const mockSignInWithGoogle = vi.fn();

vi.mock("./auth.repository", () => ({
  signInWithGoogle: () => mockSignInWithGoogle(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Google sign in button", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it("starts Google sign in", async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i })
    );

    expect(mockSignInWithGoogle).toHaveBeenCalledOnce();
  });

  it("shows error when Google sign in fails", async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockRejectedValue(new Error("Google failed"));

    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Google failed");
  });
});
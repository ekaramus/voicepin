import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGate } from "./AuthGate";

const mockGetCurrentSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock("./auth.repository", () => ({
  getCurrentSession: () => mockGetCurrentSession(),
  signOut: () => mockSignOut(),
}));

describe("AuthGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state first", () => {
    mockGetCurrentSession.mockResolvedValue(null);

    render(
      <AuthGate>
        <p>App content</p>
      </AuthGate>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows login when user is signed out", async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    render(
      <AuthGate>
        <p>App content</p>
      </AuthGate>
    );

    expect(await screen.findByText(/private beta/i)).toBeInTheDocument();
    expect(screen.queryByText("App content")).not.toBeInTheDocument();
  });

  it("shows app content when user is signed in", async () => {
    mockGetCurrentSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@example.com",
      },
    });

    render(
      <AuthGate>
        <p>App content</p>
      </AuthGate>
    );

    expect(await screen.findByText("App content")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("signs out user", async () => {
    const user = userEvent.setup();

    mockGetCurrentSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@example.com",
      },
    });
    mockSignOut.mockResolvedValue(undefined);

    render(
      <AuthGate>
        <p>App content</p>
      </AuthGate>
    );

    await screen.findByText("App content");

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledOnce();
    });

    expect(await screen.findByText(/private beta/i)).toBeInTheDocument();
  });
});
const mockGetSession = vi.fn();
const mockSignInWithOtp = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
    },
  }),
}));

import {
  getCurrentSession,
  signInWithMagicLink,
  signOut,
} from "./auth.repository";

describe("auth repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(getCurrentSession()).resolves.toBeNull();
  });

  it("maps active session", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-1",
            email: "test@example.com",
          },
        },
      },
      error: null,
    });

    await expect(getCurrentSession()).resolves.toEqual({
      user: {
        id: "user-1",
        email: "test@example.com",
      },
    });
  });

  it("sends magic link", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    await signInWithMagicLink("test@example.com");

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
  });

  it("signs out", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await signOut();

    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("throws when sign in fails", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: new Error("Sign in failed"),
    });

    await expect(signInWithMagicLink("test@example.com")).rejects.toThrow(
      "Sign in failed"
    );
  });
});
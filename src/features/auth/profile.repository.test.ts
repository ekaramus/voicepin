const mockUpsert = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn(() => ({
      upsert: mockUpsert,
    })),
  }),
}));

import { upsertProfile } from "./profile.repository";

describe("upsertProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts current user profile", async () => {
    mockUpsert.mockResolvedValue({ error: null });

    await upsertProfile({
      id: "user-1",
      email: "test@example.com",
    });

    expect(mockUpsert).toHaveBeenCalledWith({
      id: "user-1",
      email: "test@example.com",
    });
  });

  it("throws when upsert fails", async () => {
    mockUpsert.mockResolvedValue({
      error: new Error("Profile failed"),
    });

    await expect(
      upsertProfile({
        id: "user-1",
        email: "test@example.com",
      })
    ).rejects.toThrow("Profile failed");
  });
});
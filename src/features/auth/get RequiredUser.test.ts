const mockGetCurrentSession = vi.fn();

vi.mock("./auth.repository", () => ({
  getCurrentSession: () => mockGetCurrentSession(),
}));

import { getRequiredUser } from "./getRequiredUser";

describe("getRequiredUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns current user", async () => {
    mockGetCurrentSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@example.com",
      },
    });

    await expect(getRequiredUser()).resolves.toEqual({
      id: "user-1",
      email: "test@example.com",
    });
  });

  it("throws when unauthenticated", async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    await expect(getRequiredUser()).rejects.toThrow(
      "User is not authenticated"
    );
  });
});
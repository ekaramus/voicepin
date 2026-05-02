const mockGetRequiredUser = vi.fn();
const mockGetOrCreateSelfConversation = vi.fn();

vi.mock("@/features/auth/getRequiredUser", () => ({
  getRequiredUser: () => mockGetRequiredUser(),
}));

vi.mock("./selfConversation.repository", () => ({
  getOrCreateSelfConversation: (user: unknown) =>
    mockGetOrCreateSelfConversation(user),
}));

import { listConversations } from "./conversation.repository";

describe("listConversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns self conversation for current user", async () => {
    mockGetRequiredUser.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    });

    mockGetOrCreateSelfConversation.mockResolvedValue({
      id: "conversation-1",
      type: "self",
      name: "Me",
      initials: "ME",
      preview: "Private voice memories",
      durationMs: 0,
      isPinned: true,
      updatedAt: "2026-04-26T12:00:00.000Z",
    });

    const conversations = await listConversations();

    expect(conversations[0].name).toBe("Me");
    expect(mockGetOrCreateSelfConversation).toHaveBeenCalledWith({
      id: "user-1",
      email: "test@example.com",
    });
  });
});
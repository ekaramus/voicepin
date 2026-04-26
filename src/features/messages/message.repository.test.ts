import { listMessagesByConversation } from "./message.repository";

describe("listMessagesByConversation", () => {
  it("returns only messages for the requested conversation", async () => {
    const messages = await listMessagesByConversation("me");

    expect(messages).toHaveLength(1);
    expect(messages[0].conversationId).toBe("me");
  });

  it("returns an empty array when no messages match", async () => {
    await expect(listMessagesByConversation("missing")).resolves.toEqual([]);
  });
});
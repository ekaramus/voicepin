import { listConversations } from "./conversation.repository";

describe("listConversations", () => {
  it("returns conversations with Me first", async () => {
    const conversations = await listConversations();

    expect(conversations[0].type).toBe("self");
    expect(conversations[0].name).toBe("Me");
  });
});
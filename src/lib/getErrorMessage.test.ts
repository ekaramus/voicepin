import { getErrorMessage } from "./getErrorMessage";

describe("getErrorMessage", () => {
  it("returns message from Error", () => {
    expect(getErrorMessage(new Error("Upload failed"))).toBe("Upload failed");
  });

  it("returns message from object-like errors", () => {
    expect(getErrorMessage({ message: "Supabase failed" })).toBe(
      "Supabase failed"
    );
  });

  it("returns fallback for unknown errors", () => {
    expect(getErrorMessage("bad")).toBe("Something went wrong.");
  });

  it("supports custom fallback", () => {
    expect(getErrorMessage(null, "Could not send voice snapshot.")).toBe(
      "Could not send voice snapshot."
    );
  });
});
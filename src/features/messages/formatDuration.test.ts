import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it("formats seconds", () => {
    expect(formatDuration(8_000)).toBe("0:08");
  });

  it("formats double digit seconds", () => {
    expect(formatDuration(12_000)).toBe("0:12");
  });

  it("floors partial seconds", () => {
    expect(formatDuration(1_900)).toBe("0:01");
  });
});
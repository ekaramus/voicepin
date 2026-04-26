import {
  MAX_RECORDING_MS,
  MIN_RECORDING_MS,
  RECORDING_MIME_TYPE,
} from "./recorder.constants";

describe("recorder constants", () => {
  it("limits recordings to 20 seconds", () => {
    expect(MAX_RECORDING_MS).toBe(20_000);
  });

  it("requires at least one second of audio", () => {
    expect(MIN_RECORDING_MS).toBe(1_000);
  });

  it("uses webm audio format", () => {
    expect(RECORDING_MIME_TYPE).toBe("audio/webm");
  });
});
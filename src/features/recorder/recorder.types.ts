export type RecorderStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "recorded"
  | "error";

export type RecordedAudio = {
  blob: Blob;
  durationMs: number;
  url: string;
};

export type RecorderError =
  | "permission-denied"
  | "not-supported"
  | "too-short"
  | "unknown";
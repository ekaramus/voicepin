export type RecorderStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "stopped"
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
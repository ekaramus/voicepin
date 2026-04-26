export type ConversationType = "self" | "direct";

export type Conversation = {
  id: string;
  type: ConversationType;
  name: string;
  initials: string;
  preview: string;
  durationMs: number;
  isPinned: boolean;
  updatedAt: string;
};
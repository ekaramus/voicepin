"use client";

import { FormEvent, useState } from "react";
import { createOrGetDirectConversationByEmail } from "./directConversation.repository";
import type { Conversation } from "./conversation.types";

type AddFriendFormProps = {
  onConversationReady: (conversation: Conversation) => void;
};

export function AddFriendForm({ onConversationReady }: AddFriendFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "creating" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setStatus("creating");
      setErrorMessage(null);

      const conversation = await createOrGetDirectConversationByEmail(email);

      setEmail("");
      setStatus("idle");
      onConversationReady(conversation);
    } catch (error) {
      setStatus("error");

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not create conversation.");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-b-2 border-[#27251f] bg-[#eadfc9] p-4"
    >
      <label
        htmlFor="friend-email"
        className="block text-xs font-black uppercase tracking-[0.16em] text-[#6f6758]"
      >
        Add friend by email
      </label>

      <div className="mt-3 flex gap-2">
        <input
          id="friend-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="friend@example.com"
          aria-describedby={status === "error" ? "friend-email-error" : undefined}
          aria-invalid={status === "error"}
          className="min-w-0 flex-1 rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] px-3 py-3 text-sm outline-none"
        />

        <button
          type="submit"
          disabled={status === "creating"}
          className="rounded-2xl border-2 border-[#27251f] bg-[#d94f2b] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#f4ead7] shadow-[3px_3px_0_#27251f] disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {status === "error" && (
        <p
          id="friend-email-error"
          role="alert"
          className="mt-2 text-sm text-[#d94f2b]"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
}
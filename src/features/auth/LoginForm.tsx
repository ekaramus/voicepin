"use client";

import { FormEvent, useState } from "react";
import { signInWithMagicLink } from "./auth.repository";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@")) {
      setStatus("error");
      return;
    }

    try {
      setStatus("sending");
      await signInWithMagicLink(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-between p-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d94f2b]">
          Private beta
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-0.1em]">
          VoicePin
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#6f6758]">
          Tiny voice snapshots. No typing. Max 20 seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <label
          htmlFor="email"
          className="block text-xs font-black uppercase tracking-[0.16em] text-[#6f6758]"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] px-4 py-4 text-sm outline-none shadow-[4px_4px_0_#27251f]"
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-2xl border-2 border-[#27251f] bg-[#d94f2b] px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#f4ead7] shadow-[4px_4px_0_#27251f] disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>

        {status === "sent" && (
          <p className="text-sm leading-6 text-[#6f6758]">
            Check your email for a login link.
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="text-sm leading-6 text-[#d94f2b]">
            Could not send login link. Check your email and try again.
          </p>
        )}
      </form>
    </div>
  );
}
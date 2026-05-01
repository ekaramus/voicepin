"use client";

import { useState } from "react";
import { signInWithGoogle } from "./auth.repository";

export function LoginForm() {
  const [status, setStatus] = useState<"idle" | "signing-in" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    try {
      setStatus("signing-in");
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (error) {
      setStatus("error");

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not start Google sign in.");
      }
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

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={status === "signing-in"}
          className="w-full rounded-2xl border-2 border-[#27251f] bg-[#f4ead7] px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#27251f] shadow-[4px_4px_0_#27251f] disabled:opacity-50"
        >
          {status === "signing-in" ? "Opening Google..." : "Continue with Google"}
        </button>

        {status === "error" && (
          <p role="alert" className="text-sm leading-6 text-[#d94f2b]">
            {errorMessage ?? "Could not start Google sign in."}
          </p>
        )}
      </div>
    </div>
  );
}
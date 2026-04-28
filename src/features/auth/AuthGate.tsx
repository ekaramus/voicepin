"use client";

import { ReactNode, useEffect, useState } from "react";
import { getCurrentSession, signOut } from "./auth.repository";
import type { AuthSession } from "./auth.types";
import { LoginForm } from "./LoginForm";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const currentSession = await getCurrentSession();

        if (isMounted) {
          setSession(currentSession);
          setStatus("ready");
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setStatus("ready");
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    setSession(null);
  }

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center p-5 text-sm text-[#6f6758]">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b-2 border-[#27251f] bg-[#eadfc9] px-4 py-2 text-xs">
        <span className="truncate text-[#6f6758]">
          {session.user.email ?? "Signed in"}
        </span>

        <button
          type="button"
          onClick={handleSignOut}
          className="font-black uppercase tracking-[0.12em] text-[#d94f2b]"
        >
          Sign out
        </button>
      </div>

      {children}
    </div>
  );
}
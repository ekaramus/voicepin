import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthSession } from "./auth.types";

export async function getCurrentSession(): Promise<AuthSession | null> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!data.session) {
    return null;
  }

  return {
    user: {
      id: data.session.user.id,
      email: data.session.user.email ?? null,
    },
  };
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo:
        typeof window === "undefined" ? undefined : window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        typeof window === "undefined" ? undefined : window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}

export function subscribeToAuthChanges(
  callback: (session: AuthSession | null) => void
) {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(
      session
        ? {
            user: {
              id: session.user.id,
              email: session.user.email ?? null,
            },
          }
        : null
    );
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
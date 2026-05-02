import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthUser } from "./auth.types";

export async function upsertProfile(user: AuthUser): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
  });

  if (error) {
    throw error;
  }
}
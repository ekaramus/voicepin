import { AppShell } from "@/components/layout/AppShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { ConversationHome } from "@/features/conversations/ConversationHome";

export default function Home() {
  return (
    <AppShell>
      <AuthGate>
        <ConversationHome />
      </AuthGate>
    </AppShell>
  );
}
import { AppShell } from "@/components/layout/AppShell";
import { ConversationHome } from "@/features/conversations/ConversationHome";

export default function Home() {
  return (
    <AppShell>
      <ConversationHome />
    </AppShell>
  );
}
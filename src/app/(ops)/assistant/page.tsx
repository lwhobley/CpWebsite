import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { AppShell } from "@/components/layout/app-shell";
import { requireManager } from "@/lib/auth/guards";

export default async function AssistantPage() {
  const user = await requireManager();

  return (
    <AppShell user={user} title="Assistant">
      <AssistantPanel />
    </AppShell>
  );
}

import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-lg text-center">
        <p className="font-serif text-4xl tracking-[0.16em] text-[var(--gold)]">ENISH</p>
        <h1 className="section-title mt-4 text-3xl">Offline Mode</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Checklist templates and inventory snapshots stay cached for staff. Once the connection
          returns, queued completions will sync automatically.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full border border-[var(--gold)] px-5 py-3 text-xs uppercase tracking-[0.24em] text-[var(--green)]"
        >
          Return to dashboard
        </Link>
      </Card>
    </main>
  );
}

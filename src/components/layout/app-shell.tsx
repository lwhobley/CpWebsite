import Link from "next/link";
import { ReactNode } from "react";
import { Bell, BookCheck, ChartNoAxesCombined, ClipboardList, IdCard, Package, Settings2, Sparkles, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MODULES, ROLE_LABELS } from "@/lib/constants";
import { AppUser } from "@/lib/types";
import { initials } from "@/lib/utils";

const icons: Record<string, ReactNode> = {
  Dashboard: <ChartNoAxesCombined className="h-4 w-4" />,
  Checklists: <ClipboardList className="h-4 w-4" />,
  Permits: <BookCheck className="h-4 w-4" />,
  Inventory: <Package className="h-4 w-4" />,
  Audits: <Store className="h-4 w-4" />,
  Certifications: <IdCard className="h-4 w-4" />,
  Assistant: <Sparkles className="h-4 w-4" />,
  Admin: <Settings2 className="h-4 w-4" />,
  POS: <Bell className="h-4 w-4" />,
};

export function AppShell({
  user,
  title,
  children,
}: {
  user: AppUser;
  title: string;
  children: ReactNode;
}) {
  const links = MODULES.filter((module) => !module.roles || module.roles.includes(user.role));

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-7xl gap-4">
        <aside className="hidden w-72 shrink-0 md:block">
          <Card className="sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col justify-between p-6">
            <div>
              <p className="font-serif text-4xl tracking-[0.18em] text-[var(--gold)]">ENISH</p>
              <p className="mt-2 text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                Houston Ops Hub
              </p>
              <div className="gold-rule my-6" />
              <nav className="space-y-2">
                {links.map((module) => (
                  <Link
                    key={module.href}
                    href={module.href}
                    className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-white"
                  >
                    {icons[module.label]}
                    <span>{module.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--green)] text-sm font-semibold text-white">
                  {initials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">{user.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <div className="flex-1 pb-24 md:pb-6">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Enish Restaurant & Lounge Houston
            </p>
            <h1 className="section-title mt-2 text-4xl text-[var(--foreground)]">{title}</h1>
          </header>
          {children}
        </div>
      </div>

      <nav className="fixed bottom-4 left-4 right-4 z-30 md:hidden">
        <Card className="grid grid-cols-5 gap-2 p-2">
          {links.slice(0, 5).map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="flex flex-col items-center rounded-2xl px-2 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]"
            >
              {icons[module.label]}
              <span className="mt-1">{module.label}</span>
            </Link>
          ))}
        </Card>
      </nav>
    </div>
  );
}

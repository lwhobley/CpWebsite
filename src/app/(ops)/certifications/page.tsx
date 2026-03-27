import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireManager } from "@/lib/auth/guards";
import { mockCertifications } from "@/lib/data/mock";

export default async function CertificationsPage() {
  const user = await requireManager();

  return (
    <AppShell user={user} title="Certifications">
      <div className="grid gap-4 md:grid-cols-2">
        {mockCertifications.map((cert) => (
          <Card key={cert.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{cert.type}</p>
                <h2 className="section-title mt-2 text-2xl">{cert.name}</h2>
              </div>
              <Badge tone={cert.compliant ? "success" : "danger"}>
                {cert.compliant ? "compliant" : "renew"}
              </Badge>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">Expires {cert.expiresAt}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Expiry alerts surface at 90, 60, and 30 days with uploads routed to cert-images.
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

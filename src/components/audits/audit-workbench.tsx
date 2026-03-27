"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DEFAULT_ROWS = [
  "Entry visible and ADA route clear",
  "Handwash sink stocked",
  "Bar ice well guard clean",
  "Date labels present on prep items",
];

export function AuditWorkbench() {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const updateResponse = (item: string, value: string) => {
    setResponses((current) => ({ ...current, [item]: value }));
  };

  const exportPdf = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#F9F6F1",
      scale: 2,
    });
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, width, height);
    pdf.save("enish-audit-export.pdf");
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Audit Template</p>
            <h2 className="section-title mt-2 text-3xl">Front-of-house readiness</h2>
          </div>
          <Button onClick={exportPdf}>Export PDF</Button>
        </div>
      </Card>

      <Card>
        <div ref={exportRef} className="space-y-4">
          {DEFAULT_ROWS.map((item) => (
            <div key={item} className="rounded-[24px] border border-[var(--border)] bg-white p-4">
              <p className="font-medium">{item}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["pass", "flag", "fail"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateResponse(item, option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${
                      responses[item] === option
                        ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--green)]"
                        : "border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Gemini Vision hook will score uploaded evidence and suggest corrective action.
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

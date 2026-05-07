import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [
    { title: "TA Announcements — CORTA Acquisition" },
    { name: "description", content: "Updates to the recruiting team — new policies, hiring freezes, employer brand wins." },
  ]}),
  component: Announcements,
});

const items = [
  { id: "TA-A1", title: "FY26 hiring plan approved — 38 net new hires", body: "Engineering 14 · Sales 10 · Product 6 · Ops 5 · G&A 3.", date: "2026-05-02", category: "Plan" },
  { id: "TA-A2", title: "New structured interview kit live for L4–L5 roles", body: "Pre-defined competencies and rubrics now mandatory in scorecards.", date: "2026-04-25", category: "Process" },
  { id: "TA-A3", title: "GDPR retention auto-anonymizer scheduled monthly", body: "Candidates without talent-pool consent are anonymized 12 months after last activity.", date: "2026-04-18", category: "Compliance" },
  { id: "TA-A4", title: "Glassdoor employer rating up to 4.6", body: "Best-quarter result. Candidate-experience workstream paying off.", date: "2026-04-10", category: "Brand" },
];

const tone: any = { Plan: "primary", Process: "info", Compliance: "warning", Brand: "success" };

function Announcements() {
  return (
    <AppShell>
      <PageHeader title="TA Announcements" description="Bulletin board for the recruiting org." />
      <div className="space-y-3">
        {items.map(a => (
          <div key={a.id} className="page-section p-5 flex gap-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "var(--gradient-primary)" }}><Megaphone className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold">{a.title}</div>
                <Pill tone={tone[a.category]}>{a.category}</Pill>
              </div>
              <div className="text-sm text-muted-foreground">{a.body}</div>
              <div className="text-xs text-muted-foreground mt-2 tabular-nums">{a.date}</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

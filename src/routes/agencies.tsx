import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { agencies } from "@/lib/ta-data";
import { Building2, Star, Plus } from "lucide-react";

export const Route = createFileRoute("/agencies")({
  head: () => ({ meta: [
    { title: "Agencies — HireFlow" },
    { name: "description", content: "Approved recruitment agencies, fees and submission performance." },
  ]}),
  component: AgenciesPage,
});

function AgenciesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Recruitment Agencies"
        description="Approved agency partners with dedicated submission portal, ownership rules and fee tracking."
        actions={<button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> Add agency</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agencies.map(a => (
          <div key={a.id} className="page-section p-5 hover-lift">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "var(--gradient-accent)" }}><Building2 className="h-5 w-5" /></div>
              <div className="flex gap-0.5">{Array.from({length: 5}).map((_,i) => <Star key={i} className={`h-3.5 w-3.5 ${i < a.rating ? "fill-warning text-warning" : "text-border"}`} />)}</div>
            </div>
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{a.contact}</div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="rounded-md bg-muted/40 p-2"><div className="text-lg font-bold tabular-nums">{a.feePct}%</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fee</div></div>
              <div className="rounded-md bg-muted/40 p-2"><div className="text-lg font-bold tabular-nums">{a.activeSubmissions}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</div></div>
              <div className="rounded-md bg-muted/40 p-2"><div className="text-lg font-bold tabular-nums">{a.hires}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hires</div></div>
            </div>
            <div className="mt-3"><Pill tone="primary">Approved partner</Pill></div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

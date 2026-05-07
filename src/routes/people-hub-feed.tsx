import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { useTAStore } from "@/hooks/use-ta-store";
import { getPeopleHubOutcomes, type OutcomeKind } from "@/lib/people-hub-feed";
import { ArrowUpRight, GitMerge, Users2 } from "lucide-react";

export const Route = createFileRoute("/people-hub-feed")({
  head: () => ({ meta: [
    { title: "People Hub Feed — HireFlow" },
    { name: "description", content: "Hiring outcomes (stage changes, hiring decisions, CoreHR conversions) exposed to People Hub with deep links back to candidates and requisitions." },
  ]}),
  component: PeopleHubFeed,
});

const tone: Record<OutcomeKind, any> = {
  STAGE_CHANGE: "info",
  HIRING_DECISION: "primary",
  CONVERSION: "success",
  ADVERSE_ACTION: "destructive",
};

function PeopleHubFeed() {
  useTAStore();
  const items = getPeopleHubOutcomes();

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">People Hub Feed <Pill tone="success"><GitMerge className="h-3 w-3" /> Live to People Hub</Pill></span>}
        description="What HireFlow publishes to People Hub. Each outcome carries deep links back to the candidate and requisition for one-click drill-down."
      />

      <div className="page-section p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Stage changes" value={items.filter(i => i.kind === "STAGE_CHANGE").length} />
        <Stat label="Hiring decisions" value={items.filter(i => i.kind === "HIRING_DECISION").length} />
        <Stat label="CoreHR conversions" value={items.filter(i => i.kind === "CONVERSION").length} />
        <Stat label="Adverse actions" value={items.filter(i => i.kind === "ADVERSE_ACTION").length} />
      </div>

      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left p-3">When</th><th className="text-left p-3">Kind</th><th className="text-left p-3">Candidate</th><th className="text-left p-3">Requisition</th><th className="text-left p-3">Summary</th><th className="text-left p-3">CoreHR</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(o => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="p-3 text-xs tabular-nums text-muted-foreground">{o.at}</td>
                <td className="p-3"><Pill tone={tone[o.kind]}>{o.kind.replace("_"," ")}</Pill></td>
                <td className="p-3 text-xs">
                  {o.candidateId
                    ? <Link to="/candidates/$id" params={{ id: o.candidateId }} className="font-medium hover:text-primary inline-flex items-center gap-1">{o.candidateName} <ArrowUpRight className="h-3 w-3" /></Link>
                    : <span>{o.candidateName}</span>}
                </td>
                <td className="p-3 text-xs">
                  {o.reqId
                    ? <Link to="/requisitions/$id" params={{ id: o.reqId }} className="hover:text-primary"><div className="font-medium">{o.reqTitle}</div><div className="font-mono text-muted-foreground">{o.reqId}</div></Link>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="p-3 text-xs">{o.summary}</td>
                <td className="p-3 text-xs">{o.employeeId ? <span className="font-mono font-semibold">{o.employeeId}</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3 text-xs"><Link to="/conversion" className="text-primary hover:underline">Handoff →</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">No outcomes to publish yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="page-section p-4 mt-5 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2 text-foreground font-semibold"><Users2 className="h-4 w-4" /> Integration contract</div>
        <div>
          Each outcome is published to People Hub via the <span className="font-mono">talent.outcome.v1</span> event bus with stable
          <span className="font-mono"> candidateUrl</span> / <span className="font-mono">requisitionUrl</span> deep links and (when applicable) a CoreHR
          <span className="font-mono"> employeeId</span> for joining to the People Hub employee record.
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-foreground font-semibold">Live endpoint:</span>
          <a href="/api/public/talent.outcome.v1" target="_blank" rel="noreferrer" className="font-mono text-primary hover:underline">GET /api/public/talent.outcome.v1</a>
          <span>· filter <span className="font-mono">?kind=CONVERSION&amp;limit=50</span></span>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border border-border p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div><div className="text-2xl font-bold tabular-nums">{value}</div></div>;
}

import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { GitMerge, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { conversionEvents, buildConversionPayload, candidates, offers, candidateById, reqById } from "@/lib/ta-data";

export const Route = createFileRoute("/conversion")({
  head: () => ({ meta: [
    { title: "CoreHR Handoff — HireFlow" },
    { name: "description", content: "candidate.hired event flow into CoreHR. Onboarding triggers automatically: IT account, equipment, buddy assignment." },
  ]}),
  component: ConversionPage,
});

function ConversionPage() {
  // Show a candidate ready to convert (offer accepted but not yet converted) — use the existing accepted offer
  const accepted = offers.filter(o => o.status === "ACCEPTED");
  const previewCandidate = accepted.length ? candidateById(accepted[0].candidateId) : candidates[0];
  const previewPayload = previewCandidate ? buildConversionPayload(previewCandidate.id) : null;

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">CoreHR Handoff <Pill tone="success"><GitMerge className="h-3 w-3" /> API connected</Pill></span>}
        description="When a candidate accepts an offer, HireFlow emits a candidate.hired event to CoreHR. CoreHR creates the employee profile and triggers onboarding."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="page-section p-5">
          <div className="font-semibold mb-3">Integration flow</div>
          <ol className="space-y-3">
            <Step n={1} title="Candidate accepts offer" desc="Digital signature captured on the offer letter." />
            <Step n={2} title="HireFlow emits candidate.hired" desc="POST /api/v1/coreHR/employees with the structured payload below." />
            <Step n={3} title="CoreHR creates employee" desc="Employee record provisioned with EMP- ID, status set to ONBOARDING." />
            <Step n={4} title="Welcome sequence triggers" desc="IT account creation, equipment provisioning request, buddy assignment, security training." />
            <Step n={5} title="Audit + reporting" desc="Both systems append immutable audit events; recruiting analytics roll up automatically." />
          </ol>
        </div>

        <div className="page-section p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Preview payload</div>
            <Pill tone="primary">candidate.hired</Pill>
          </div>
          <pre className="text-[11px] font-mono bg-muted/40 border border-border rounded-md p-3 overflow-x-auto leading-relaxed">{JSON.stringify(previewPayload, null, 2)}</pre>
        </div>
      </div>

      <div className="page-section mt-6">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">Recent conversions</div>
          <Link to="/audit" className="text-xs font-medium text-primary hover:underline">Audit log →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Event</th>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Requisition</th>
              <th className="text-left p-3">CoreHR Employee</th>
              <th className="text-left p-3">Accepted</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {conversionEvents.map(e => {
              const r = reqById(e.reqId);
              return (
                <tr key={e.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{e.id}</td>
                  <td className="p-3"><Link to="/candidates/$id" params={{ id: e.candidateId }} className="font-medium hover:text-primary">{e.candidateName}</Link></td>
                  <td className="p-3 text-xs">{r?.title} <span className="text-muted-foreground font-mono">· {e.reqId}</span></td>
                  <td className="p-3 font-mono text-xs flex items-center gap-1">{e.newEmployeeId} <ArrowRight className="h-3 w-3 text-muted-foreground" /> CoreHR</td>
                  <td className="p-3 text-xs text-muted-foreground tabular-nums">{e.acceptedAt}</td>
                  <td className="p-3 text-right"><Pill tone="success"><CheckCircle2 className="h-3 w-3" /> {e.status.replace("_"," ")}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="page-section p-5 mt-6 border-l-4" style={{ borderLeftColor: "hsl(174 72% 42%)" }}>
        <div className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-accent" /> WorkGrid integration (inbound)</div>
        <p className="text-sm text-muted-foreground">WorkGrid pushes <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">project.staffing.forecast</code> events into HireFlow so the TA Lead can prioritize requisitions against upcoming project demand.</p>
      </div>
    </AppShell>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <div className="h-7 w-7 shrink-0 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>{n}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}

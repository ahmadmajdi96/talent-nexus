import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { GitMerge, ArrowRight, CheckCircle2, Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  conversionEvents, buildConversionPayload, candidates, offers, candidateById, reqById,
  conversionDeliveries, validateConversionPayload, retryConversion,
} from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { toast } from "sonner";

export const Route = createFileRoute("/conversion")({
  head: () => ({ meta: [
    { title: "CoreHR Handoff — HireFlow" },
    { name: "description", content: "candidate.hired event flow into CoreHR with payload validation, retries and webhook delivery log." },
  ]}),
  component: ConversionPage,
});

function ConversionPage() {
  useTAStore();
  const accepted = offers.filter(o => o.status === "ACCEPTED");
  const previewCandidate = accepted.length ? candidateById(accepted[0].candidateId) : candidates[0];
  const previewPayload = previewCandidate ? buildConversionPayload(previewCandidate.id) : null;
  const validation = previewPayload ? validateConversionPayload(previewPayload) : { ok: false, errors: ["no payload"] };

  const retry = (id: string) => {
    retryConversion(id);
    toast.success(`Retry attempted for ${id}`);
  };

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">CoreHR Handoff <Pill tone="success"><GitMerge className="h-3 w-3" /> API connected</Pill></span>}
        description="HireFlow emits candidate.hired to CoreHR. Payloads are JSON-schema validated, signed (HMAC-SHA256), and retried with exponential backoff up to 5 attempts."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="page-section p-5">
          <div className="font-semibold mb-3">Integration flow</div>
          <ol className="space-y-3">
            <Step n={1} title="Candidate accepts offer" desc="Digital signature captured on the offer letter." />
            <Step n={2} title="Validate payload" desc="JSON-schema validation: required candidate, position, offer, recruiter fields. ISO-4217 currency, ISO date startDate." />
            <Step n={3} title="Sign + emit" desc="HMAC-SHA256 of body keyed with COREHR_WEBHOOK_SECRET. POST /api/v1/coreHR/employees." />
            <Step n={4} title="Retry on failure" desc="Exponential backoff (10s, 30s, 2m, 10m, 1h) up to 5 attempts. Failed deliveries surface to the recruiter." />
            <Step n={5} title="Webhook reply" desc="CoreHR returns employee_id once provisioned; HireFlow records EMPLOYEE_CREATED and notifies onboarding." />
          </ol>
        </div>

        <div className="page-section p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Preview payload</div>
            <div className="flex items-center gap-2">
              <Pill tone="primary">candidate.hired</Pill>
              {validation.ok
                ? <Pill tone="success"><ShieldCheck className="h-3 w-3" /> Schema valid</Pill>
                : <Pill tone="destructive"><AlertTriangle className="h-3 w-3" /> {validation.errors.length} error(s)</Pill>}
            </div>
          </div>
          {!validation.ok && <ul className="text-xs text-destructive mb-2 list-disc pl-4">{validation.errors.map(e => <li key={e}>{e}</li>)}</ul>}
          <pre className="text-[11px] font-mono bg-muted/40 border border-border rounded-md p-3 overflow-x-auto leading-relaxed max-h-[420px]">{JSON.stringify(previewPayload, null, 2)}</pre>
        </div>
      </div>

      <div className="page-section mb-6">
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
              <th className="text-left p-3">Attempts</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {conversionEvents.map(e => {
              const r = reqById(e.reqId);
              const deliveries = conversionDeliveries[e.id] ?? [];
              const lastFailed = e.status === "FAILED";
              return (
                <tr key={e.id} className="border-t border-border align-top">
                  <td className="p-3 font-mono text-xs">{e.id}</td>
                  <td className="p-3"><Link to="/candidates/$id" params={{ id: e.candidateId }} className="font-medium hover:text-primary">{e.candidateName}</Link></td>
                  <td className="p-3 text-xs">{r?.title} <span className="text-muted-foreground font-mono">· {e.reqId}</span></td>
                  <td className="p-3 font-mono text-xs">{e.newEmployeeId ? <span className="inline-flex items-center gap-1">{e.newEmployeeId} <ArrowRight className="h-3 w-3 text-muted-foreground" /> CoreHR</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="p-3 text-xs">
                    <div className="space-y-1">
                      {deliveries.map(d => (
                        <div key={d.attempt} className="font-mono text-[10px] flex items-center gap-1.5">
                          <span className="text-muted-foreground">#{d.attempt}</span>
                          <span className={d.httpStatus < 300 ? "text-success" : "text-destructive"}>{d.httpStatus}</span>
                          <span className="text-muted-foreground">{d.durationMs}ms</span>
                          {d.signatureValid && <ShieldCheck className="h-3 w-3 text-success" />}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3"><Pill tone={e.status === "EMPLOYEE_CREATED" ? "success" : e.status === "FAILED" ? "destructive" : "warning"}>
                    {e.status === "EMPLOYEE_CREATED" && <CheckCircle2 className="h-3 w-3" />}{e.status.replace("_"," ")}
                  </Pill></td>
                  <td className="p-3 text-right">
                    <button onClick={() => retry(e.id)} disabled={!lastFailed} className="text-xs font-medium px-2.5 h-7 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40 inline-flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="page-section p-5 border-l-4" style={{ borderLeftColor: "hsl(174 72% 42%)" }}>
        <div className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-accent" /> WorkGrid integration (inbound)</div>
        <p className="text-sm text-muted-foreground">WorkGrid pushes <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">project.staffing.forecast</code> events into HireFlow so the TA Lead can prioritize requisitions against upcoming project demand. <Link to="/forecasts" className="text-primary hover:underline">Open forecasts →</Link></p>
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

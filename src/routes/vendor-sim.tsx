import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { backgroundChecks, simulateVendorWebhook, vendorWebhookLog, candidateById, type SimulatedVendorEvent, type BgCheckStatus } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { Webhook, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor-sim")({
  head: () => ({ meta: [
    { title: "Vendor Webhook Simulator — CORTA Acquisition" },
    { name: "description", content: "Replay Checkr/Sterling responses against background checks to verify status transitions and recruiter notifications." },
  ]}),
  component: SimPage,
});

const PRESETS: { label: string; build: () => SimulatedVendorEvent; tone: any }[] = [
  { label: "Status: IN_PROGRESS", tone: "info", build: () => ({ kind: "STATUS_UPDATE", status: "IN_PROGRESS", note: "Verification in progress" }) },
  { label: "Report: CLEAR", tone: "success", build: () => ({ kind: "REPORT_CLEAR" }) },
  { label: "Report: Criminal flag", tone: "destructive", build: () => ({ kind: "REPORT_FLAGS", flags: ["Felony conviction (2018)"] }) },
  { label: "Report: Education mismatch", tone: "destructive", build: () => ({ kind: "REPORT_FLAGS", flags: ["Education verification failed"] }) },
  { label: "Vendor 503 error", tone: "warning", build: () => ({ kind: "VENDOR_ERROR", httpStatus: 503, message: "Service temporarily unavailable" }) },
  { label: "Vendor 401 auth error", tone: "destructive", build: () => ({ kind: "VENDOR_ERROR", httpStatus: 401, message: "API key revoked" }) },
];

function SimPage() {
  useTAStore();
  const [bgcId, setBgcId] = useState(backgroundChecks[0]?.id ?? "");
  const [custom, setCustom] = useState<BgCheckStatus>("IN_PROGRESS");

  const fire = (ev: SimulatedVendorEvent) => {
    const r = simulateVendorWebhook(bgcId, ev);
    if (!r) return toast.error("No background check selected");
    toast.success(`Vendor webhook delivered — status ${r.status}`);
  };

  const selected = backgroundChecks.find(b => b.id === bgcId);
  const cand = selected ? candidateById(selected.candidateId) : undefined;

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">Vendor Webhook Simulator <Pill tone="accent"><Webhook className="h-3 w-3" /> sandbox</Pill></span>}
        description="Replay Checkr / Sterling / HireRight payloads against any background check. Validates status transitions, vendor responses, recruiter notifications, and audit logging end-to-end."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="page-section p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target background check</label>
            <select value={bgcId} onChange={e => setBgcId(e.target.value)} className="mt-1 h-9 w-full px-3 rounded-md border border-border bg-card text-sm">
              {backgroundChecks.map(b => {
                const c = candidateById(b.candidateId);
                return <option key={b.id} value={b.id}>{b.id} · {b.vendor} · {c ? `${c.firstName} ${c.lastName}` : b.candidateData.fullLegalName} · current {b.status}</option>;
              })}
            </select>
            {selected && (
              <div className="mt-3 text-xs flex items-center gap-3">
                <Pill tone="info">{selected.vendor}</Pill>
                <Pill tone="muted">{selected.package}</Pill>
                <span className="text-muted-foreground">vendor req {selected.vendorRequestId ?? "—"}</span>
                {cand && <Link to="/candidates/$id" params={{ id: cand.id }} className="text-primary hover:underline ml-auto">Open candidate →</Link>}
              </div>
            )}
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Preset payloads</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => fire(p.build())}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-card hover:bg-muted px-3 h-10 text-sm font-medium">
                  <span>{p.label}</span>
                  <span className="flex items-center gap-2"><Pill tone={p.tone}>fire</Pill><Send className="h-3 w-3 text-muted-foreground" /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Custom STATUS_UPDATE</div>
            <div className="flex items-center gap-2">
              <select value={custom} onChange={e => setCustom(e.target.value as BgCheckStatus)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
                {(["NOT_STARTED","CONSENT_PENDING","REQUESTED","IN_PROGRESS","ADVERSE_ACTION","CLEAR","CANCELLED"] as BgCheckStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => fire({ kind: "STATUS_UPDATE", status: custom })}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
                <Send className="h-3 w-3" /> Send
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="page-section p-5">
            <div className="font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Webhook log</div>
            {vendorWebhookLog.length === 0 && <div className="text-xs text-muted-foreground">Nothing fired yet.</div>}
            <ol className="space-y-2 max-h-[600px] overflow-y-auto">
              {vendorWebhookLog.map((l, i) => (
                <li key={i} className="rounded-md border border-border p-2 text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-muted-foreground">{l.at}</span>
                    <Pill tone={l.event.kind === "VENDOR_ERROR" ? "destructive" : l.resultingStatus === "CLEAR" ? "success" : l.resultingStatus === "ADVERSE_ACTION" ? "warning" : "info"}>{l.resultingStatus}</Pill>
                  </div>
                  <div className="font-medium">{l.vendor} → {l.bgcId}</div>
                  <div className="text-muted-foreground">{l.event.kind}{"status" in l.event ? ` · ${l.event.status}` : ""}{"flags" in l.event ? ` · ${l.event.flags.join(", ")}` : ""}{"httpStatus" in l.event ? ` · HTTP ${l.event.httpStatus}` : ""}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">notification {l.notificationSent ? "sent" : "skipped"}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

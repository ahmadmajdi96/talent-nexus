import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import {
  backgroundChecks, candidateById, advanceBackgroundCheck,
  startAdverseAction, disputeAdverseAction, decideAdverseAction,
  ADVERSE_ACTION_REASONS, type BgCheckStatus,
} from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { CAN, useCurrentUser } from "@/lib/role";
import { ShieldCheck, Mail, FileText, Bell, AlertTriangle, Gavel, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/background-checks")({
  head: () => ({ meta: [
    { title: "Background Checks — HireFlow" },
    { name: "description", content: "FCRA-compliant background check workflow with vendor request/response tracking and recruiter notifications." },
  ]}),
  component: BgPage,
});

const tone: Record<BgCheckStatus, any> = {
  NOT_STARTED: "muted", CONSENT_PENDING: "warning", REQUESTED: "info",
  IN_PROGRESS: "info", ADVERSE_ACTION: "destructive", CLEAR: "success", CANCELLED: "muted",
};

function BgPage() {
  useTAStore();
  const me = useCurrentUser();
  const canManage = CAN.manageBackgroundCheck(me.role);
  const canDecide = CAN.decideAdverseAction(me.role);

  const advance = (id: string, to: BgCheckStatus) => {
    if (!canManage) return toast.error(`Role ${me.role.replace("_"," ")} cannot advance background checks`);
    advanceBackgroundCheck(id, to);
    toast.success(`Status → ${to}`);
  };

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">Background Checks <Pill tone="success"><ShieldCheck className="h-3 w-3" /> FCRA / GDPR compliant</Pill>{!canManage && <Pill tone="muted"><Lock className="h-3 w-3" /> Read-only ({me.role.replace("_"," ")})</Pill>}</span>}
        description="Vendor-integrated background screening with consent capture, status tracking, and automated recruiter notifications."
      />


      <div className="space-y-4">
        {backgroundChecks.map(b => {
          const c = candidateById(b.candidateId);
          const required = ["fullLegalName","dateOfBirth","addressHistory"];
          const missing = required.filter(k => !(b.candidateData as any)[k]);
          return (
            <div key={b.id} className="page-section p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">{b.id} · vendor: {b.vendor} {b.vendorRequestId && <span className="text-foreground">/ req {b.vendorRequestId}</span>}</div>
                  <div className="font-semibold text-lg mt-0.5">{c ? <Link to="/candidates/$id" params={{ id: c.id }} className="hover:text-primary">{c.firstName} {c.lastName}</Link> : b.candidateData.fullLegalName}</div>
                  <div className="text-xs text-muted-foreground">{b.package} package · {b.reqId}</div>
                </div>
                <Pill tone={tone[b.status]}>{b.status.replace("_"," ")}</Pill>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="rounded-md border border-border p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Required candidate data</div>
                  <Field label="Full legal name" value={b.candidateData.fullLegalName} />
                  <Field label="Date of birth" value={b.candidateData.dateOfBirth} />
                  <Field label="Address history" value={b.candidateData.addressHistory} />
                  {missing.length > 0 && <div className="text-[11px] text-destructive mt-1">Missing: {missing.join(", ")}</div>}
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Scope</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(b.scope).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${v ? "bg-success" : "bg-border"}`} />{k}</div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">FCRA consent</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Signed</span><Pill tone={b.consent.signed ? "success" : "destructive"}>{b.consent.signed ? "Yes" : "No"}</Pill></div>
                    {b.consent.signedAt && <div className="flex justify-between"><span className="text-muted-foreground">Signed at</span><span className="font-mono">{b.consent.signedAt}</span></div>}
                    {b.consent.ipAddress && <div className="flex justify-between"><span className="text-muted-foreground">IP</span><span className="font-mono">{b.consent.ipAddress}</span></div>}
                    {b.consent.documentUrl && <a href={b.consent.documentUrl} className="text-primary text-xs inline-flex items-center gap-1 mt-1"><FileText className="h-3 w-3" /> consent.pdf</a>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Vendor activity</div>
                  <ol className="border-l-2 border-border ml-1 pl-3 space-y-2">
                    {b.events.map((e, i) => (
                      <li key={i} className="text-xs"><span className="text-muted-foreground tabular-nums">{e.at}</span> · <span className="font-mono text-[10px]">{e.actor}</span><div>{e.text}</div></li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1"><Bell className="h-3 w-3" /> Recruiter notifications</div>
                  <div className="space-y-1.5">
                    {b.notifications.map((n, i) => (
                      <div key={i} className="rounded-md border border-border p-2 text-xs flex items-start gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium">{n.subject}</div>
                          <div className="text-muted-foreground">{n.channel} → {n.to} · <span className="font-mono">{n.at}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {b.vendorResponse && <div className="rounded-md border border-border p-3 mb-4 bg-success/5">
                <div className="text-xs font-semibold mb-1">Vendor response</div>
                <div className="text-xs">Flags: {b.vendorResponse.flags.length === 0 ? <Pill tone="success">None</Pill> : b.vendorResponse.flags.map(f => <Pill key={f} tone="destructive">{f}</Pill>)}</div>
                {b.vendorResponse.reportUrl && <a href={b.vendorResponse.reportUrl} className="text-primary text-xs inline-flex items-center gap-1 mt-1"><FileText className="h-3 w-3" /> Full report</a>}
              </div>}

              <AdverseActionPanel bgcId={b.id} aa={b.adverseAction} status={b.status} canDecide={canDecide} />

              <div className="flex flex-wrap gap-2 pt-3 border-t border-border items-center">
                {(["IN_PROGRESS","CLEAR","ADVERSE_ACTION","CANCELLED"] as BgCheckStatus[]).map(s => (
                  <button key={s} onClick={() => advance(b.id, s)} disabled={b.status === s || !canManage}
                    title={!canManage ? `Locked — ${me.role.replace("_"," ")} cannot modify` : undefined}
                    className="text-xs font-medium px-3 h-8 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1">
                    {!canManage && <Lock className="h-3 w-3" />} Mark {s.replace("_"," ")}
                  </button>
                ))}
                {!canManage && <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Switch to Recruiter or TA Lead to modify</span>}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return <div className="text-xs"><div className="text-muted-foreground">{label}</div><div className="font-medium">{value || <span className="text-destructive">—</span>}</div></div>;
}

function AdverseActionPanel({ bgcId, aa, status }: { bgcId: string; aa?: import("@/lib/ta-data").AdverseAction; status: BgCheckStatus }) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [dispute, setDispute] = useState("");
  const [decision, setDecision] = useState<"WITHDRAWN" | "RESCINDED_OFFER" | "PROCEED">("RESCINDED_OFFER");
  const [rationale, setRationale] = useState("");

  const toggle = (r: string) => setReasons(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r]);

  if (status !== "ADVERSE_ACTION" && !aa) return null;

  if (!aa) {
    return (
      <div className="rounded-md border border-warning/40 bg-warning/5 p-3 mb-4">
        <div className="font-semibold text-sm flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-warning" /> Issue pre-adverse action notice</div>
        <div className="text-xs text-muted-foreground mb-2">Select FCRA reason(s). Candidate gets a 5 business day dispute window before any final decision.</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {ADVERSE_ACTION_REASONS.map(r => (
            <button key={r} onClick={() => toggle(r)} type="button"
              className={`text-[11px] px-2 h-7 rounded-md border ${reasons.includes(r) ? "bg-destructive text-destructive-foreground border-destructive" : "bg-card border-border hover:bg-muted"}`}>{r}</button>
          ))}
        </div>
        <button disabled={reasons.length === 0} onClick={() => { startAdverseAction(bgcId, reasons); toast.success("Pre-adverse notice sent — dispute window open"); }}
          className="text-xs font-semibold px-3 h-8 rounded-md bg-destructive text-destructive-foreground disabled:opacity-40">
          Issue pre-adverse notice
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 mb-4 space-y-3">
      <div className="font-semibold text-sm flex items-center gap-2"><Gavel className="h-4 w-4 text-destructive" /> Adverse action</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div><div className="text-muted-foreground">Pre-notice</div><div className="font-mono">{aa.preNoticeAt}</div></div>
        <div><div className="text-muted-foreground">Dispute window ends</div><div className="font-mono">{aa.disputeWindowEndsAt}</div></div>
        <div><div className="text-muted-foreground">Final notice</div><div className="font-mono">{aa.finalNoticeAt ?? "—"}</div></div>
      </div>
      <div className="text-xs flex flex-wrap gap-1"><span className="text-muted-foreground mr-1">Reasons:</span>{aa.reasons.map(r => <Pill key={r} tone="destructive">{r}</Pill>)}</div>

      {!aa.disputed && !aa.decision && (
        <div className="rounded-md bg-card border border-border p-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Candidate dispute (within window)</div>
          <textarea value={dispute} onChange={e => setDispute(e.target.value)} rows={2} placeholder="Candidate dispute notes…" className="w-full p-2 rounded-md border border-border bg-card text-xs" />
          <button disabled={dispute.trim().length < 5} onClick={() => { disputeAdverseAction(bgcId, dispute); setDispute(""); toast.success("Dispute logged"); }}
            className="mt-1 text-xs px-3 h-7 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40">Submit dispute</button>
        </div>
      )}
      {aa.disputed && <div className="text-xs"><Pill tone="warning">Disputed</Pill> <span className="text-muted-foreground">at {aa.disputedAt}</span><div className="italic mt-1">"{aa.disputeNotes}"</div></div>}

      {!aa.decision && (
        <div className="rounded-md bg-card border border-border p-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Final decision (audit-logged)</div>
          <div className="flex gap-1 mb-1">
            {(["PROCEED","RESCINDED_OFFER","WITHDRAWN"] as const).map(d => (
              <button key={d} onClick={() => setDecision(d)} type="button"
                className={`text-[11px] px-2 h-7 rounded-md border ${decision === d ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>{d.replace("_"," ")}</button>
            ))}
          </div>
          <textarea value={rationale} onChange={e => setRationale(e.target.value)} rows={2} placeholder="Decision rationale (required for audit)…" className="w-full p-2 rounded-md border border-border bg-card text-xs" />
          <button disabled={rationale.trim().length < 10} onClick={() => { decideAdverseAction(bgcId, decision, rationale); toast.success(`Decision recorded: ${decision}`); }}
            className="mt-1 text-xs font-semibold px-3 h-7 rounded-md bg-primary text-primary-foreground disabled:opacity-40">Record decision</button>
        </div>
      )}
      {aa.decision && (
        <div className="text-xs rounded-md bg-card border border-border p-2">
          <div className="flex items-center gap-2"><Pill tone={aa.decision === "PROCEED" ? "success" : "destructive"}>{aa.decision.replace("_"," ")}</Pill><span className="text-muted-foreground">by {aa.decisionBy} · {aa.decisionAt}</span></div>
          <div className="italic mt-1">"{aa.decisionRationale}"</div>
        </div>
      )}
    </div>
  );
}

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
import { ShieldCheck, Mail, FileText, Bell, AlertTriangle, Gavel } from "lucide-react";
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

  const advance = (id: string, to: BgCheckStatus) => {
    advanceBackgroundCheck(id, to);
    toast.success(`Status → ${to}`);
  };

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">Background Checks <Pill tone="success"><ShieldCheck className="h-3 w-3" /> FCRA / GDPR compliant</Pill></span>}
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

              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                {(["IN_PROGRESS","CLEAR","ADVERSE_ACTION","CANCELLED"] as BgCheckStatus[]).map(s => (
                  <button key={s} onClick={() => advance(b.id, s)} disabled={b.status === s}
                    className="text-xs font-medium px-3 h-8 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40">
                    Mark {s.replace("_"," ")}
                  </button>
                ))}
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

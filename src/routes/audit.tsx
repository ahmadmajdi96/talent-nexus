import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { auditLog, candidates, requisitions } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { useCurrentUser } from "@/lib/role";
import { CAN } from "@/lib/role";
import { Download, FileDown, Filter, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [
    { title: "Audit Log — CORTA Acquisition" },
    { name: "description", content: "Tamper-evident audit trail with filters and CSV/PDF export for adverse actions, scorecard locks, hiring decisions and CoreHR handoffs." },
  ]}),
  component: AuditPage,
});

const EVENT_GROUPS: { label: string; match: (a: string) => boolean }[] = [
  { label: "All", match: () => true },
  { label: "Adverse actions", match: a => a.startsWith("ADVERSE_") },
  { label: "Scorecard locks", match: a => a === "FINALIZED" || a === "SUBMITTED" },
  { label: "Hiring decisions", match: a => a.startsWith("DECISION_") },
  { label: "CoreHR handoff", match: a => a === "EVENT_SENT" },
];

function AuditPage() {
  useTAStore();
  const me = useCurrentUser();
  const canExport = CAN.exportAudit(me.role);

  const [candidate, setCandidate] = useState<string>("ALL");
  const [req, setReq] = useState<string>("ALL");
  const [group, setGroup] = useState<string>("All");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const matcher = EVENT_GROUPS.find(g => g.label === group)!.match;
    return auditLog.filter(l => {
      if (!matcher(l.action)) return false;
      if (candidate !== "ALL" && !(l.entityId === candidate || l.text.includes(candidate))) return false;
      if (req !== "ALL" && !(l.entityId === req || l.text.includes(req))) return false;
      if (q && !`${l.entity} ${l.entityId} ${l.action} ${l.actor} ${l.text}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [candidate, req, group, q]);

  const exportCsv = () => {
    if (!canExport) return toast.error("Your role cannot export audit data");
    const header = ["id","at","entity","entityId","action","actor","text"].join(",");
    const body = rows.map(r => [r.id, r.at, r.entity, r.entityId, r.action, r.actor, JSON.stringify(r.text)].join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    triggerDownload(blob, `hireflow-audit-${Date.now()}.csv`);
    toast.success(`Exported ${rows.length} rows to CSV`);
  };

  const exportPdf = () => {
    if (!canExport) return toast.error("Your role cannot export audit data");
    // Lightweight printable HTML → PDF via window.print
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return toast.error("Popup blocked");
    const style = `body{font:12px Inter,system-ui;padding:24px;color:#0f172a}h1{font-size:18px;margin:0 0 4px}small{color:#64748b}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border-bottom:1px solid #e2e8f0;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f8fafc;text-transform:uppercase;font-size:10px;letter-spacing:.05em;color:#475569}td.mono{font-family:JetBrains Mono,monospace;font-size:11px}`;
    const tableRows = rows.map(r => `<tr><td class="mono">${r.at}</td><td>${r.entity}<div class="mono" style="color:#64748b">${r.entityId}</div></td><td>${r.action.replace(/_/g, " ")}</td><td>${r.actor}</td><td>${r.text.replace(/</g, "&lt;")}</td></tr>`).join("");
    w.document.write(`<!doctype html><html><head><title>CORTA Acquisition Audit Export</title><style>${style}</style></head><body><h1>CORTA Acquisition Audit Log Export</h1><small>Generated ${new Date().toISOString()} · ${rows.length} entries · Filters: group=${group}, candidate=${candidate}, req=${req}, q="${q}"</small><table><thead><tr><th>When</th><th>Entity</th><th>Action</th><th>Actor</th><th>Detail</th></tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
    toast.success("Opened printable PDF view");
  };

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">Audit Log <Pill tone="success"><Lock className="h-3 w-3" /> Tamper-evident · 7y retention</Pill></span>}
        description="Filter every requisition, candidate, scorecard, adverse-action and CoreHR conversion event. Export for SOX / FCRA / EEO requests."
        actions={<>
          <button onClick={exportCsv} disabled={!canExport} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40"><Download className="h-4 w-4" /> CSV</button>
          <button onClick={exportPdf} disabled={!canExport} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"><FileDown className="h-4 w-4" /> PDF</button>
        </>}
      />

      <div className="page-section p-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2"><Filter className="h-3 w-3" /> Filters</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select label="Event type" value={group} onChange={setGroup} options={EVENT_GROUPS.map(g => g.label)} />
          <Select label="Candidate" value={candidate} onChange={setCandidate} options={["ALL", ...candidates.map(c => c.id)]} render={v => v === "ALL" ? "All candidates" : `${v} — ${candidates.find(c=>c.id===v)?.firstName ?? ""}`} />
          <Select label="Requisition" value={req} onChange={setReq} options={["ALL", ...requisitions.map(r => r.id)]} render={v => v === "ALL" ? "All requisitions" : `${v} — ${requisitions.find(r=>r.id===v)?.title ?? ""}`} />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Search</label>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="actor, text, id…" className="mt-1 h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 tabular-nums">{rows.length} of {auditLog.length} entries</div>
      </div>

      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Actor</th>
              <th className="text-left p-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(l => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3 text-xs tabular-nums text-muted-foreground">{l.at}</td>
                <td className="p-3 text-xs"><div className="font-medium">{l.entity}</div><div className="font-mono text-muted-foreground">{l.entityId}</div></td>
                <td className="p-3"><Pill tone={
                  l.action.startsWith("ADVERSE_") ? "destructive"
                  : l.action.startsWith("DECISION_HIRE") ? "success"
                  : l.action.startsWith("DECISION_REJECT") ? "destructive"
                  : l.action === "EVENT_SENT" ? "primary"
                  : l.action === "FINALIZED" ? "accent"
                  : "info"
                }>{l.action.replace(/_/g, " ")}</Pill></td>
                <td className="p-3 text-xs">{l.actor}</td>
                <td className="p-3 text-xs">{l.text}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">No audit entries match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Select({ label, value, onChange, options, render }: { label: string; value: string; onChange: (v: string) => void; options: string[]; render?: (v: string) => string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 h-9 w-full px-2 rounded-md border border-border bg-card text-sm">
        {options.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </div>
  );
}

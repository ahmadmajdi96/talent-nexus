import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Plus, Search, Filter, Briefcase, Sparkles } from "lucide-react";
import { requisitions, type ReqStatus } from "@/lib/ta-data";

export const Route = createFileRoute("/requisitions/")({
  head: () => ({ meta: [
    { title: "Requisitions — HireFlow" },
    { name: "description", content: "Manage open job requisitions, approval workflows and posting distribution." },
  ]}),
  component: ReqsPage,
});

const statusTone: Record<ReqStatus, any> = {
  DRAFT: "muted", PENDING_APPROVAL: "warning", OPEN: "success",
  ON_HOLD: "info", FILLED: "primary", CLOSED: "muted",
};

function ReqsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ReqStatus | "ALL">("ALL");
  const filtered = useMemo(() => requisitions.filter(r => {
    if (status !== "ALL" && r.status !== status) return false;
    if (q && !`${r.title} ${r.id} ${r.department} ${r.location}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, status]);

  return (
    <AppShell>
      <PageHeader
        title="Requisitions"
        description="All open and pending requisitions with their multi-stage approval chain. Salary bands sourced from CoreHR compensation data."
        actions={<>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md border border-border bg-card hover:bg-muted"><Filter className="h-4 w-4" /> Bulk action</button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> New requisition</button>
        </>}
      />

      <div className="page-section p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-sm" placeholder="Search by title, ID, department…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
          <option value="ALL">All statuses</option>
          {Object.keys(statusTone).map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {requisitions.length}</div>
      </div>

      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Requisition</th>
              <th className="text-left p-3">Department</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Salary band</th>
              <th className="text-left p-3">Hiring Manager</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Candidates</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                <td className="p-3">
                  <Link to="/requisitions/$id" params={{ id: r.id }} className="flex items-center gap-3 group">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "var(--gradient-primary)" }}><Briefcase className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <div className="font-semibold group-hover:text-primary transition-colors truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground"><span className="font-mono">{r.id}</span> · {r.openings} opening{r.openings>1?"s":""} {r.workgridForecastId && <Pill tone="accent"><Sparkles className="h-3 w-3" /> WG</Pill>}</div>
                    </div>
                  </Link>
                </td>
                <td className="p-3"><div className="text-sm">{r.department}</div><div className="text-xs text-muted-foreground">{r.costCenter}</div></td>
                <td className="p-3"><div className="text-sm">{r.location}</div><div className="text-xs text-muted-foreground">{r.legalEntity}</div></td>
                <td className="p-3 text-xs tabular-nums">{r.salaryMin.toLocaleString()}–{r.salaryMax.toLocaleString()} {r.currency}</td>
                <td className="p-3 text-xs">{r.hiringManagerName}</td>
                <td className="p-3"><Pill tone={statusTone[r.status]}>{r.status.replace("_"," ")}</Pill></td>
                <td className="p-3 text-right tabular-nums font-semibold">{r.candidates}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { Search } from "lucide-react";
import { candidates, STAGE_LABEL, requisitions } from "@/lib/ta-data";

export const Route = createFileRoute("/candidates/")({
  head: () => ({ meta: [
    { title: "Candidates — CORTA Acquisition" },
    { name: "description", content: "All candidates across requisitions, with source, stage and rating." },
  ]}),
  component: CandidatesPage,
});

function CandidatesPage() {
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("ALL");
  const [stage, setStage] = useState("ALL");
  const filtered = useMemo(() => candidates.filter(c => {
    if (src !== "ALL" && c.source !== src) return false;
    if (stage !== "ALL" && c.stage !== stage) return false;
    if (q && !`${c.firstName} ${c.lastName} ${c.id} ${c.email} ${c.location}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, src, stage]);
  const sources = Array.from(new Set(candidates.map(c => c.source)));

  return (
    <AppShell>
      <PageHeader title="Candidates" description="GDPR-compliant candidate database. Anonymous-mode toggles bias-free screening per OFCCP guidance." />

      <div className="page-section p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-sm" placeholder="Search candidates…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={src} onChange={e => setSrc(e.target.value)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
          <option value="ALL">All sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={stage} onChange={e => setStage(e.target.value)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
          <option value="ALL">All stages</option>
          {Object.entries(STAGE_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {candidates.length}</div>
      </div>

      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Requisition</th>
              <th className="text-left p-3">Source</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Stage</th>
              <th className="text-right p-3">Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const r = requisitions.find(x => x.id === c.reqId);
              const display = c.anonymousMode ? `Candidate ${c.id}` : `${c.firstName} ${c.lastName}`;
              return (
                <tr key={c.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="p-3">
                    <Link to="/candidates/$id" params={{ id: c.id }} className="flex items-center gap-3 group">
                      <Avatar name={display} size={32} />
                      <div className="min-w-0">
                        <div className="font-semibold group-hover:text-primary transition-colors truncate">{display}</div>
                        <div className="text-xs text-muted-foreground"><span className="font-mono">{c.id}</span> {c.anonymousMode && <Pill tone="accent">Anonymous</Pill>}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-xs"><div className="font-medium">{r?.title}</div><div className="text-muted-foreground font-mono">{c.reqId}</div></td>
                  <td className="p-3 text-xs">{c.source}</td>
                  <td className="p-3 text-xs">{c.location}</td>
                  <td className="p-3"><Pill tone={c.stage === "OFFER" ? "primary" : c.stage === "HIRED" ? "success" : "muted"}>{STAGE_LABEL[c.stage]}</Pill></td>
                  <td className="p-3 text-right text-xs text-muted-foreground tabular-nums">{c.appliedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

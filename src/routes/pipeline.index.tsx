import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { requisitions, candidatesByReq, STAGES, STAGE_LABEL, type Stage, moveCandidateStage } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { Star, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pipeline/")({
  head: () => ({ meta: [
    { title: "Pipeline — CORTA Acquisition" },
    { name: "description", content: "Drag-and-drop kanban view of every candidate stage across requisitions." },
  ]}),
  component: PipelineIndex,
});

const LS_REQ = "hf:pipeline:reqId";

function PipelineIndex() {
  const [reqId, setReqId] = useState<string>(() => {
    if (typeof window === "undefined") return requisitions[0].id;
    const saved = window.localStorage.getItem(LS_REQ);
    if (saved && requisitions.some(r => r.id === saved)) return saved;
    return requisitions.find(r => r.candidates > 0)?.id ?? requisitions[0].id;
  });
  useEffect(() => { try { window.localStorage.setItem(LS_REQ, reqId); } catch {} }, [reqId]);

  return (
    <AppShell>
      <PageHeader
        title="Pipeline"
        description="Drag candidates between stages — every move is auto-logged. Filters and selected requisition persist across refreshes."
        actions={
          <select value={reqId} onChange={e => setReqId(e.target.value)} className="h-9 px-3 rounded-md border border-border bg-card text-sm min-w-[280px]">
            {requisitions.map(r => <option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
          </select>
        }
      />
      <PipelineBoard reqId={reqId} />
    </AppShell>
  );
}

type SortKey = "applied_desc" | "applied_asc" | "rating_desc" | "name_asc";
const LS_PREFIX = "hf:pipeline:";

export function PipelineBoard({ reqId }: { reqId: string }) {
  useTAStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const [search, setSearch] = useState<string>(() => (typeof window !== "undefined" ? window.localStorage.getItem(LS_PREFIX + "search:" + reqId) ?? "" : ""));
  const [sort, setSort] = useState<SortKey>(() => (typeof window !== "undefined" ? (window.localStorage.getItem(LS_PREFIX + "sort:" + reqId) as SortKey) ?? "applied_desc" : "applied_desc"));

  // sync per-req filters when switching requisition
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSearch(window.localStorage.getItem(LS_PREFIX + "search:" + reqId) ?? "");
    setSort((window.localStorage.getItem(LS_PREFIX + "sort:" + reqId) as SortKey) ?? "applied_desc");
  }, [reqId]);
  useEffect(() => { try { window.localStorage.setItem(LS_PREFIX + "search:" + reqId, search); } catch {} }, [reqId, search]);
  useEffect(() => { try { window.localStorage.setItem(LS_PREFIX + "sort:" + reqId, sort); } catch {} }, [reqId, sort]);

  const cands = candidatesByReq(reqId);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q ? cands.filter(c => `${c.firstName} ${c.lastName} ${c.email} ${c.location} ${c.source} ${c.id}`.toLowerCase().includes(q)) : cands;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "applied_asc": return a.appliedAt.localeCompare(b.appliedAt);
        case "rating_desc": return (b.rating ?? 0) - (a.rating ?? 0);
        case "name_asc": return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
        case "applied_desc":
        default: return b.appliedAt.localeCompare(a.appliedAt);
      }
    });
    return list;
  }, [cands, search, sort]);

  const grouped: Record<Stage, typeof filtered> = { NEW:[], SCREEN:[], PHONE_INT:[], ONSITE:[], OFFER:[], HIRED:[], REJECTED:[] };
  filtered.forEach(c => grouped[c.stage].push(c));
  const r = requisitions.find(x => x.id === reqId);

  const onDrop = (stage: Stage) => {
    if (!dragId) return;
    const c = cands.find(x => x.id === dragId);
    if (c && c.stage !== stage) {
      moveCandidateStage(dragId, stage);
      toast.success(`Moved to ${STAGE_LABEL[stage]}`, { description: c.firstName + " " + c.lastName });
    }
    setDragId(null); setOverStage(null);
  };

  return (
    <>
      {r && <div className="page-section p-3 mb-4 flex flex-wrap items-center gap-3 text-xs">
        <span className="font-mono text-muted-foreground">{r.id}</span>
        <span className="font-semibold">{r.title}</span>
        <span className="text-muted-foreground">·</span>
        <span>Manager: {r.hiringManagerName}</span>
        <span className="text-muted-foreground">·</span>
        <span>Recruiter: {r.recruiterName}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, source…" className="h-8 pl-7 pr-3 rounded-md border border-border bg-card text-xs w-64" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="h-8 px-2 rounded-md border border-border bg-card text-xs">
            <option value="applied_desc">Newest applied</option>
            <option value="applied_asc">Oldest applied</option>
            <option value="rating_desc">Highest rating</option>
            <option value="name_asc">Name A→Z</option>
          </select>
          {(search || sort !== "applied_desc") && <button onClick={() => { setSearch(""); setSort("applied_desc"); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>}
          <span className="text-[10px] text-muted-foreground tabular-nums">{filtered.length}/{cands.length}</span>
        </div>
      </div>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map(s => (
          <div
            key={s}
            className={`kanban-col transition-colors ${overStage === s ? "ring-2 ring-primary/60 bg-primary/5" : ""}`}
            onDragOver={e => { e.preventDefault(); setOverStage(s); }}
            onDragLeave={() => setOverStage(o => o === s ? null : o)}
            onDrop={() => onDrop(s)}
          >
            <div className="flex items-center justify-between px-1 mb-1">
              <div className="text-xs font-semibold">{STAGE_LABEL[s]}</div>
              <span className="text-[10px] font-mono text-muted-foreground bg-card border border-border rounded-full px-1.5">{grouped[s].length}</span>
            </div>
            {grouped[s].map(c => (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDragId(c.id)}
                onDragEnd={() => { setDragId(null); setOverStage(null); }}
                className={`kanban-card block ${dragId === c.id ? "opacity-50" : ""}`}
              >
                <Link to="/candidates/$id" params={{ id: c.id }} className="block">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.anonymousMode ? "Candidate" : `${c.firstName} ${c.lastName}`} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{c.anonymousMode ? `Candidate ${c.id}` : `${c.firstName} ${c.lastName}`}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{c.source}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                    {c.rating && <span className="flex items-center gap-0.5 text-[10px]">
                      {Array.from({length: 5}).map((_, i) => <Star key={i} className={`h-2.5 w-2.5 ${i < c.rating! ? "fill-warning text-warning" : "text-border"}`} />)}
                    </span>}
                  </div>
                  {c.assessment && <div className="mt-1.5"><Pill tone="info">{c.assessment.score}/{c.assessment.max}</Pill></div>}
                </Link>
              </div>
            ))}
            {grouped[s].length === 0 && <div className="text-[10px] text-muted-foreground/60 text-center py-6 border border-dashed border-border rounded-md">{search ? "No matches" : "Drop here"}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

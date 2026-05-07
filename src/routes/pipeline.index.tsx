import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { requisitions, candidatesByReq, STAGES, STAGE_LABEL, type Stage, moveCandidateStage } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pipeline/")({
  head: () => ({ meta: [
    { title: "Pipeline — HireFlow" },
    { name: "description", content: "Drag-and-drop kanban view of every candidate stage across requisitions." },
  ]}),
  component: PipelineIndex,
});

function PipelineIndex() {
  const [reqId, setReqId] = useState(requisitions.find(r => r.candidates > 0)?.id ?? requisitions[0].id);
  return (
    <AppShell>
      <PageHeader
        title="Pipeline"
        description="Drag candidates between stages — every move is auto-logged to the activity timeline and audit trail."
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

export function PipelineBoard({ reqId }: { reqId: string }) {
  useTAStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const cands = candidatesByReq(reqId);
  const grouped: Record<Stage, typeof cands> = { NEW:[], SCREEN:[], PHONE_INT:[], ONSITE:[], OFFER:[], HIRED:[], REJECTED:[] };
  cands.forEach(c => grouped[c.stage].push(c));
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
      {r && <div className="page-section p-3 mb-4 flex items-center gap-3 text-xs">
        <span className="font-mono text-muted-foreground">{r.id}</span>
        <span className="font-semibold">{r.title}</span>
        <span className="text-muted-foreground">·</span>
        <span>Manager: {r.hiringManagerName}</span>
        <span className="text-muted-foreground">·</span>
        <span>Recruiter: {r.recruiterName}</span>
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
            {grouped[s].length === 0 && <div className="text-[10px] text-muted-foreground/60 text-center py-6 border border-dashed border-border rounded-md">Drop here</div>}
          </div>
        ))}
      </div>
    </>
  );
}

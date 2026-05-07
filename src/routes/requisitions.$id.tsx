import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { Briefcase, ArrowLeft, Globe2, Sparkles, CheckCircle2, Circle, Clock, Share2 } from "lucide-react";
import { reqById, candidatesByReq, STAGES, STAGE_LABEL } from "@/lib/ta-data";

export const Route = createFileRoute("/requisitions/$id")({
  head: ({ params }) => ({ meta: [
    { title: `${params.id} — Requisition · CORTA Acquisition` },
    { name: "description", content: "Requisition detail with approval chain, postings, and candidate funnel." },
  ]}),
  component: ReqDetail,
  notFoundComponent: () => <AppShell><div className="text-center py-20 text-muted-foreground">Requisition not found.</div></AppShell>,
});

function ReqDetail() {
  const { id } = Route.useParams();
  const r = reqById(id); if (!r) throw notFound();
  const cands = candidatesByReq(r.id);
  const byStage = (s: string) => cands.filter(c => c.stage === s).length;

  return (
    <AppShell>
      <Link to="/requisitions" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"><ArrowLeft className="h-3 w-3" /> All requisitions</Link>
      <PageHeader
        title={<span className="flex items-center gap-3">{r.title} <Pill tone={r.status === "OPEN" ? "success" : r.status === "PENDING_APPROVAL" ? "warning" : "muted"}>{r.status.replace("_"," ")}</Pill></span>}
        description={<><span className="font-mono">{r.id}</span> · {r.department} · {r.location} · {r.legalEntity}</>}
        actions={<>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md border border-border bg-card hover:bg-muted"><Share2 className="h-4 w-4" /> Referral link</button>
          <Link to="/pipeline/$reqId" params={{ reqId: r.id }} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90">Open pipeline</Link>
        </>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="page-section p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Job description</div>
            <p className="text-sm mb-4">{r.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <KV label="Employment" value={r.employmentType.replace("_"," ")} />
              <KV label="Grade / Band" value={r.level} />
              <KV label="Openings" value={r.openings.toString()} />
              <KV label="Target start" value={r.targetStart} />
              <KV label="Salary band" value={`${r.salaryMin.toLocaleString()}–${r.salaryMax.toLocaleString()} ${r.currency}`} />
              <KV label="Cost center" value={r.costCenter} />
              <KV label="Backfill" value={r.backfill ? "Yes" : "No"} />
              <KV label="Recruiter" value={r.recruiterName} />
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Required skills</div>
              <div className="flex flex-wrap gap-1.5">{r.skills.map(s => <Pill key={s} tone="primary">{s}</Pill>)}</div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Justification</div>
              <p className="text-xs text-muted-foreground">{r.justification}</p>
            </div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Candidate funnel</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STAGES.map(s => (
                <div key={s} className="rounded-lg border border-border p-3 text-center bg-card">
                  <div className="text-2xl font-bold tabular-nums">{byStage(s)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{STAGE_LABEL[s]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Recent candidates</div>
            <div className="space-y-2">
              {cands.slice(0, 6).map(c => (
                <Link to="/candidates/$id" params={{ id: c.id }} key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar name={c.anonymousMode ? "Candidate" : `${c.firstName} ${c.lastName}`} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.anonymousMode ? `Candidate ${c.id}` : `${c.firstName} ${c.lastName}`}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.source} · {c.location}</div>
                  </div>
                  <Pill tone="muted">{STAGE_LABEL[c.stage]}</Pill>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="page-section p-5">
            <div className="font-semibold mb-3">Approval chain</div>
            <ol className="space-y-2">
              {r.approvalChain.map((a, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {a.status === "APPROVED" ? <CheckCircle2 className="h-4 w-4 text-success" /> : a.status === "REJECTED" ? <Circle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-warning" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{a.role}</div>
                    <div className="text-[11px] text-muted-foreground">{a.name}{a.at && ` · ${a.at}`}</div>
                  </div>
                  <Pill tone={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "destructive" : "warning"}>{a.status}</Pill>
                </li>
              ))}
            </ol>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3 flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" /> Distribution</div>
            <div className="space-y-2">
              {r.postings.length === 0 && <div className="text-xs text-muted-foreground">Not yet published.</div>}
              {r.postings.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="font-medium">{p.board}</div>
                  <Pill tone={p.live ? "success" : "muted"}>{p.live ? "Live" : "Paused"}</Pill>
                </div>
              ))}
            </div>
          </div>

          {r.workgridForecastId && (
            <div className="page-section p-5 border-l-4" style={{ borderLeftColor: "hsl(174 72% 42%)" }}>
              <div className="font-semibold flex items-center gap-2 mb-1"><Sparkles className="h-4 w-4 text-accent" /> WorkGrid linked</div>
              <p className="text-xs text-muted-foreground">Forecast <span className="font-mono">{r.workgridForecastId}</span> — this requisition was prioritized based on upcoming project demand.</p>
            </div>
          )}

          <div className="page-section p-5 border-l-4" style={{ borderLeftColor: "hsl(243 75% 58%)" }}>
            <div className="font-semibold mb-1 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Pulled from CoreHR</div>
            <p className="text-xs text-muted-foreground">Cost center, legal entity, salary band and grade are sourced from CoreHR compensation tables in real time.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

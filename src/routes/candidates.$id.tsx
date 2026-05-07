import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Star, ShieldCheck, Calendar, GitMerge, ClipboardCheck, RefreshCw, Lock, Gavel } from "lucide-react";
import { candidateById, reqById, offersByCandidate, interviews, STAGE_LABEL, bgChecksByCandidate, conversionByCandidate, aggregateScorecards, retryConversion, conversionDeliveries, recordHiringDecision, decisionsByCandidate, type HiringDecision } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { toast } from "sonner";
import { useCurrentUser, CAN } from "@/lib/role";

export const Route = createFileRoute("/candidates/$id")({
  head: ({ params }) => ({ meta: [
    { title: `${params.id} — Candidate · HireFlow` },
    { name: "description", content: "Candidate profile, scorecards, interview timeline and offer status." },
  ]}),
  component: CandidateDetail,
  notFoundComponent: () => <AppShell><div className="text-center py-20 text-muted-foreground">Candidate not found.</div></AppShell>,
});

function CandidateDetail() {
  useTAStore();
  const { id } = Route.useParams();
  const c = candidateById(id); if (!c) throw notFound();
  const r = reqById(c.reqId);
  const os = offersByCandidate(c.id);
  const ivs = interviews.filter(i => i.candidateId === c.id);
  const bgcs = bgChecksByCandidate(c.id);
  const conv = conversionByCandidate(c.id);
  const agg = aggregateScorecards(c);
  const display = c.anonymousMode ? `Candidate ${c.id}` : `${c.firstName} ${c.lastName}`;

  return (
    <AppShell>
      <Link to="/candidates" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"><ArrowLeft className="h-3 w-3" /> All candidates</Link>
      <PageHeader
        title={<span className="flex items-center gap-3">{display} <Pill tone="primary">{STAGE_LABEL[c.stage]}</Pill> {c.anonymousMode && <Pill tone="accent"><ShieldCheck className="h-3 w-3" /> Anonymous mode</Pill>}</span>}
        description={r && <>Applying for <Link to="/requisitions/$id" params={{ id: r.id }} className="text-primary hover:underline">{r.title}</Link> · {r.location}</>}
        actions={<>
          <Link to="/candidates/$id/scorecard" params={{ id: c.id }} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md border border-border bg-card hover:bg-muted"><ClipboardCheck className="h-4 w-4" /> Submit scorecard</Link>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90">Schedule interview</button>
        </>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="page-section p-5">
            <div className="flex items-start gap-4 mb-4">
              <Avatar name={display} size={64} />
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold">{display}</div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                  {!c.anonymousMode && <><span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span></>}
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}, {c.country}</span>
                </div>
              </div>
              {c.rating && <div className="flex gap-0.5">{Array.from({length: 5}).map((_,i) => <Star key={i} className={`h-4 w-4 ${i < c.rating! ? "fill-warning text-warning" : "text-border"}`} />)}</div>}
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Resume summary</div>
            <p className="text-sm mb-4">{c.resume.summary}</p>

            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5 mb-4">{c.resume.skills.map(s => <Pill key={s} tone="primary">{s}</Pill>)}</div>

            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Experience</div>
            <div className="space-y-2 mb-4">
              {c.resume.experience.map((e, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <div className="text-sm font-medium">{e.title} · {e.company}</div>
                  <div className="text-[11px] text-muted-foreground">{e.from} – {e.to}</div>
                  <div className="text-xs text-muted-foreground">{e.summary}</div>
                </div>
              ))}
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Education</div>
            {c.resume.education.map((e,i) => <div key={i} className="text-sm">{e.degree}, <span className="text-muted-foreground">{e.school} · {e.year}</span></div>)}

            {c.assessment && <div className="mt-4 rounded-lg border border-border p-3 bg-info/5">
              <div className="text-xs font-semibold mb-1">Assessment: {c.assessment.name}</div>
              <div className="text-2xl font-bold tabular-nums">{c.assessment.score} <span className="text-sm text-muted-foreground">/ {c.assessment.max}</span></div>
            </div>}
          </div>

          <div className="page-section p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Interview scorecards</div>
              {agg && <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{agg.count} submitted · avg {agg.avg}/5</span>
                <Pill tone={agg.verdict === "Hire" ? "success" : agg.verdict === "No Hire" ? "destructive" : "warning"}>Verdict: {agg.verdict}</Pill>
              </div>}
            </div>
            {c.scorecards.length === 0 && <div className="text-xs text-muted-foreground">No scorecards submitted yet. <Link to="/candidates/$id/scorecard" params={{ id: c.id }} className="text-primary hover:underline">Submit one →</Link></div>}
            <div className="space-y-3">
              {c.scorecards.map(s => (
                <div key={s.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={s.interviewerName} size={28} />
                      <div>
                        <div className="text-sm font-medium flex items-center gap-1.5">{s.interviewerName} {s.finalized && <Pill tone="success"><Lock className="h-2.5 w-2.5" /> Locked</Pill>}</div>
                        <div className="text-[11px] text-muted-foreground">{s.focus} · {s.submittedAt}{s.signature && <> · signed by {s.signature}</>}</div>
                      </div>
                    </div>
                    <Pill tone={s.recommendation.includes("STRONG_HIRE") ? "success" : s.recommendation === "HIRE" ? "primary" : "destructive"}>{s.recommendation.replace("_"," ")}</Pill>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {s.competencies.map(comp => (
                      <div key={comp.label} className="rounded-md bg-muted/50 px-2 py-1.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{comp.label}</div>
                        <div className="flex gap-0.5 mt-0.5">{Array.from({length: 5}).map((_,i) => <Star key={i} className={`h-3 w-3 ${i < comp.score ? "fill-warning text-warning" : "text-border"}`} />)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs italic text-muted-foreground">"{s.notes}"</div>
                </div>
              ))}
            </div>
          </div>

          <HiringManagerDecision candidateId={c.id} />

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Activity timeline</div>
            <ol className="relative border-l-2 border-border ml-2 space-y-3 pl-4">
              {c.events.map((ev, i) => (
                <li key={i} className="text-sm">
                  <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                  <div className="text-xs text-muted-foreground tabular-nums">{ev.at} · {ev.actor}</div>
                  <div>{ev.text}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="page-section p-5">
            <div className="font-semibold mb-3">Source</div>
            <div className="text-sm">{c.source}</div>
            {c.referrerEmployeeId && <div className="text-xs text-muted-foreground mt-1">Referred by <span className="font-mono">{c.referrerEmployeeId}</span></div>}
            {c.agencyId && <div className="text-xs text-muted-foreground mt-1">Agency: <span className="font-mono">{c.agencyId}</span></div>}
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Interviews</div>
            {ivs.length === 0 && <div className="text-xs text-muted-foreground">No interviews scheduled.</div>}
            <div className="space-y-2">
              {ivs.map(i => (
                <div key={i.id} className="rounded-md border border-border p-2">
                  <div className="text-sm font-medium">{i.round}</div>
                  <div className="text-[11px] text-muted-foreground">{i.scheduledAt} · {i.mode} · {i.durationMin}m</div>
                </div>
              ))}
            </div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Offers</div>
            {os.length === 0 && <div className="text-xs text-muted-foreground">No offer extended.</div>}
            {os.map(o => (
              <div key={o.id} className="rounded-md border border-border p-2 text-sm">
                <div className="flex items-center justify-between"><span className="font-mono text-xs">{o.id}</span><Pill tone={o.status === "ACCEPTED" ? "success" : o.status === "SENT" ? "info" : "warning"}>{o.status.replace("_"," ")}</Pill></div>
                <div className="mt-1 text-xs">{o.baseSalary.toLocaleString()} {o.currency} · {o.bonusPct}% bonus · start {o.startDate}</div>
              </div>
            ))}
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Privacy</div>
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between"><span>GDPR consent</span><Pill tone={c.consent.gdpr ? "success" : "destructive"}>{c.consent.gdpr ? "Granted" : "Missing"}</Pill></div>
              <div className="flex items-center justify-between"><span>Talent pool opt-in</span><Pill tone={c.consent.talentPool ? "success" : "muted"}>{c.consent.talentPool ? "Yes" : "No"}</Pill></div>
              <div className="flex items-center justify-between"><span>Data retention until</span><span className="font-mono">{c.consent.expiresAt}</span></div>
            </div>
          </div>

          {bgcs.length > 0 && <div className="page-section p-5">
            <div className="font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Background checks <Link to="/background-checks" className="ml-auto text-[11px] text-primary font-normal hover:underline">All →</Link></div>
            {bgcs.map(b => (
              <div key={b.id} className="rounded-md border border-border p-2 text-xs space-y-1">
                <div className="flex items-center justify-between"><span className="font-mono">{b.id}</span><Pill tone={b.status === "CLEAR" ? "success" : b.status === "ADVERSE_ACTION" ? "destructive" : "info"}>{b.status.replace("_"," ")}</Pill></div>
                <div className="text-muted-foreground">{b.vendor} · {b.package}</div>
                {b.completedAt && <div className="text-muted-foreground">Completed {b.completedAt}</div>}
              </div>
            ))}
          </div>}

          <div className="page-section p-5">
            <div className="font-semibold mb-3 flex items-center gap-2"><GitMerge className="h-4 w-4 text-primary" /> CoreHR conversion</div>
            {!conv && <div className="text-xs text-muted-foreground">Not yet converted. Will fire on offer acceptance.</div>}
            {conv && (() => {
              const dlv = conversionDeliveries[conv.id] ?? [];
              return <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between"><span className="font-mono">{conv.id}</span><Pill tone={conv.status === "EMPLOYEE_CREATED" ? "success" : conv.status === "FAILED" ? "destructive" : "warning"}>{conv.status.replace("_"," ")}</Pill></div>
                {conv.newEmployeeId && <div className="flex items-center justify-between"><span className="text-muted-foreground">CoreHR Employee</span><span className="font-mono font-semibold">{conv.newEmployeeId}</span></div>}
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Accepted</span><span className="font-mono">{conv.acceptedAt}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Delivery attempts</span><span className="font-mono">{dlv.length}</span></div>
                <div className="space-y-0.5 pt-1 border-t border-border">
                  {dlv.map(d => (
                    <div key={d.attempt} className="font-mono text-[10px] flex items-center gap-1.5">
                      <span className="text-muted-foreground">#{d.attempt}</span>
                      <span className={d.httpStatus < 300 ? "text-success" : "text-destructive"}>{d.httpStatus}</span>
                      <span className="text-muted-foreground">{d.durationMs}ms</span>
                      <span className="text-muted-foreground">· {d.at.split(" ")[1]}</span>
                    </div>
                  ))}
                </div>
                {conv.status === "FAILED" && (
                  <button onClick={() => { retryConversion(conv.id); toast.success("Retry queued"); }} className="w-full mt-2 inline-flex items-center justify-center gap-1 text-xs font-medium px-2 h-8 rounded-md border border-border bg-card hover:bg-muted">
                    <RefreshCw className="h-3 w-3" /> Retry delivery
                  </button>
                )}
                <Link to="/conversion" className="block mt-1 text-primary text-[11px] hover:underline">Open handoff log →</Link>
              </div>;
            })()}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function HiringManagerDecision({ candidateId }: { candidateId: string }) {
  const [decision, setDecision] = useState<HiringDecision["decision"]>("ADVANCE");
  const [rationale, setRationale] = useState("");
  const decisions = decisionsByCandidate(candidateId);
  const me = useCurrentUser();
  const canDecide = CAN.recordHiringDecision(me.role);
  const submit = () => {
    if (!canDecide) { toast.error("Only the hiring manager (or TA Lead) can record final hiring decisions"); return; }
    if (rationale.trim().length < 10) { toast.error("Rationale required (10+ chars) for audit log"); return; }
    recordHiringDecision({ candidateId, decidedBy: me.name, decidedById: me.id, decision, rationale });
    setRationale("");
    toast.success(`Decision recorded: ${decision}`);
  };
  return (
    <div className="page-section p-5">
      <div className="font-semibold mb-1 flex items-center gap-2"><Gavel className="h-4 w-4 text-primary" /> Hiring manager decision</div>
      <div className="text-xs text-muted-foreground mb-3">Records to the audit log and updates candidate stage. Visible to HR + recruiter.</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        {(["ADVANCE","HIRE","REJECT","HOLD"] as const).map(d => (
          <button key={d} onClick={() => setDecision(d)} type="button"
            className={`h-9 rounded-md border text-xs font-semibold ${decision === d ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"}`}>{d}</button>
        ))}
      </div>
      <textarea value={rationale} onChange={e => setRationale(e.target.value)} rows={2} placeholder="Decision rationale (required for audit)…" className="w-full p-2 rounded-md border border-border bg-card text-xs mb-2" />
      <button onClick={submit} className="text-xs font-semibold px-4 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90">Record decision</button>
      {decisions.length > 0 && <div className="mt-4 border-t border-border pt-3 space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Past decisions</div>
        {decisions.map((d, i) => (
          <div key={i} className="text-xs flex items-start gap-2">
            <Pill tone={d.decision === "HIRE" ? "success" : d.decision === "REJECT" ? "destructive" : d.decision === "HOLD" ? "warning" : "primary"}>{d.decision}</Pill>
            <div className="flex-1"><span className="text-muted-foreground">{d.decidedAt} · {d.decidedBy}</span><div className="italic">"{d.rationale}"</div></div>
          </div>
        ))}
      </div>}
    </div>
  );
}

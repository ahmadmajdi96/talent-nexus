import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { candidateById, reqById, submitScorecard, finalizeScorecard, aggregateScorecards, type Scorecard } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { useCurrentUser, CAN } from "@/lib/role";
import { ArrowLeft, Star, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidates/$id/scorecard")({
  head: ({ params }) => ({ meta: [
    { title: `Scorecard ${params.id} — CORTA Acquisition` },
    { name: "description", content: "Submit a structured competency-based interview scorecard." },
  ]}),
  component: ScorecardForm,
});

const COMPETENCIES_BY_FOCUS: Record<string, { label: string; question: string }[]> = {
  "Technical": [
    { label: "Problem Solving", question: "How effectively did the candidate decompose ambiguous problems?" },
    { label: "Code Quality", question: "Was their code idiomatic, tested, and maintainable?" },
    { label: "Systems Design", question: "Did they reason about scale, failure modes, and tradeoffs?" },
    { label: "Communication", question: "Could they clearly explain their thinking under pressure?" },
  ],
  "Design Craft": [
    { label: "Visual Design", question: "Quality and polish of the visual artifacts shown." },
    { label: "Systems Thinking", question: "Ability to design scalable, reusable patterns." },
    { label: "Research Rigor", question: "Use of evidence and user signals to drive decisions." },
    { label: "Communication", question: "Clarity in walkthroughs and rationale." },
  ],
  "Sales Acumen": [
    { label: "Discovery", question: "Quality of qualification and customer questions." },
    { label: "Forecasting", question: "Pipeline hygiene and predictability." },
    { label: "Negotiation", question: "Ability to navigate procurement and close." },
    { label: "Communication", question: "Written and verbal clarity." },
  ],
  "Culture": [
    { label: "Collaboration", question: "Willingness to engage, listen, build with others." },
    { label: "Ownership", question: "Bias to outcomes vs. to process." },
    { label: "Growth Mindset", question: "Curiosity and feedback receptivity." },
    { label: "Integrity", question: "Honest about gaps; aligned with our values." },
  ],
};

const schema = z.object({
  interviewerName: z.string().min(2).max(80),
  focus: z.enum(["Technical","Design Craft","Sales Acumen","Culture"]),
  scores: z.array(z.number().min(1).max(5)).min(2),
  notes: z.string().min(40, "At least 40 chars of written justification required.").max(2000),
  recommendation: z.enum(["STRONG_HIRE","HIRE","NO_HIRE","STRONG_NO_HIRE"]),
});

function ScorecardForm() {
  useTAStore();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const c = candidateById(id);
  const r = c ? reqById(c.reqId) : undefined;
  const [focus, setFocus] = useState<keyof typeof COMPETENCIES_BY_FOCUS>("Technical");
  const comps = COMPETENCIES_BY_FOCUS[focus];
  const [scores, setScores] = useState<number[]>(comps.map(() => 3));
  const [interviewerName, setInterviewerName] = useState("Marcus Lindberg");
  const [notes, setNotes] = useState("");
  const [rec, setRec] = useState<Scorecard["recommendation"]>("HIRE");
  const [signature, setSignature] = useState("");

  if (!c) return <AppShell><div className="text-center py-20 text-muted-foreground">Candidate not found.</div></AppShell>;

  const onFocusChange = (f: keyof typeof COMPETENCIES_BY_FOCUS) => {
    setFocus(f); setScores(COMPETENCIES_BY_FOCUS[f].map(() => 3));
  };

  const me = useCurrentUser();
  const canSubmit = CAN.submitScorecard(me.role);
  const canFinalize = CAN.finalizeScorecard(me.role);

  const submit = (alsoFinalize: boolean) => {
    if (!canSubmit) { toast.error("Your role cannot submit scorecards"); return; }
    if (alsoFinalize && !canFinalize) { toast.error("Only interviewers, recruiters or TA leads can finalize"); return; }
    const parsed = schema.safeParse({ interviewerName, focus, scores, notes, recommendation: rec });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (alsoFinalize && signature.trim().length < 3) { toast.error("Type your full name to sign off"); return; }
    submitScorecard(c.id, {
      interviewerId: me.id,
      interviewerName,
      focus,
      competencies: comps.map((cm, i) => ({ label: cm.label, score: scores[i] as 1|2|3|4|5 })),
      notes,
      recommendation: rec,
    });
    if (alsoFinalize) {
      const last = candidateById(c.id)?.scorecards.at(-1);
      if (last) finalizeScorecard(c.id, last.id, signature);
      toast.success("Scorecard finalized & locked", { description: "Hiring manager has been notified." });
    } else {
      toast.success("Scorecard saved as draft");
    }
    navigate({ to: "/candidates/$id", params: { id: c.id } });
  };

  const prev = aggregateScorecards(c);

  return (
    <AppShell>
      <Link to="/candidates/$id" params={{ id: c.id }} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"><ArrowLeft className="h-3 w-3" /> Back to candidate</Link>
      <PageHeader
        title={<span>Submit Scorecard</span>}
        description={<>For <span className="font-semibold text-foreground">{c.firstName} {c.lastName}</span> — {r?.title}</>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="page-section p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interviewer</label>
                <input value={interviewerName} onChange={e => setInterviewerName(e.target.value)} className="mt-1 h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Focus area</label>
                <select value={focus} onChange={e => onFocusChange(e.target.value as any)} className="mt-1 h-9 w-full px-3 rounded-md border border-border bg-card text-sm">
                  {Object.keys(COMPETENCIES_BY_FOCUS).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Competencies — score 1 (poor) to 5 (exceptional)</div>
            <div className="space-y-4">
              {comps.map((cm, i) => (
                <div key={cm.label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div>
                      <div className="text-sm font-semibold">{cm.label}</div>
                      <div className="text-xs text-muted-foreground">{cm.question}</div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums w-8 text-right text-primary">{scores[i]}</div>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScores(s => s.map((v, idx) => idx === i ? n : v))}
                        className={`h-9 flex-1 rounded-md border text-sm font-medium transition-colors ${scores[i] === n ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"}`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="page-section p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Written justification (required)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={6}
              placeholder="Cite specific examples from the interview that justify your scores and recommendation. Avoid demographic or non-job-related observations (EEO compliance)."
              className="mt-2 w-full p-3 rounded-md border border-border bg-card text-sm resize-y"
            />
            <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">{notes.length} / 2000</div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-3">Recommendation</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["STRONG_HIRE","HIRE","NO_HIRE","STRONG_NO_HIRE"] as const).map(v => (
                <button key={v} onClick={() => setRec(v)} type="button"
                  className={`h-10 rounded-md border text-xs font-semibold transition-colors ${rec === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"}`}>
                  {v.replace("_"," ")}
                </button>
              ))}
            </div>
          </div>

          <div className="page-section p-5">
            <div className="font-semibold mb-2 flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Sign off & finalize</div>
            <div className="text-xs text-muted-foreground mb-2">Type your full legal name to e-sign. Finalized scorecards become read-only and cannot be edited — they are entered into the immutable audit log.</div>
            <input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name to sign" className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
          </div>

          {!canSubmit && <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs flex items-start gap-2"><ShieldAlert className="h-4 w-4 text-warning shrink-0" /> Your role (<span className="font-mono">{me.role}</span>) cannot submit scorecards.</div>}
          <div className="flex justify-end gap-2">
            <Link to="/candidates/$id" params={{ id: c.id }} className="inline-flex items-center px-4 h-10 rounded-md border border-border bg-card hover:bg-muted text-sm font-medium">Cancel</Link>
            <button onClick={() => submit(false)} disabled={!canSubmit} className="inline-flex items-center px-4 h-10 rounded-md border border-border bg-card hover:bg-muted text-sm font-semibold disabled:opacity-40">Save draft</button>
            <button onClick={() => submit(true)} disabled={!canSubmit || !canFinalize} className="inline-flex items-center gap-1.5 px-5 h-10 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm font-semibold disabled:opacity-40"><Lock className="h-4 w-4" /> Finalize & sign</button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="page-section p-5">
            <div className="font-semibold mb-3">Live aggregation</div>
            <div className="text-xs text-muted-foreground mb-3">Auto-calculated for the hiring manager across all submitted scorecards.</div>
            {!prev && <div className="text-xs text-muted-foreground">No scorecards submitted yet.</div>}
            {prev && <div className="space-y-2 text-sm">
              <Row label="Submitted" value={`${prev.count}`} />
              <Row label="Average competency" value={<span className="flex items-center gap-1">{prev.avg} <Star className="h-3 w-3 fill-warning text-warning" /></span>} />
              <Row label="Consensus signal" value={<span className="font-mono">{prev.consensus > 0 ? `+${prev.consensus}` : prev.consensus}</span>} />
              <Row label="Verdict" value={<Pill tone={prev.verdict === "Hire" ? "success" : prev.verdict === "No Hire" ? "destructive" : "warning"}>{prev.verdict}</Pill>} />
            </div>}
          </div>

          <div className="page-section p-5 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground">Tips for fair scoring</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Tie each score to a behavior you observed.</li>
              <li>Avoid culture-fit framing; describe a specific value alignment.</li>
              <li>Submit within 24h while context is fresh.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">{label}</span><span className="font-semibold">{value}</span></div>;
}

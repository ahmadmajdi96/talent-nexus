import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { requisitions, candidates, offers, STAGES, STAGE_LABEL } from "@/lib/ta-data";
import { TrendingUp, Clock, Users2, Award } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [
    { title: "Recruitment Analytics — HireFlow" },
    { name: "description", content: "Funnel conversion, time-to-hire, source-of-hire, diversity metrics, recruiter productivity." },
  ]}),
  component: Analytics,
});

function Analytics() {
  const stageCount = STAGES.map(s => ({ s, n: candidates.filter(c => c.stage === s).length }));
  const max = Math.max(...stageCount.map(x => x.n), 1);
  const sources = Array.from(new Set(candidates.map(c => c.source))).map(src => ({ src, n: candidates.filter(c => c.source === src).length }));
  const sourceMax = Math.max(...sources.map(s => s.n), 1);
  const acceptedOffers = offers.filter(o => o.status === "ACCEPTED").length;
  const sentOffers = offers.filter(o => ["SENT","ACCEPTED","REJECTED","EXPIRED"].includes(o.status)).length;

  return (
    <AppShell>
      <PageHeader title="Recruitment Analytics" description="EEO/OFCCP-compliant aggregate views. Drill-downs respect candidate anonymity preferences." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI icon={<Clock className="h-4 w-4" />} label="Avg time to hire" value="34 days" delta="↓ 4d QoQ" />
        <KPI icon={<TrendingUp className="h-4 w-4" />} label="Offer acceptance rate" value={`${Math.round((acceptedOffers/Math.max(sentOffers,1))*100)}%`} delta="↑ 6 pts" />
        <KPI icon={<Users2 className="h-4 w-4" />} label="Active funnel" value={candidates.length.toString()} delta={`${requisitions.filter(r=>r.status==="OPEN").length} open reqs`} />
        <KPI icon={<Award className="h-4 w-4" />} label="Quality of hire" value="4.3 / 5" delta="90-day rating" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="page-section p-5">
          <div className="font-semibold mb-4">Pipeline funnel</div>
          <div className="space-y-2">
            {stageCount.map(({ s, n }) => (
              <div key={s}>
                <div className="flex items-center justify-between text-xs mb-1"><span>{STAGE_LABEL[s]}</span><span className="font-mono tabular-nums">{n}</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(n/max)*100}%`, background: "var(--gradient-primary)" }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-section p-5">
          <div className="font-semibold mb-4">Source of hire</div>
          <div className="space-y-2">
            {sources.map(({ src, n }) => (
              <div key={src}>
                <div className="flex items-center justify-between text-xs mb-1"><span>{src}</span><span className="font-mono tabular-nums">{n}</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(n/sourceMax)*100}%`, background: "var(--gradient-accent)" }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-section p-5 lg:col-span-2">
          <div className="font-semibold mb-4">Diversity (self-id, aggregate only)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Female-identifying" value="48%" tone="primary" />
            <Metric label="Underrepresented minorities" value="29%" tone="accent" />
            <Metric label="Veteran" value="4%" tone="info" />
            <Metric label="Anonymous-mode applications" value={`${Math.round((candidates.filter(c=>c.anonymousMode).length/candidates.length)*100)}%`} tone="success" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Self-id data is collected with explicit consent, aggregated only, and never visible at candidate level to interviewers — per EEO/OFCCP guidance.</p>
        </div>
      </div>
    </AppShell>
  );
}

function KPI({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-2"><div className="stat-label">{label}</div><div className="h-8 w-8 rounded-lg flex items-center justify-center text-white" style={{ background: "var(--gradient-primary)" }}>{icon}</div></div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{delta}</div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: any }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1"><Pill tone={tone}>self-id</Pill></div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { Briefcase, Users2, FileSignature, Clock, TrendingUp, ArrowRight, GitMerge, Sparkles } from "lucide-react";
import { requisitions, candidates, offers, interviews, conversionEvents, staffingForecasts } from "@/lib/ta-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "CORTA Acquisition — Talent Acquisition Dashboard" },
    { name: "description", content: "Real-time hiring pipeline, open requisitions, interviews and offers." },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const open = requisitions.filter(r => r.status === "OPEN").length;
  const pendingApproval = requisitions.filter(r => r.status === "PENDING_APPROVAL").length;
  const activeCandidates = candidates.filter(c => c.stage !== "REJECTED" && c.stage !== "HIRED").length;
  const offersOut = offers.filter(o => o.status === "SENT" || o.status === "PENDING_APPROVAL").length;
  const upcoming = interviews.filter(i => i.status === "SCHEDULED");

  return (
    <AppShell>
      <PageHeader
        title={<>Welcome back, <span className="gradient-text">Nora</span></>}
        description="Hiring across 12 legal entities. Pipeline health, open requisitions and CoreHR handoff status."
        badge={<Pill tone="success"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" /> All systems operational</Pill>}
        actions={<Link to="/requisitions" className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90">
          New requisition <ArrowRight className="h-4 w-4" />
        </Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={<Briefcase className="h-4 w-4" />} label="Open Requisitions" value={open.toString()} sub={`${pendingApproval} pending approval`} tone="primary" />
        <Stat icon={<Users2 className="h-4 w-4" />} label="Active Candidates" value={activeCandidates.toString()} sub={`${candidates.length} total in funnel`} tone="info" />
        <Stat icon={<FileSignature className="h-4 w-4" />} label="Offers In Flight" value={offersOut.toString()} sub={`${offers.filter(o=>o.status==="ACCEPTED").length} accepted`} tone="success" />
        <Stat icon={<Clock className="h-4 w-4" />} label="Avg Time to Hire" value="34d" sub="↓ 4d vs last quarter" tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 page-section">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-semibold">Open requisitions</div>
              <div className="text-xs text-muted-foreground">Prioritized by WorkGrid project staffing forecasts.</div>
            </div>
            <Link to="/requisitions" className="text-xs font-medium text-primary hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {requisitions.filter(r => r.status === "OPEN").map(r => (
              <Link to="/requisitions/$id" params={{ id: r.id }} key={r.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "var(--gradient-primary)" }}>
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.department} · {r.location} · <span className="font-mono">{r.id}</span> {r.workgridForecastId && <Pill tone="accent"><Sparkles className="h-3 w-3" /> WorkGrid linked</Pill>}</div>
                </div>
                <div className="hidden md:block text-xs text-muted-foreground">Hiring: {r.hiringManagerName}</div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{r.candidates}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">candidates</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="page-section">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="font-semibold">Upcoming interviews</div>
              <Link to="/interviews" className="text-xs font-medium text-primary hover:underline">All →</Link>
            </div>
            <div className="divide-y divide-border">
              {upcoming.slice(0, 4).map(i => {
                const c = candidates.find(x => x.id === i.candidateId);
                return (
                  <div key={i.id} className="p-3 flex items-center gap-3">
                    {c && <Avatar name={`${c.firstName} ${c.lastName}`} size={32} />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c?.firstName} {c?.lastName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{i.round} · {i.scheduledAt}</div>
                    </div>
                    <Pill tone={i.mode === "Video" ? "info" : i.mode === "Onsite" ? "primary" : "muted"}>{i.mode}</Pill>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="page-section">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2"><GitMerge className="h-4 w-4 text-primary" /> CoreHR handoff</div>
                <div className="text-[11px] text-muted-foreground">candidate.hired events</div>
              </div>
              <Link to="/conversion" className="text-xs font-medium text-primary hover:underline">Open →</Link>
            </div>
            <div className="divide-y divide-border">
              {conversionEvents.map(e => (
                <div key={e.id} className="p-3 flex items-center gap-3">
                  <Avatar name={e.candidateName} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.candidateName}</div>
                    <div className="text-[11px] text-muted-foreground truncate">→ <span className="font-mono">{e.newEmployeeId}</span> · {e.acceptedAt}</div>
                  </div>
                  <Pill tone="success">{e.status.replace("_"," ")}</Pill>
                </div>
              ))}
            </div>
          </div>

          <div className="page-section p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> WorkGrid staffing forecast</div>
            <div className="space-y-2">
              {staffingForecasts.slice(0, 3).map(f => (
                <div key={f.id} className="flex items-center gap-2 text-xs">
                  <Pill tone={f.priority === "HIGH" ? "destructive" : f.priority === "MEDIUM" ? "warning" : "muted"}>{f.priority}</Pill>
                  <div className="flex-1 truncate">{f.role} <span className="text-muted-foreground">· {f.project}</span></div>
                  <span className="text-muted-foreground tabular-nums">{f.estStart}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "primary"|"info"|"success"|"accent" }) {
  const bg: Record<string,string> = { primary: "var(--gradient-primary)", info: "var(--gradient-accent)", success: "var(--gradient-success)", accent: "var(--gradient-warning)" };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="stat-label">{label}</div>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: bg[tone] }}>{icon}</div>
      </div>
      <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

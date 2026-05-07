import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { interviews, candidateById, reqById } from "@/lib/ta-data";
import { Video, MapPin, Phone, ExternalLink, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/interviews")({
  head: () => ({ meta: [
    { title: "Interviews — HireFlow" },
    { name: "description", content: "Scheduled interviews, panel composition and structured scorecard status." },
  ]}),
  component: InterviewsPage,
});

const modeIcon = { Video: <Video className="h-3 w-3" />, Onsite: <MapPin className="h-3 w-3" />, Phone: <Phone className="h-3 w-3" /> } as const;

function InterviewsPage() {
  return (
    <AppShell>
      <PageHeader title="Interviews" description="Self-scheduling, calendar integration with CoreHR, and structured scorecards aggregated for hiring decisions." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {interviews.map(i => {
          const c = candidateById(i.candidateId)!;
          const r = reqById(i.reqId)!;
          const submitted = i.interviewers.filter(x => x.submitted).length;
          return (
            <div key={i.id} className="page-section p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={`${c.firstName} ${c.lastName}`} size={40} />
                  <div className="min-w-0">
                    <Link to="/candidates/$id" params={{ id: c.id }} className="font-semibold hover:text-primary truncate block">{c.firstName} {c.lastName}</Link>
                    <div className="text-xs text-muted-foreground truncate">{r.title} · <span className="font-mono">{r.id}</span></div>
                  </div>
                </div>
                <Pill tone={i.status === "SCHEDULED" ? "info" : i.status === "COMPLETED" ? "success" : "muted"}>{i.status}</Pill>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 mb-3">
                <div className="font-medium text-sm">{i.round}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                  <span>{i.scheduledAt}</span>
                  <span>· {i.durationMin} min</span>
                  <span className="inline-flex items-center gap-1">{modeIcon[i.mode]} {i.mode}</span>
                  {i.link && <a href={i.link} className="text-primary inline-flex items-center gap-1 hover:underline">Join <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Panel ({submitted}/{i.interviewers.length} scorecards)</div>
              <div className="space-y-1.5">
                {i.interviewers.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    {p.submitted ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <Avatar name={p.name} size={22} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.focus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
